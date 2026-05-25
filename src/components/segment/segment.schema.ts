import { z } from "zod";
import { apiSuccessSchema } from "@components/application/api.schema.ts";

export const segmentSchema = z.object({
  createdAt: z.string().trim().min(1),
  id: z.uuid({ version: `v7` }),
  label: z.string().trim().min(1),
  order: z.number().int().nonnegative(),
  required: z.boolean(),
  updatedAt: z.string().trim().min(1),
});

export const segmentListResponseDataSchema = z.array(segmentSchema);
export const segmentListResponseSchema = apiSuccessSchema(segmentListResponseDataSchema);

export const segmentResponseDataSchema = segmentSchema;
export const segmentResponseSchema = apiSuccessSchema(segmentResponseDataSchema);

export const segmentParamsSchema = z.object({
  id: z.uuid({ version: `v7` }),
});

export const createSegmentBodySchema = z.object({
  label: z.string().trim().min(1),
  order: z.number().int().nonnegative(),
  required: z.boolean(),
});

export const updateSegmentBodySchema = z
  .object({
    label: z.string().trim().min(1).optional(),
    order: z.number().int().nonnegative().optional(),
    required: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((fieldValue) => fieldValue !== undefined), {
    message: `At least one field must be provided.`,
  });

export const reorderSegmentBodySchema = z.object({
  direction: z.enum([`up`, `down`]),
});

export type Segment = z.infer<typeof segmentSchema>;
export type SegmentParams = z.infer<typeof segmentParamsSchema>;
export type CreateSegmentBody = z.infer<typeof createSegmentBodySchema>;
export type UpdateSegmentBody = z.infer<typeof updateSegmentBodySchema>;
export type ReorderSegmentBody = z.infer<typeof reorderSegmentBodySchema>;
export type SegmentListResponseData = z.infer<typeof segmentListResponseDataSchema>;
export type SegmentResponseData = z.infer<typeof segmentResponseDataSchema>;

export type SegmentRow = {
  createdAt: Date;
  id: string;
  label: string;
  order: number;
  required: boolean;
  updatedAt: Date;
};

export class SegmentNotFoundError extends Error {
  public readonly id: string;

  public constructor(id: string) {
    super(`Accounting segment ${id} was not found.`);
    this.name = `SegmentNotFoundError`;
    this.id = id;
  }
}

export class SegmentRequiredDeleteError extends Error {
  public readonly id: string;

  public constructor(id: string) {
    super(`Accounting segment ${id} is required and cannot be deleted.`);
    this.name = `SegmentRequiredDeleteError`;
    this.id = id;
  }
}
