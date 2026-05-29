import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { applyAccountTemplate, createMember, deleteMember, getAccountTemplates, getMembers, updateMember } from "./member.client.ts";
import type { CreateMemberBody, Member, UpdateMemberBody } from "./member.schema.ts";
type CreateMemberInput = Omit<CreateMemberBody, `segmentId`>;

export const useMembersQuery = (segmentId: string) =>
  useQuery({
    queryFn: async () => getMembers(segmentId),
    queryKey: [`members`, segmentId],
  });

export const useCreateMemberMutation = (segmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateMemberInput) => createMember(segmentId, body),
    onSuccess: async (createdMember) => {
      queryClient.setQueryData([`members`, segmentId], (current: Member[] | undefined) => {
        if (!current) {
          return [createdMember];
        }

        const nextMembers = [...current.filter((entry) => entry.id !== createdMember.id), createdMember];
        return nextMembers.sort((left, right) => left.code.localeCompare(right.code));
      });
      await queryClient.invalidateQueries({ queryKey: [`members`, segmentId] });
    },
  });
};

export const useUpdateMemberMutation = (segmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, id }: { id: string; body: UpdateMemberBody }) => updateMember(id, body),
    onSuccess: async (updatedMember) => {
      queryClient.setQueryData([`members`, segmentId], (current: Member[] | undefined) => {
        if (!current) {
          return [updatedMember];
        }

        const nextMembers = current.map((entry) => (entry.id === updatedMember.id ? updatedMember : entry));
        return nextMembers.sort((left, right) => left.code.localeCompare(right.code));
      });
      await queryClient.invalidateQueries({ queryKey: [`members`, segmentId] });
    },
  });
};

export const useDeleteMemberMutation = (segmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteMember(id),
    onSuccess: async (_, deletedId) => {
      queryClient.setQueryData([`members`, segmentId], (current: Member[] | undefined) => {
        if (!current) {
          return [];
        }

        return current.filter((entry) => entry.id !== deletedId);
      });
      await queryClient.invalidateQueries({ queryKey: [`members`, segmentId] });
    },
  });
};

export const useAccountTemplatesQuery = (segmentId: string) => useQuery({ queryFn: async () => getAccountTemplates(), queryKey: [`account-templates`, segmentId] });

export const useApplyAccountTemplateMutation = (segmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: string) => applyAccountTemplate(segmentId, templateId),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: [`members`, segmentId] }),
  });
};
