import { z } from "zod";
import { apiSuccessSchema } from "@components/application/api.schema.ts";

export const segmentTypeSchema = z.enum([`entity`, `account`, `customer`, `supplier`, `generic`]);

export const requiredSegmentDefinitions = [
  { id: `00000000-0000-7000-8000-000000000001`, label: `Entity`, order: 0, type: `entity` },
  { id: `00000000-0000-7000-8000-000000000002`, label: `Account`, order: 1, type: `account` },
  // Customer and Supplier are segment-domain anchors for future ERP Sales and Procurement integrations.
  { id: `00000000-0000-7000-8000-000000000003`, label: `Customer`, order: 2, type: `customer` },
  { id: `00000000-0000-7000-8000-000000000004`, label: `Supplier`, order: 3, type: `supplier` },
] as const satisfies ReadonlyArray<{ id: string; label: string; order: number; type: z.infer<typeof segmentTypeSchema> }>;

export const segmentSchema = z.object({
  createdAt: z.string().trim().min(1),
  id: z.uuid({ version: `v7` }),
  label: z.string().trim().min(1),
  order: z.number().int().nonnegative(),
  required: z.boolean(),
  type: segmentTypeSchema,
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
export type SegmentType = z.infer<typeof segmentTypeSchema>;
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
  type: SegmentType;
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

export class SegmentRequiredUpdateError extends Error {
  public readonly id: string;

  public constructor(id: string) {
    super(`Accounting segment ${id} is required and must remain required.`);
    this.name = `SegmentRequiredUpdateError`;
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
