import { z } from "zod";
import { apiSuccessSchema } from "@components/application/api.schema.ts";

export const accountMemberTypeSchema = z.enum([`expense`, `revenue`, `asset`, `liability`, `equity`]);
export const accountMemberReportingSchema = z.enum([`debit`, `credit`]);
const isoInstantStringSchema = z.iso.datetime({ offset: true });

export const memberSchema = z.object({
  id: z.uuid({ version: `v7` }),
  segment: z.uuid({ version: `v7` }),
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  parent: z.uuid({ version: `v7` }).nullable(),
  type: accountMemberTypeSchema.nullable().optional(),
  reporting: accountMemberReportingSchema.nullable().optional(),
  createdAt: isoInstantStringSchema,
  updatedAt: isoInstantStringSchema,
});

export const listMembersResponseSchema = apiSuccessSchema(z.array(memberSchema));
export const createMemberResponseSchema = apiSuccessSchema(memberSchema);
export const updateMemberResponseSchema = apiSuccessSchema(memberSchema);
export const deleteMemberResponseSchema = apiSuccessSchema(z.object({ deleted: z.literal(true) }));
export const memberIdParamsSchema = z.object({ id: z.uuid({ version: `v7` }) });
export const memberListQuerySchema = z.object({ segmentId: z.uuid({ version: `v7` }) });

export const memberEditorSchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  parent: z.uuid({ version: `v7` }).nullable(),
  type: accountMemberTypeSchema.nullable().optional(),
  reporting: accountMemberReportingSchema.nullable().optional(),
});
export const createMemberBodySchema = memberEditorSchema.extend({
  segmentId: z.uuid({ version: `v7` }),
});
export const updateMemberBodySchema = memberEditorSchema;

export const accountTemplateSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  source: z.enum([`embedded`, `public-dataset`]),
});

export const applyMemberTemplateBodySchema = z.object({
  segmentId: z.uuid({ version: `v7` }),
  templateId: z.string().trim().min(1),
});


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
export type UpdateMemberBody = z.infer<typeof updateMemberBodySchema>;
export type AccountTemplate = z.infer<typeof accountTemplateSchema>;
export type MemberEditor = z.infer<typeof memberEditorSchema>;

export type MemberRow = {
  createdAt: Date;
  id: string;
  segment: string;
  code: string;
  name: string;
  description: string;
  parent: string | null;
  type: MemberType | null;
  reporting: MemberReporting | null;
  updatedAt: Date;
};

export type MemberOwnershipRow = {
  id: string;
  segment: string;
  type: MemberType | null;
};
