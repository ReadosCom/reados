import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applyAccountTemplate, createMember, getAccountTemplates, getMembers, updateMember } from "./member.client.ts";
import type { CreateMemberBody, UpdateMemberBody } from "./member.schema.ts";

export const useMembersQuery = (segmentId: string) => useQuery({ queryFn: async () => getMembers(segmentId), queryKey: [`members`, segmentId] });

export const useCreateMemberMutation = (segmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateMemberBody) => createMember(segmentId, body),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: [`members`, segmentId] }),
  });
};

export const useUpdateMemberMutation = (segmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, id }: { id: string; body: UpdateMemberBody }) => updateMember(segmentId, id, body),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: [`members`, segmentId] }),
  });
};

export const useAccountTemplatesQuery = (segmentId: string) => useQuery({ queryFn: async () => getAccountTemplates(segmentId), queryKey: [`account-templates`, segmentId] });

export const useApplyAccountTemplateMutation = (segmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string) => applyAccountTemplate(segmentId, templateId),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: [`members`, segmentId] }),
  });
};
