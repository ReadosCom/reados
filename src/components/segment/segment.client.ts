import { erpServiceDelete, erpServiceGet, erpServicePatch, erpServicePost } from "@components/application/application.client.ts";

import {
  segmentListResponseSchema,
  segmentResponseSchema,
  createSegmentBodySchema,
  type Segment,
  type CreateSegmentBody,
  type ReorderSegmentBody,
  type UpdateSegmentBody,
  reorderSegmentBodySchema,
  updateSegmentBodySchema,
} from "./segment.schema.ts";

/**
 * Fetches all accounting segments.
 */
export const getSegments = async (): Promise<Segment[]> => {
  const response = await erpServiceGet({
    path: `/accounting/segment`,
  });

  if (!response.ok) {
    throw new Error(`Failed to load accounting segments.`);
  }

  return segmentListResponseSchema.parse(await response.json()).data;
};

/**
 * Creates one accounting segment.
 */
export const createSegment = async (body: CreateSegmentBody): Promise<Segment> => {
  const parsedBody = createSegmentBodySchema.parse(body);
  const response = await erpServicePost({
    body: parsedBody,
    path: `/accounting/segment`,
  });

  if (!response.ok) {
    throw new Error(`Failed to create accounting segment.`);
  }

  return segmentResponseSchema.parse(await response.json()).data;
};

/**
 * Updates one accounting segment.
 */
export const updateSegment = async (id: string, body: UpdateSegmentBody): Promise<Segment> => {
  const parsedBody = updateSegmentBodySchema.parse(body);
  const response = await erpServicePatch({
    body: parsedBody,
    path: `/accounting/segment/${encodeURIComponent(id)}`,
  });

  if (!response.ok) {
    throw new Error(`Failed to update accounting segment.`);
  }

  return segmentResponseSchema.parse(await response.json()).data;
};

/**
 * Reorders one accounting segment by direction.
 */
export const reorderSegment = async (id: string, body: ReorderSegmentBody): Promise<Segment> => {
  const parsedBody = reorderSegmentBodySchema.parse(body);
  const response = await erpServicePost({
    body: parsedBody,
    path: `/accounting/segment/${encodeURIComponent(id)}/reorder`,
  });

  if (!response.ok) {
    throw new Error(`Failed to reorder accounting segment.`);
  }

  return segmentResponseSchema.parse(await response.json()).data;
};

/**
 * Deletes one accounting segment.
 */
export const deleteSegment = async (id: string): Promise<Segment> => {
  const response = await erpServiceDelete({
    path: `/accounting/segment/${encodeURIComponent(id)}`,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete accounting segment.`);
  }

  return segmentResponseSchema.parse(await response.json()).data;
};
