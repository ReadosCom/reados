import { Router } from "express";

import { defineRoutes } from "@components/express/express.router.ts";
import { ensurePool } from "@components/postgres/pool.ts";

import { createAccountingSegment, deleteAccountingSegment, getAccountingSegmentById, listAccountingSegments, updateAccountingSegment } from "./accountingSegment.controller.ts";
import {
  AccountingSegmentNotFoundError,
  AccountingSegmentRequiredDeleteError,
  accountingSegmentParamsSchema,
  createAccountingSegmentBodySchema,
  updateAccountingSegmentBodySchema,
} from "./accountingSegment.schema.ts";

const pool = ensurePool();

/**
 * Accounting segment routes.
 */
export const accountingSegmentRouter = Router();
const route = defineRoutes(accountingSegmentRouter);

route({
  method: `get`,
  route: `/`,
  handler: async ({ fail, respond }) => {
    try {
      const segments = await listAccountingSegments(pool);
      respond(segments);
    } catch (error) {
      fail({
        cause: error,
        code: `accounting_segment_list_failed`,
        logMessage: `Failed to list accounting segments.`,
        message: `We could not load accounting segments right now.`,
        status: 500,
      });
    }
  },
});

route({
  method: `get`,
  route: `/:id`,
  validators: {
    params: accountingSegmentParamsSchema,
  },
  handler: async ({ fail, params, respond }) => {
    try {
      const segment = await getAccountingSegmentById(pool, params.id);
      respond(segment);
    } catch (error) {
      if (error instanceof AccountingSegmentNotFoundError) {
        fail({
          code: `accounting_segment_not_found`,
          message: `Accounting segment was not found.`,
          status: 404,
        });
        return;
      }

      fail({
        cause: error,
        code: `accounting_segment_fetch_failed`,
        logMessage: `Failed to fetch accounting segment ${params.id}.`,
        message: `We could not load the accounting segment right now.`,
        status: 500,
      });
    }
  },
});

route({
  method: `post`,
  route: `/`,
  validators: {
    body: createAccountingSegmentBodySchema,
  },
  handler: async ({ body, fail, respond }) => {
    try {
      const segment = await createAccountingSegment(pool, body);
      respond(segment, 201);
    } catch (error) {
      fail({
        cause: error,
        code: `accounting_segment_create_failed`,
        logMessage: `Failed to create accounting segment.`,
        message: `We could not create the accounting segment right now.`,
        status: 500,
      });
    }
  },
});

route({
  method: `patch`,
  route: `/:id`,
  validators: {
    body: updateAccountingSegmentBodySchema,
    params: accountingSegmentParamsSchema,
  },
  handler: async ({ body, fail, params, respond }) => {
    try {
      const segment = await updateAccountingSegment(pool, params.id, body);
      respond(segment);
    } catch (error) {
      if (error instanceof AccountingSegmentNotFoundError) {
        fail({
          code: `accounting_segment_not_found`,
          message: `Accounting segment was not found.`,
          status: 404,
        });
        return;
      }

      fail({
        cause: error,
        code: `accounting_segment_update_failed`,
        logMessage: `Failed to update accounting segment ${params.id}.`,
        message: `We could not update the accounting segment right now.`,
        status: 500,
      });
    }
  },
});

route({
  method: `delete`,
  route: `/:id`,
  validators: {
    params: accountingSegmentParamsSchema,
  },
  handler: async ({ fail, params, respond }) => {
    try {
      const segment = await deleteAccountingSegment(pool, params.id);
      respond(segment);
    } catch (error) {
      if (error instanceof AccountingSegmentRequiredDeleteError) {
        fail({
          code: `accounting_segment_required_delete_forbidden`,
          message: `Required accounting segments cannot be deleted.`,
          status: 400,
        });
        return;
      }

      if (error instanceof AccountingSegmentNotFoundError) {
        fail({
          code: `accounting_segment_not_found`,
          message: `Accounting segment was not found.`,
          status: 404,
        });
        return;
      }

      fail({
        cause: error,
        code: `accounting_segment_delete_failed`,
        logMessage: `Failed to delete accounting segment ${params.id}.`,
        message: `We could not delete the accounting segment right now.`,
        status: 500,
      });
    }
  },
});
