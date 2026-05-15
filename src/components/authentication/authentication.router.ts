import express from 'express';

import { defineRoutes, getCorrelationId } from '@components/express/express.server.ts';

import { authenticationSessionCookieName, getLatestOtpForTesting, getSessionFromCookie, isAuthenticationTestEndpointEnabled, logoutSession, requestOtp, updateSessionProfile, verifyOtpAndCreateSession } from './authentication.controller.ts';
import { otpRequestBodySchema, otpTestQuerySchema, otpVerifyBodySchema, profileUpdateBodySchema, type ProfileUpdateBody } from './authentication.schema.ts';

/**
 * Defines authentication routes for OTP and session flows.
 */
export const authenticationRouter = express.Router();
const route = defineRoutes(authenticationRouter);

route({
  method: `post`,
  route: `/otp/request`,
  validators: {
    body: otpRequestBodySchema,
  },
  handler: async ({ body, fail, request, respond, response }) => {
    const { email } = body;

    try {
      const result = await requestOtp({
        correlationId: getCorrelationId(request, response),
        email,
      });

      respond(result);
    } catch (error) {
      fail({
        cause: error,
        code: `otp_request_failed`,
        logMessage: `Failed to request OTP for ${email}.`,
        message: `We could not request a verification code right now.`,
        status: 500,
      });
    }
  },
});

route({
  method: `post`,
  route: `/otp/verify`,
  validators: {
    body: otpVerifyBodySchema,
  },
  handler: async ({ body, fail, request, respond, response }) => {
    const { code, email } = body;
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
        fail({
          code: `otp_invalid_or_expired`,
          message: `The verification code is invalid or expired.`,
          status: 401,
        });
        return;
      }

      response.cookie(result.cookieName, result.sessionId, result.cookieOptions);
      respond({
        authenticated: true,
      });
    } catch (error) {
      fail({
        cause: error,
        code: `otp_verify_failed`,
        logMessage: `Failed to verify OTP for ${email}.`,
        message: `We could not verify the code right now.`,
        status: 500,
      });
    }
  },
});

route({
  method: `get`,
  route: `/session/me`,
  handler: async ({ fail, request, respond }) => {
    const session = await getSessionFromCookie({
      cookieHeader: request.header(`cookie`),
    });

    if (!session) {
      fail({
        code: `unauthenticated`,
        message: `Unauthenticated request.`,
        status: 401,
      });
      return;
    }

    respond({
      authenticated: true,
      session: session.sessionIdentity,
    });
  },
});

route({
  method: `post`,
  route: `/session/logout`,
  handler: async ({ fail, request, respond, response }) => {
    const session = await getSessionFromCookie({
      cookieHeader: request.header(`cookie`),
    });

    if (!session) {
      fail({
        code: `unauthenticated`,
        message: `Unauthenticated request.`,
        status: 401,
      });
      return;
    }

    try {
      await logoutSession({
        sessionId: session.sessionId,
      });
    } catch (error) {
      fail({
        cause: error,
        code: `logout_revoke_failed`,
        logMessage: `Failed to revoke session ${session.sessionId}.`,
        message: `We could not revoke the session right now.`,
        status: 500,
      });
      return;
    }

    response.clearCookie(authenticationSessionCookieName, {
      httpOnly: true,
      path: `/`,
      sameSite: `lax`,
    });

    respond({
      success: true,
    });
  },
});

route({
  method: `patch`,
  route: `/profile/me`,
  validators: {
    body: profileUpdateBodySchema,
  },
  handler: async ({ body, fail, request, respond }) => {
    const session = await getSessionFromCookie({
      cookieHeader: request.header(`cookie`),
    });

    if (!session) {
      fail({
        code: `unauthenticated`,
        message: `Unauthenticated request.`,
        status: 401,
      });
      return;
    }

    const profile = body as ProfileUpdateBody;
    const updatedProfile = await updateSessionProfile({
      profile,
      sessionId: session.sessionId,
    });

    if (!updatedProfile) {
      fail({
        code: `unauthenticated`,
        message: `Unauthenticated request.`,
        status: 401,
      });
      return;
    }

    respond({
      authenticated: true,
      session: updatedProfile,
    });
  },
});

if (isAuthenticationTestEndpointEnabled()) {
  route({
    method: `get`,
    route: `/test/otp/latest`,
    validators: {
      query: otpTestQuerySchema,
    },
    handler: async ({ fail, query, respond }) => {
      const { email } = query;
      const latestOtpCode = await getLatestOtpForTesting({ email });

      if (!latestOtpCode) {
        fail({
          code: `otp_not_found`,
          message: `No OTP found.`,
          status: 404,
        });
        return;
      }

      respond({
        code: latestOtpCode,
        found: true,
      });
    },
  });
}
