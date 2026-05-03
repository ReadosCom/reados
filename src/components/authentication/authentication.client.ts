import { getBrowserHostname, getBrowserProtocol } from '@components/app/app.browser.ts';
import { otpRequestBodySchema, otpRequestResponseSchema, otpTestResponseSchema, otpVerifyBodySchema, otpVerifyResponseSchema, sessionMeResponseSchema } from './authentication.schema.ts';

const getAuthenticationServiceOrigin = () => {
  const hostname = getBrowserHostname();
  const protocol = getBrowserProtocol();

  if (!hostname || !protocol) {
    throw new Error(`Authentication service origin could not be resolved from browser location.`);
  }

  return `${protocol}//authentication.${hostname}`;
};

/**
 * Requests an OTP code for tenant-scoped authentication.
 */
export const requestAuthenticationOtp = async (body: unknown) => {
  const parsedBody = otpRequestBodySchema.parse(body);
  const response = await fetch(`${getAuthenticationServiceOrigin()}/otp/request`, {
    body: JSON.stringify(parsedBody),
    credentials: `include`,
    headers: {
      'Content-Type': `application/json`,
    },
    method: `POST`,
  });

  if (!response.ok) {
    throw new Error(`Failed to request OTP.`);
  }

  return otpRequestResponseSchema.parse(await response.json());
};

/**
 * Verifies an OTP code and starts an authenticated session.
 */
export const verifyAuthenticationOtp = async (body: unknown) => {
  const parsedBody = otpVerifyBodySchema.parse(body);
  const response = await fetch(`${getAuthenticationServiceOrigin()}/otp/verify`, {
    body: JSON.stringify(parsedBody),
    credentials: `include`,
    headers: {
      'Content-Type': `application/json`,
    },
    method: `POST`,
  });

  if (!response.ok) {
    throw new Error(`Failed to verify OTP.`);
  }

  return otpVerifyResponseSchema.parse(await response.json());
};

/**
 * Retrieves the authenticated session state.
 */
export const getAuthenticationSession = async () => {
  const response = await fetch(`${getAuthenticationServiceOrigin()}/session/me`, {
    credentials: `include`,
  });

  if (!response.ok) {
    return {
      authenticated: false,
      session: null,
    };
  }

  return sessionMeResponseSchema.parse(await response.json());
};

/**
 * Logs out the current authenticated session.
 */
export const logoutAuthenticationSession = async () => {
  await fetch(`${getAuthenticationServiceOrigin()}/session/logout`, {
    credentials: `include`,
    method: `POST`,
  });
};

/**
 * Reads the latest OTP for e2e tests from the test-only transport endpoint.
 */
export const getLatestOtpForTesting = async ({ email }: { email: string }) => {
  const response = await fetch(`${getAuthenticationServiceOrigin()}/test/otp/latest?email=${encodeURIComponent(email)}`, {
    credentials: `include`,
  });

  if (!response.ok) {
    throw new Error(`Could not load the latest OTP for testing.`);
  }

  return otpTestResponseSchema.parse(await response.json());
};
