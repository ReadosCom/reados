import { z } from "zod";
import { apiSuccessSchema } from "@components/application/api.schema.ts";

export const accountingSegmentSchema = z.object({
  active: z.boolean(),
  createdAt: z.string().trim().min(1),
  id: z.uuid({ version: `v7` }),
  label: z.string().trim().min(1),
  order: z.number().int().nonnegative(),
  required: z.boolean(),
  updatedAt: z.string().trim().min(1),
});

export const accountingSegmentListResponseDataSchema = z.array(accountingSegmentSchema);
export const accountingSegmentListResponseSchema = apiSuccessSchema(accountingSegmentListResponseDataSchema);

export const accountingSegmentResponseDataSchema = accountingSegmentSchema;
export const accountingSegmentResponseSchema = apiSuccessSchema(accountingSegmentResponseDataSchema);

export const accountingSegmentParamsSchema = z.object({
  id: z.uuid({ version: `v7` }),
});

export const createAccountingSegmentBodySchema = z.object({
  active: z.boolean(),
  label: z.string().trim().min(1),
  order: z.number().int().nonnegative(),
  required: z.boolean(),
});

export const updateAccountingSegmentBodySchema = z
  .object({
    active: z.boolean().optional(),
    label: z.string().trim().min(1).optional(),
    order: z.number().int().nonnegative().optional(),
    required: z.boolean().optional(),
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

export type AccountingSegmentRow = {
  active: boolean;
  createdAt: Date;
  id: string;
  label: string;
  order: number;
  required: boolean;
  updatedAt: Date;
};

export class AccountingSegmentNotFoundError extends Error {
  public readonly id: string;

  public constructor(id: string) {
    super(`Accounting segment ${id} was not found.`);
    this.name = `AccountingSegmentNotFoundError`;
    this.id = id;
  }
}

export class AccountingSegmentRequiredDeleteError extends Error {
  public readonly id: string;

  public constructor(id: string) {
    super(`Accounting segment ${id} is required and cannot be deleted.`);
    this.name = `AccountingSegmentRequiredDeleteError`;
    this.id = id;
  }
}
