import { createModuleServer, getCorrelationId, validateRequestBody, validateRequestQuery } from '@components/express/express.server.ts';

import { authenticationSessionCookieName, getLatestOtpForTesting, getSessionFromCookie, isAuthenticationTestEndpointEnabled, logoutSession, requestOtp, updateSessionProfile, verifyOtpAndCreateSession } from './authentication.controller.ts';
import { otpRequestBodySchema, otpTestQuerySchema, otpVerifyBodySchema, profileUpdateBodySchema, type OtpRequestBody, type OtpTestQuery, type OtpVerifyBody, type ProfileUpdateBody } from './authentication.schema.ts';

/**
 * Creates the authentication server with OTP and session routes.
 */
export const createAuthenticationServer = () => {
  const app = createModuleServer({
    moduleName: `authentication`,
  });

  app.post(`/otp/request`, validateRequestBody(otpRequestBodySchema), async (request, response) => {
    const { email } = response.locals.validatedBody as OtpRequestBody;

    try {
      const result = await requestOtp({
        correlationId: getCorrelationId(request, response),
        email,
      });

      response.json(result);
    } catch (error) {
      console.error(`Failed to request OTP for ${email}.`, {
        correlationId: getCorrelationId(request, response),
        error,
      });
      response.status(500).json({
        message: `We could not request a verification code right now.`,
      });
    }
  });

  app.post(`/otp/verify`, validateRequestBody(otpVerifyBodySchema), async (request, response) => {
    const { code, email } = response.locals.validatedBody as OtpVerifyBody;
    const forwardedForHeader = request.header(`x-forwarded-for`);
    const ipAddress = forwardedForHeader ? (forwardedForHeader.split(`,`)[0]?.trim() ?? null) : (request.ip ?? null);

    try {
      const result = await verifyOtpAndCreateSession({
        code,
        email,
        hostHeader: request.header(`host`),
        ipAddress,
        userAgent: request.header(`user-agent`) ?? null,
      });

      if (!result.authenticated) {
        response.status(401).json({
          message: `The verification code is invalid or expired.`,
        });
        return;
      }

      response.cookie(result.cookieName, result.sessionId, result.cookieOptions);
      response.json({
        authenticated: true,
      });
    } catch (error) {
      console.error(`Failed to verify OTP for ${email}.`, {
        correlationId: getCorrelationId(request, response),
        error,
      });
      response.status(500).json({
        message: `We could not verify the code right now.`,
      });
    }
  });

  app.get(`/session/me`, async (request, response) => {
    const session = await getSessionFromCookie({
      cookieHeader: request.header(`cookie`),
    });

    if (!session) {
      response.status(401).json({
        message: `Unauthenticated request.`,
      });
      return;
    }

    response.json({
      authenticated: true,
      session: session.sessionIdentity,
    });
  });

  app.post(`/session/logout`, async (request, response) => {
    const session = await getSessionFromCookie({
      cookieHeader: request.header(`cookie`),
    });

    if (!session) {
      response.status(401).json({
        message: `Unauthenticated request.`,
      });
      return;
    }

    try {
      await logoutSession({
        sessionId: session.sessionId,
      });
    } catch (error) {
      console.error(`Failed to revoke session ${session.sessionId}.`, {
        correlationId: getCorrelationId(request, response),
        error,
      });
    }

    response.clearCookie(authenticationSessionCookieName, {
      httpOnly: true,
      path: `/`,
      sameSite: `lax`,
    });
    response.json({
      success: true,
    });
  });

  app.patch(`/profile/me`, validateRequestBody(profileUpdateBodySchema), async (request, response) => {
    const session = await getSessionFromCookie({
      cookieHeader: request.header(`cookie`),
    });

    if (!session) {
      response.status(401).json({
        message: `Unauthenticated request.`,
      });
      return;
    }

    const profile = response.locals.validatedBody as ProfileUpdateBody;
    const updatedProfile = await updateSessionProfile({
      profile,
      sessionId: session.sessionId,
    });

    if (!updatedProfile) {
      response.status(401).json({
        message: `Unauthenticated request.`,
      });
      return;
    }

    response.json({
      authenticated: true,
      session: updatedProfile,
    });
  });

  if (isAuthenticationTestEndpointEnabled()) {
    app.get(`/test/otp/latest`, validateRequestQuery(otpTestQuerySchema), async (_request, response) => {
      const { email } = response.locals.validatedQuery as OtpTestQuery;
      const latestOtpCode = await getLatestOtpForTesting({ email });

      if (!latestOtpCode) {
        response.status(404).json({
          message: `No OTP found.`,
        });
        return;
      }

      response.json({
        code: latestOtpCode,
        found: true,
      });
    });
  }

  return app;
};
