import { parseApiSuccess } from "@components/application/api.client.ts";
import { erpServiceDelete, erpServiceGet, erpServicePost, erpServicePut } from "@components/application/application.client.ts";
import { z } from "zod";
import { accountTemplateSchema, createMemberBodySchema, listMembersResponseSchema, memberSchema, updateMemberBodySchema, type AccountTemplate, type CreateMemberBody, type Member, type UpdateMemberBody } from "./member.schema.ts";
type CreateMemberInput = Omit<CreateMemberBody, `segmentId`>;

export const getMembers = async (segmentId: string): Promise<Member[]> => {
  const response = await erpServiceGet({ path: `/accounting/member?segmentId=${encodeURIComponent(segmentId)}` });
  if (!response.ok) throw new Error(`Failed to load segment members.`);
  const payload = await response.json();
  const parsed = listMembersResponseSchema.safeParse(payload);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const issuePath = firstIssue?.path.join(`.`) ?? `unknown`;
    const issueMessage = firstIssue?.message ?? `unknown parse error`;
    throw new Error(`Failed to parse members response at "${issuePath}": ${issueMessage}`);
  }

  return parsed.data.data;
};

export const createMember = async (segmentId: string, body: CreateMemberInput): Promise<Member> => {
  const parsedBody = createMemberBodySchema.parse({ ...body, segmentId });
  const response = await erpServicePost({ body: parsedBody, path: `/accounting/member` });
  if (!response.ok) throw new Error(`Failed to create segment member.`);
  return parseApiSuccess(await response.json(), memberSchema);
};

export const updateMember = async (id: string, body: UpdateMemberBody): Promise<Member> => {
  const parsedBody = updateMemberBodySchema.parse(body);
  const response = await erpServicePut({ body: parsedBody, path: `/accounting/member/${encodeURIComponent(id)}` });
  if (!response.ok) throw new Error(`Failed to update segment member.`);
  return parseApiSuccess(await response.json(), memberSchema);
};

export const deleteMember = async (id: string): Promise<{ deleted: boolean }> => {
  const response = await erpServiceDelete({ path: `/accounting/member/${encodeURIComponent(id)}` });
  if (!response.ok) throw new Error(`Failed to delete segment member.`);
  return parseApiSuccess(await response.json(), z.object({ deleted: z.boolean() }));
};

export const getAccountTemplates = async (): Promise<AccountTemplate[]> => {
  const response = await erpServiceGet({ path: `/accounting/member/templates` });
  if (!response.ok) throw new Error(`Failed to load account templates.`);
  return parseApiSuccess(await response.json(), z.array(accountTemplateSchema));
};

export const applyAccountTemplate = async (segmentId: string, templateId: string): Promise<{ applied: boolean }> => {
  const response = await erpServicePost({ body: { segmentId, templateId }, path: `/accounting/member/templates/apply` });
  if (!response.ok) throw new Error(`Failed to apply account template.`);
  return parseApiSuccess(await response.json(), z.object({ applied: z.boolean() }));
};
