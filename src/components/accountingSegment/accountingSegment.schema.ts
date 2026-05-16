import { z } from "zod";
import { apiSuccessSchema } from "@components/application/api.schema.ts";

export const accountingSegmentSourceSchema = z.enum([`system`, `custom`]);

export const accountingSegmentSchema = z.object({
  active: z.boolean(),
  createdAt: z.string().trim().min(1),
  id: z.uuid({ version: `v7` }),
  label: z.string().trim().min(1),
  order: z.number().int().nonnegative(),
  required: z.boolean(),
  source: accountingSegmentSourceSchema,
  updatedAt: z.string().trim().min(1),
});

export const accountingSegmentListResponseDataSchema = z.object({
  segments: z.array(accountingSegmentSchema),
});
export const accountingSegmentListResponseSchema = apiSuccessSchema(accountingSegmentListResponseDataSchema);

export const accountingSegmentResponseDataSchema = z.object({
  segment: accountingSegmentSchema,
});
export const accountingSegmentResponseSchema = apiSuccessSchema(accountingSegmentResponseDataSchema);

export const accountingSegmentParamsSchema = z.object({
  id: z.uuid({ version: `v7` }),
});

export const createAccountingSegmentBodySchema = z.object({
  active: z.boolean(),
  label: z.string().trim().min(1),
  order: z.number().int().nonnegative(),
  required: z.boolean(),
  source: accountingSegmentSourceSchema,
});

export const updateAccountingSegmentBodySchema = z
  .object({
    active: z.boolean().optional(),
    label: z.string().trim().min(1).optional(),
    order: z.number().int().nonnegative().optional(),
    required: z.boolean().optional(),
    source: accountingSegmentSourceSchema.optional(),
  })
  .refine((value) => Object.values(value).some((fieldValue) => fieldValue !== undefined), {
    message: `At least one field must be provided.`,
  });

export type AccountingSegment = z.infer<typeof accountingSegmentSchema>;
export type AccountingSegmentParams = z.infer<typeof accountingSegmentParamsSchema>;
export type CreateAccountingSegmentBody = z.infer<typeof createAccountingSegmentBodySchema>;
export type UpdateAccountingSegmentBody = z.infer<typeof updateAccountingSegmentBodySchema>;
export type AccountingSegmentListResponseData = z.infer<typeof accountingSegmentListResponseDataSchema>;
export type AccountingSegmentResponseData = z.infer<typeof accountingSegmentResponseDataSchema>;
