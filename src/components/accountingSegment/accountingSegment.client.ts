import { getErpServiceOrigin } from "@components/application/application.host.ts";

import {
  accountingSegmentListResponseSchema,
  accountingSegmentResponseSchema,
  createAccountingSegmentBodySchema,
  type AccountingSegment,
  type CreateAccountingSegmentBody,
  type UpdateAccountingSegmentBody,
  updateAccountingSegmentBodySchema,
} from "./accountingSegment.schema.ts";

const root = getErpServiceOrigin();

/**
 * Fetches all accounting segments.
 */
export const getAccountingSegments = async (): Promise<AccountingSegment[]> => {
  const response = await fetch(`${root}/accounting/segment`, {
    credentials: `include`,
  });

  if (!response.ok) {
    throw new Error(`Failed to load accounting segments.`);
  }

  return accountingSegmentListResponseSchema.parse(await response.json()).data;
};

/**
 * Creates one accounting segment.
 */
export const createAccountingSegment = async (body: CreateAccountingSegmentBody): Promise<AccountingSegment> => {
  const parsedBody = createAccountingSegmentBodySchema.parse(body);
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

  return accountingSegmentResponseSchema.parse(await response.json()).data;
};

/**
 * Updates one accounting segment.
 */
export const updateAccountingSegment = async (id: string, body: UpdateAccountingSegmentBody): Promise<AccountingSegment> => {
  const parsedBody = updateAccountingSegmentBodySchema.parse(body);
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

  return accountingSegmentResponseSchema.parse(await response.json()).data;
};

/**
 * Deletes one accounting segment.
 */
export const deleteAccountingSegment = async (id: string): Promise<AccountingSegment> => {
  const response = await fetch(`${root}/accounting/segment/${encodeURIComponent(id)}`, {
    credentials: `include`,
    method: `DELETE`,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete accounting segment.`);
  }

  return accountingSegmentResponseSchema.parse(await response.json()).data;
};
