import "zod-openapi";
import { z } from "zod";
import { apiSuccessSchema } from "@components/application/api.schema.ts";

export const authenticationEmailSchema = z.string().check(z.trim(), z.email(`Enter a valid email address.`), z.toLowerCase()).meta({
  description: `User email address used for OTP authentication.`,
  id: `AuthenticationEmail`,
});

export const profileLanguageSchema = z.enum([`en`, `tr`, `de`, `es`, `fr`, `it`, `pt`, `nl`, `pl`]).meta({
  description: `Preferred language for the current user profile.`,
  id: `ProfileLanguage`,
});

export const profileNameSchema = z.string().trim().min(1);
export const profileMiddleNameSchema = z
  .union([z.string(), z.null()])
  .transform((value) => (typeof value === `string` ? value.trim() : null))
  .transform((value) => (value ? value : null));

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

export const otpRequestResponseDataSchema = z
  .object({
    message: z.string().trim().min(1),
  })
  .meta({
    id: `OtpRequestResponse`,
  });
export const otpRequestResponseSchema = apiSuccessSchema(otpRequestResponseDataSchema);

export const otpVerifyResponseDataSchema = z
  .object({
    authenticated: z.literal(true),
  })
  .meta({
    id: `OtpVerifyResponse`,
  });
export const otpVerifyResponseSchema = apiSuccessSchema(otpVerifyResponseDataSchema);

export const sessionIdentitySchema = z
  .object({
    displayName: z.string().trim().min(1),
    email: authenticationEmailSchema,
    firstName: profileNameSchema,
    language: profileLanguageSchema,
    lastName: profileNameSchema,
    middleName: z.string().nullable(),
  })
  .meta({
    id: `SessionIdentity`,
  });

export const sessionMeResponseDataSchema = z
  .object({
    authenticated: z.boolean(),
    session: sessionIdentitySchema.nullable(),
  })
  .meta({
    id: `SessionMeResponse`,
  });
export const sessionMeResponseSchema = apiSuccessSchema(sessionMeResponseDataSchema);

export const logoutResponseDataSchema = z
  .object({
    success: z.literal(true),
  })
  .meta({
    id: `LogoutResponse`,
  });
export const logoutResponseSchema = apiSuccessSchema(logoutResponseDataSchema);

export const profileEditableSchema = z
  .object({
    displayName: profileNameSchema,
    firstName: profileNameSchema,
    language: profileLanguageSchema,
    lastName: profileNameSchema,
    middleName: z.string().trim(),
  })
  .meta({
    id: `ProfileEditable`,
  });

export const profileUpdateBodySchema = z
  .object({
    displayName: profileEditableSchema.shape.displayName.optional(),
    firstName: profileEditableSchema.shape.firstName.optional(),
    language: profileEditableSchema.shape.language.optional(),
    lastName: profileEditableSchema.shape.lastName.optional(),
    middleName: profileMiddleNameSchema.optional(),
  })
  .refine((value) => Object.values(value).some((fieldValue) => fieldValue !== undefined), {
    message: `At least one profile field must be provided.`,
  })
  .meta({
    id: `ProfileUpdateBody`,
  });

export const otpTestQuerySchema = z.object({
  email: authenticationEmailSchema,
});

export const otpTestResponseDataSchema = z.object({
  code: otpCodeSchema,
  found: z.literal(true),
});
export const otpTestResponseSchema = apiSuccessSchema(otpTestResponseDataSchema);

export type OtpRequestBody = z.infer<typeof otpRequestBodySchema>;
export type OtpVerifyBody = z.infer<typeof otpVerifyBodySchema>;
export type OtpRequestResponseData = z.infer<typeof otpRequestResponseDataSchema>;
export type OtpRequestResponse = z.infer<typeof otpRequestResponseSchema>;
export type OtpVerifyResponseData = z.infer<typeof otpVerifyResponseDataSchema>;
export type OtpVerifyResponse = z.infer<typeof otpVerifyResponseSchema>;
export type SessionIdentity = z.infer<typeof sessionIdentitySchema>;
export type SessionMeResponseData = z.infer<typeof sessionMeResponseDataSchema>;
export type SessionMeResponse = z.infer<typeof sessionMeResponseSchema>;
export type LogoutResponseData = z.infer<typeof logoutResponseDataSchema>;
export type LogoutResponse = z.infer<typeof logoutResponseSchema>;
export type ProfileEditable = z.infer<typeof profileEditableSchema>;
export type ProfileUpdateBody = z.infer<typeof profileUpdateBodySchema>;
export type OtpTestQuery = z.infer<typeof otpTestQuerySchema>;
export type OtpTestResponseData = z.infer<typeof otpTestResponseDataSchema>;
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
