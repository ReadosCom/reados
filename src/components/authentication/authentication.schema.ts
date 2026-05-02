import 'zod-openapi';
import { z } from 'zod';

export const authenticationEmailSchema = z.string().check(z.trim(), z.email(`Enter a valid email address.`), z.toLowerCase()).meta({
  description: `User email address used for OTP authentication.`,
  id: `AuthenticationEmail`,
});

export const otpCodeSchema = z
  .string()
  .check(z.trim(), z.regex(/^\d{6}$/u, `Enter the 6-digit code.`))
  .meta({
    description: `A six digit one-time passcode.`,
    id: `OtpCode`,
  });

export const otpRequestBodySchema = z
  .object({
    email: authenticationEmailSchema,
  })
  .meta({
    id: `OtpRequestBody`,
  });

export const otpVerifyBodySchema = z
  .object({
    code: otpCodeSchema,
    email: authenticationEmailSchema,
  })
  .meta({
    id: `OtpVerifyBody`,
  });

export const otpRequestResponseSchema = z
  .object({
    message: z.string().trim().min(1),
  })
  .meta({
    id: `OtpRequestResponse`,
  });

export const otpVerifyResponseSchema = z
  .object({
    authenticated: z.literal(true),
  })
  .meta({
    id: `OtpVerifyResponse`,
  });

export const sessionIdentitySchema = z
  .object({
    userEmail: authenticationEmailSchema,
  })
  .meta({
    id: `SessionIdentity`,
  });

export const sessionMeResponseSchema = z
  .object({
    authenticated: z.boolean(),
    session: sessionIdentitySchema.nullable(),
  })
  .meta({
    id: `SessionMeResponse`,
  });

export const logoutResponseSchema = z
  .object({
    success: z.literal(true),
  })
  .meta({
    id: `LogoutResponse`,
  });

export const otpTestQuerySchema = z.object({
  email: authenticationEmailSchema,
});

export const otpTestResponseSchema = z.object({
  code: otpCodeSchema,
  found: z.literal(true),
});

export type OtpRequestBody = z.infer<typeof otpRequestBodySchema>;
export type OtpVerifyBody = z.infer<typeof otpVerifyBodySchema>;
export type OtpRequestResponse = z.infer<typeof otpRequestResponseSchema>;
export type OtpVerifyResponse = z.infer<typeof otpVerifyResponseSchema>;
export type SessionIdentity = z.infer<typeof sessionIdentitySchema>;
export type SessionMeResponse = z.infer<typeof sessionMeResponseSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
export type OtpTestQuery = z.infer<typeof otpTestQuerySchema>;
export type OtpTestResponse = z.infer<typeof otpTestResponseSchema>;

export type OtpChallengeRow = {
  expiresAt: Date;
  id: string;
  remainingAttempt: number;
};

export type SessionRow = {
  expiresAt: Date;
  id: string;
  userEmail: string;
};

export type OtpEmailPayload = {
  code: string;
  correlationId: string;
  recipientEmail: string;
};

export type RequestOtpParams = {
  correlationId: string;
  email: string;
};

export type VerifyOtpParams = {
  code: string;
  email: string;
};

export type CreateSessionParams = {
  ipAddress: string | null;
  userAgent: string | null;
  userEmail: string;
};

export type VerifyOtpResult = {
  verified: boolean;
};

export type OtpTestCapture = {
  code: string;
  createdAt: Date;
};
