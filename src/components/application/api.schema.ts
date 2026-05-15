import { z } from "zod";

export const apiErrorDetailSchema = z.unknown();

export const apiErrorSchema = z.object({
  code: z.string().trim().min(1),
  correlationId: z.string().trim().min(1),
  details: apiErrorDetailSchema.optional(),
  message: z.string().trim().min(1),
});

export const apiErrorResponseSchema = z.object({
  error: apiErrorSchema,
  success: z.literal(false),
});

export const apiSuccessSchema = <Schema extends z.ZodType>(dataSchema: Schema) =>
  z.object({
    data: dataSchema,
    success: z.literal(true),
  });

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
