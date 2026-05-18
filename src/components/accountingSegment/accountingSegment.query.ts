import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createAccountingSegment, deleteAccountingSegment, getAccountingSegments, updateAccountingSegment } from "./accountingSegment.client.ts";
import type { CreateAccountingSegmentBody, UpdateAccountingSegmentBody } from "./accountingSegment.schema.ts";

const accountingSegmentQueryKey = [`accounting`, `segment`] as const;

/**
 * Returns accounting segments.
 */
export const useAccountingSegmentsQuery = () => {
  return useQuery({
    queryFn: getAccountingSegments,
    queryKey: accountingSegmentQueryKey,
  });
};

/**
 * Mutates create accounting segment.
 */
export const useCreateAccountingSegmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAccountingSegmentBody) => createAccountingSegment(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountingSegmentQueryKey });
    },
  });
};

/**
 * Mutates update accounting segment.
 */
export const useUpdateAccountingSegmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body, id }: { body: UpdateAccountingSegmentBody; id: string }) => updateAccountingSegment(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountingSegmentQueryKey });
    },
  });
};

/**
 * Mutates delete accounting segment.
 */
export const useDeleteAccountingSegmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAccountingSegment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: accountingSegmentQueryKey });
    },
  });
};
