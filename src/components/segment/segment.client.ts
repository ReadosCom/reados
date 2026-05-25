import { getErpServiceOrigin } from "@components/application/application.host.ts";

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

const root = getErpServiceOrigin();

/**
 * Fetches all accounting segments.
 */
export const getSegments = async (): Promise<Segment[]> => {
  const response = await fetch(`${root}/accounting/segment`, {
    credentials: `include`,
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
  const response = await fetch(`${root}/accounting/segment`, {
    body: JSON.stringify(parsedBody),
    credentials: `include`,
    headers: {
      "Content-Type": `application/json`,
    },
    method: `POST`,
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
  const response = await fetch(`${root}/accounting/segment/${encodeURIComponent(id)}`, {
    body: JSON.stringify(parsedBody),
    credentials: `include`,
    headers: {
      "Content-Type": `application/json`,
    },
    method: `PATCH`,
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
  const response = await fetch(`${root}/accounting/segment/${encodeURIComponent(id)}/reorder`, {
    body: JSON.stringify(parsedBody),
    credentials: `include`,
    headers: {
      "Content-Type": `application/json`,
    },
    method: `POST`,
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
  const response = await fetch(`${root}/accounting/segment/${encodeURIComponent(id)}`, {
    credentials: `include`,
    method: `DELETE`,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete accounting segment.`);
  }

  return segmentResponseSchema.parse(await response.json()).data;
};
