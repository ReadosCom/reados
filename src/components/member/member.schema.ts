import { z } from "zod";
import { apiSuccessSchema } from "@components/application/api.schema.ts";

export const accountMemberTypeSchema = z.enum([`expense`, `revenue`, `asset`, `liability`]);
export const accountMemberReportingSchema = z.enum([`debit`, `credit`]);

export const memberSchema = z.object({
  id: z.uuid({ version: `v7` }),
  segment: z.uuid({ version: `v7` }),
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  parent: z.uuid({ version: `v7` }).nullable(),
  type: accountMemberTypeSchema.nullable(),
  reporting: accountMemberReportingSchema.nullable(),
  createdAt: z.string().trim().min(1),
  updatedAt: z.string().trim().min(1),
});

export const listMembersResponseSchema = apiSuccessSchema(z.array(memberSchema));
export const memberParamsSchema = z.object({ segmentId: z.uuid({ version: `v7` }), id: z.uuid({ version: `v7` }) });
export const memberSegmentParamsSchema = z.object({ segmentId: z.uuid({ version: `v7` }) });

export const createMemberBodySchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  parent: z.uuid({ version: `v7` }).nullable(),
  type: accountMemberTypeSchema.optional(),
  reporting: accountMemberReportingSchema.optional(),
});

export const accountTemplateSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  source: z.enum([`embedded`, `public-dataset`]),
});

export const applyAccountTemplateBodySchema = z.object({ templateId: z.string().trim().min(1) });


export const accountTemplateMemberSchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  parentCode: z.string().trim().min(1).nullable(),
  type: accountMemberTypeSchema,
});

export const accountTemplateDocumentSchema = accountTemplateSchema.extend({
  members: z.array(accountTemplateMemberSchema).min(1),
});

export class MemberValidationError extends Error {}

export type MemberType = z.infer<typeof accountMemberTypeSchema>;
export type MemberReporting = z.infer<typeof accountMemberReportingSchema>;
export type Member = z.infer<typeof memberSchema>;
export type CreateMemberBody = z.infer<typeof createMemberBodySchema>;
export type AccountTemplate = z.infer<typeof accountTemplateSchema>;
