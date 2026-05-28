import { erpServiceGet, erpServicePost } from "@components/application/application.client.ts";
import { parseApiSuccess } from "@components/application/api.client.ts";
import { z } from "zod";
import { accountTemplateSchema, createMemberBodySchema, memberSchema, type AccountTemplate, type CreateMemberBody, type Member } from "./member.schema.ts";

export const getMembers = async (segmentId: string): Promise<Member[]> => {
  const response = await erpServiceGet({ path: `/accounting/segment/${encodeURIComponent(segmentId)}/members` });
  if (!response.ok) throw new Error(`Failed to load segment members.`);
  return parseApiSuccess(await response.json(), z.array(memberSchema));
};

export const createMember = async (segmentId: string, body: CreateMemberBody): Promise<Member> => {
  const parsedBody = createMemberBodySchema.parse(body);
  const response = await erpServicePost({ body: parsedBody, path: `/accounting/segment/${encodeURIComponent(segmentId)}/members` });
  if (!response.ok) throw new Error(`Failed to create segment member.`);
  return parseApiSuccess(await response.json(), memberSchema);
};

export const getAccountTemplates = async (segmentId: string): Promise<AccountTemplate[]> => {
  const response = await erpServiceGet({ path: `/accounting/segment/${encodeURIComponent(segmentId)}/members/templates` });
  if (!response.ok) throw new Error(`Failed to load account templates.`);
  return parseApiSuccess(await response.json(), z.array(accountTemplateSchema));
};

export const applyAccountTemplate = async (segmentId: string, templateId: string): Promise<{ applied: boolean }> => {
  const response = await erpServicePost({ body: { templateId }, path: `/accounting/segment/${encodeURIComponent(segmentId)}/members/templates/apply` });
  if (!response.ok) throw new Error(`Failed to apply account template.`);
  return parseApiSuccess(await response.json(), z.object({ applied: z.boolean() }));
};
