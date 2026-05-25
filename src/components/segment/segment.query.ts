import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createSegment, deleteSegment, getSegments, updateSegment } from "./segment.client.ts";
import type { CreateSegmentBody, UpdateSegmentBody } from "./segment.schema.ts";

const segmentQueryKey = [`accounting`, `segment`] as const;

/**
 * Returns accounting segments.
 */
export const useSegmentsQuery = () => {
  return useQuery({
    queryFn: getSegments,
    queryKey: segmentQueryKey,
  });
};

/**
 * Mutates create accounting segment.
 */
export const useCreateSegmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateSegmentBody) => createSegment(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: segmentQueryKey });
    },
  });
};

/**
 * Mutates update accounting segment.
 */
export const useUpdateSegmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ body, id }: { body: UpdateSegmentBody; id: string }) => updateSegment(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: segmentQueryKey });
    },
  });
};

/**
 * Mutates delete accounting segment.
 */
export const useDeleteSegmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSegment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: segmentQueryKey });
    },
  });
};
