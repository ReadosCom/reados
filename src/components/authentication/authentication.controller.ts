import { createHmac, randomInt } from 'node:crypto';

import nodemailer from 'nodemailer';

import { ensurePool } from '@components/postgres/pool.ts';
import type { CreateSessionParams, OtpChallengeRow, OtpEmailPayload, OtpTestCapture, OtpVerifyBody, RequestOtpParams, SessionIdentity, SessionRow, VerifyOtpParams, VerifyOtpResult } from './authentication.schema.ts';

const genericOtpRequestMessage = `If this account is eligible, we sent a verification code.`;
const otpTimeToLiveMinutes = 10;
const otpMaximumAttemptCount = 5;
const sessionDurationHours = 12;
const sessionCookieName = `readosSession`;
export const authenticationSessionCookieName = sessionCookieName;
const pool = ensurePool();

const otpTestStore = new Map<string, OtpTestCapture>();

const getOtpCaptureKey = (email: string) => email.toLowerCase();

const getOtpHashSecret = () => process.env.OTP_HASH_SECRET?.trim() || `reados-local-otp-secret`;

const hashOtp = ({ code, email }: { code: string; email: string }) => createHmac(`sha256`, getOtpHashSecret()).update(`${email.toLowerCase()}:${code}`).digest(`hex`);

const generateOtpCode = () => randomInt(100000, 1000000).toString();

const isTestEmailTransportEnabled = () => process.env.NODE_ENV === `test` || process.env.COVERAGE === `true` || process.env.AUTHENTICATION_EMAIL_TRANSPORT === `test`;

const parseBooleanEnvironmentVariable = (value: string | undefined) => value?.trim().toLowerCase() === `true`;

const getSmtpTransporter = () => {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const password = process.env.SMTP_PASSWORD?.trim();
  const portValue = process.env.SMTP_PORT?.trim();
  const username = process.env.SMTP_USER?.trim();

  if (!host || !from || !password || !portValue || !username) {
    throw new Error(`SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and SMTP_FROM must be configured for OTP email delivery.`);
  }

  const port = Number(portValue);

  if (Number.isNaN(port)) {
    throw new Error(`SMTP_PORT must be a valid number.`);
  }

  return nodemailer.createTransport({
    auth: {
      pass: password,
      user: username,
    },
    host,
    port,
    secure: parseBooleanEnvironmentVariable(process.env.SMTP_SECURE),
  });
};

const sendOtpEmail = async ({ code, correlationId, recipientEmail }: OtpEmailPayload) => {
  if (isTestEmailTransportEnabled()) {
    otpTestStore.set(getOtpCaptureKey(recipientEmail), {
      code,
      createdAt: new Date(),
    });
    return;
  }

  const from = process.env.SMTP_FROM?.trim();

  if (!from) {
    throw new Error(`SMTP_FROM must be configured for OTP email delivery.`);
  }

  const transporter = getSmtpTransporter();

  await transporter.sendMail({
    from,
    headers: {
      'x-correlation-id': correlationId,
    },
    html: `<p>Your Reados verification code is <strong>${code}</strong>. It expires in ${otpTimeToLiveMinutes} minutes.</p>`,
    subject: `Your Reados verification code`,
    text: `Your Reados verification code is ${code}. It expires in ${otpTimeToLiveMinutes} minutes.`,
    to: recipientEmail,
  });
};

const isKnownAuthenticationUser = async ({ email }: { email: string }) => {
  const result = await pool.query<{ email: string }>(
    `
      SELECT "email"
      FROM "user"
      WHERE "email" = $1
      LIMIT 1;
    `,
    [email],
  );

  return (result.rowCount ?? 0) > 0;
};

const clearInactiveChallenges = async ({ email }: { email: string }) => {
  await pool.query(
    `
      DELETE FROM "otp"
      WHERE "user" = $1
        AND ("expiresAt" <= statement_timestamp() OR "remainingAttempt" <= 0);
    `,
    [email],
  );
};

const hasActiveChallenge = async ({ email }: { email: string }) => {
  const result = await pool.query<{ id: string }>(
    `
      SELECT "id"
      FROM "otp"
      WHERE "user" = $1
        AND "expiresAt" > statement_timestamp()
        AND "remainingAttempt" > 0
      LIMIT 1;
    `,
    [email],
  );

  return (result.rowCount ?? 0) > 0;
};

const requestOtpChallenge = async ({ correlationId, email }: RequestOtpParams) => {
  const isKnownUser = await isKnownAuthenticationUser({ email });

  if (!isKnownUser) {
    return;
  }

  await clearInactiveChallenges({ email });
  const hasExistingActiveChallenge = await hasActiveChallenge({ email });

  if (hasExistingActiveChallenge) {
    return;
  }

  const code = generateOtpCode();
  const hash = hashOtp({ code, email });

  await pool.query(
    `
      INSERT INTO "otp" (
        "user",
        "hash",
        "expiresAt",
        "remainingAttempt"
      )
      VALUES ($1, $2, statement_timestamp() + interval '10 minutes', $3);
    `,
    [email, hash, otpMaximumAttemptCount],
  );

  await sendOtpEmail({
    code,
    correlationId,
    recipientEmail: email,
  });
};

const verifyOtpChallenge = async ({ code, email }: VerifyOtpParams): Promise<VerifyOtpResult> => {
  const challengeResult = await pool.query<OtpChallengeRow>(
    `
      SELECT
        "id",
        "expiresAt",
        "remainingAttempt"
      FROM "otp"
      WHERE "user" = $1
      ORDER BY "createdAt" DESC
      LIMIT 1;
    `,
    [email],
  );
  const challenge = challengeResult.rows[0];

  if (!challenge) {
    return {
      verified: false,
    };
  }

  if (challenge.remainingAttempt <= 0 || challenge.expiresAt.getTime() <= Date.now()) {
    await pool.query(
      `
        DELETE FROM "otp"
        WHERE "id" = $1;
      `,
      [challenge.id],
    );

    return {
      verified: false,
    };
  }

  const submittedCodeHash = hashOtp({ code, email });
  const isCodeValidResult = await pool.query<{ id: string }>(
    `
      SELECT "id"
      FROM "otp"
      WHERE "id" = $1
        AND "hash" = $2
        AND "remainingAttempt" > 0
        AND "expiresAt" > statement_timestamp()
      LIMIT 1;
    `,
    [challenge.id, submittedCodeHash],
  );

  if ((isCodeValidResult.rowCount ?? 0) > 0) {
    await pool.query(
      `
        DELETE FROM "otp"
        WHERE "id" = $1;
      `,
      [challenge.id],
    );

    return {
      verified: true,
    };
  }

  const decrementAttemptResult = await pool.query<{ remainingAttempt: number }>(
    `
      UPDATE "otp"
      SET
        "remainingAttempt" = CASE
          WHEN "id" = $1
            AND "remainingAttempt" > 0
            AND "expiresAt" > statement_timestamp()
          THEN "remainingAttempt" - 1
          ELSE "remainingAttempt"
        END
      WHERE "id" = $1
      RETURNING "remainingAttempt";
    `,
    [challenge.id],
  );

  if ((decrementAttemptResult.rowCount ?? 0) === 0) {
    return {
      verified: false,
    };
  }

  if ((decrementAttemptResult.rows[0]?.remainingAttempt ?? 0) <= 0) {
    await pool.query(
      `
        DELETE FROM "otp"
        WHERE "id" = $1;
      `,
      [challenge.id],
    );
  }

  return {
    verified: false,
  };
};

const createAuthenticationSession = async ({ ipAddress, userAgent, userEmail }: CreateSessionParams) => {
  const result = await pool.query<SessionRow>(
    `
      INSERT INTO "session" (
        "user",
        "userAgent",
        "ipAddress",
        "expiresAt"
      )
      VALUES ($1, $2, $3, statement_timestamp() + interval '12 hours')
      RETURNING "id", "user" AS "userEmail", "expiresAt";
    `,
    [userEmail, userAgent, ipAddress],
  );
  const createdSession = result.rows[0];

  if (!createdSession) {
    throw new Error(`Could not create authentication session.`);
  }

  return createdSession;
};

const getActiveSession = async ({ sessionId }: { sessionId: string }): Promise<SessionIdentity | null> => {
  const result = await pool.query<SessionIdentity>(
    `
      SELECT
        "user" AS "userEmail"
      FROM "session"
      WHERE "id" = $1
        AND "revokedAt" IS NULL
        AND "expiresAt" > statement_timestamp()
      LIMIT 1;
    `,
    [sessionId],
  );

  return result.rows[0] ?? null;
};

const revokeSession = async ({ sessionId }: { sessionId: string }) => {
  await pool.query(
    `
      UPDATE "session"
      SET "revokedAt" = statement_timestamp()
      WHERE "id" = $1
        AND "revokedAt" IS NULL;
    `,
    [sessionId],
  );
};

const getSessionCookieConfiguration = (hostHeader: string | undefined, expiresAt: Date) => ({
  expires: expiresAt,
  httpOnly: true,
  path: `/`,
  sameSite: `lax` as const,
  secure: Boolean(hostHeader && !hostHeader.toLowerCase().includes(`localhost`)),
});

const getSessionIdFromCookieHeader = (cookieHeader: string | undefined) => {
  if (!cookieHeader) {
    return null;
  }

  const pairs = cookieHeader.split(`;`);

  for (const pair of pairs) {
    const [name, ...valueParts] = pair.trim().split(`=`);

    if (name === sessionCookieName) {
      return valueParts.join(`=`) || null;
    }
  }

  return null;
};

const getLatestTestOtpCode = ({ email }: { email: string }) => {
  const capture = otpTestStore.get(getOtpCaptureKey(email));

  return capture?.code ?? null;
};

export const isAuthenticationTestTransportEnabled = () => isTestEmailTransportEnabled();

export const requestOtp = async ({ correlationId, email }: RequestOtpParams) => {
  await requestOtpChallenge({ correlationId, email });

  return {
    message: genericOtpRequestMessage,
  };
};

export const verifyOtpAndCreateSession = async ({ code, email, hostHeader, ipAddress, userAgent }: OtpVerifyBody & { hostHeader: string | undefined; ipAddress: string | null; userAgent: string | null }) => {
  const verification = await verifyOtpChallenge({
    code,
    email,
  });

  if (!verification.verified) {
    return {
      authenticated: false as const,
      reason: `invalid_or_expired`,
    };
  }

  const createdSession = await createAuthenticationSession({
    ipAddress,
    userAgent,
    userEmail: email,
  });

  return {
    authenticated: true as const,
    cookieName: sessionCookieName,
    cookieOptions: getSessionCookieConfiguration(hostHeader, createdSession.expiresAt),
    sessionId: createdSession.id,
  };
};

export const getSessionFromCookie = async ({ cookieHeader }: { cookieHeader: string | undefined }) => {
  const sessionId = getSessionIdFromCookieHeader(cookieHeader);

  if (!sessionId) {
    return null;
  }

  const sessionIdentity = await getActiveSession({
    sessionId,
  });

  if (!sessionIdentity) {
    return null;
  }

  return {
    sessionId,
    sessionIdentity,
  };
};

export const logoutSession = async ({ sessionId }: { sessionId: string }) => {
  await revokeSession({
    sessionId,
  });
};

export const getLatestOtpForTesting = ({ email }: { email: string }) => getLatestTestOtpCode({ email });

/**
 * Returns OTP session constants for diagnostics and tests.
 */
export const getAuthenticationPolicy = () => ({
  otpMaximumAttemptCount,
  otpTimeToLiveMinutes,
  sessionDurationHours,
});
