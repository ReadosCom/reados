import { Router } from "express";
import { defineRoutes } from "@components/express/express.router.ts";

import { createSegment, deleteSegment, getSegmentById, listSegments, reorderSegment, updateSegment } from "./segment.controller.ts";
import { SegmentNotFoundError, SegmentRequiredDeleteError, SegmentRequiredUpdateError, segmentParamsSchema, createSegmentBodySchema, reorderSegmentBodySchema, updateSegmentBodySchema } from "./segment.schema.ts";

/**
 * Accounting segment routes.
 */
export const segmentRouter = Router();
const route = defineRoutes(segmentRouter);

route({
  method: `get`,
  route: `/`,
  handler: async ({ fail, respond }) => {
    try {
      const segments = await listSegments();
      respond(segments);
    } catch (error) {
      fail({
        cause: error,
        code: `segment_list_failed`,
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
    params: segmentParamsSchema,
  },
  handler: async ({ fail, params, respond }) => {
    try {
      const segment = await getSegmentById(params.id);
      respond(segment);
    } catch (error) {
      if (error instanceof SegmentNotFoundError) {
        fail({
          code: `segment_not_found`,
          message: `Accounting segment was not found.`,
          status: 404,
        });
        return;
      }

      fail({
        cause: error,
        code: `segment_fetch_failed`,
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
    body: createSegmentBodySchema,
  },
  handler: async ({ body, fail, respond }) => {
    try {
      const segment = await createSegment(body);
      respond(segment, 201);
    } catch (error) {
      fail({
        cause: error,
        code: `segment_create_failed`,
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
    body: updateSegmentBodySchema,
    params: segmentParamsSchema,
  },
  handler: async ({ body, fail, params, respond }) => {
    try {
      const segment = await updateSegment(params.id, body);
      respond(segment);
    } catch (error) {
      if (error instanceof SegmentNotFoundError) {
        fail({
          code: `segment_not_found`,
          message: `Accounting segment was not found.`,
          status: 404,
        });
        return;
      }

      if (error instanceof SegmentRequiredUpdateError) {
        fail({
          code: `segment_required_update_forbidden`,
          message: `Required accounting segments must remain required.`,
          status: 400,
        });
        return;
      }

      fail({
        cause: error,
        code: `segment_update_failed`,
        logMessage: `Failed to update accounting segment ${params.id}.`,
        message: `We could not update the accounting segment right now.`,
        status: 500,
      });
    }
  },
});

route({
  method: `post`,
  route: `/:id/reorder`,
  validators: {
    body: reorderSegmentBodySchema,
    params: segmentParamsSchema,
  },
  handler: async ({ body, fail, params, respond }) => {
    try {
      const segment = await reorderSegment(params.id, body);
      respond(segment);
    } catch (error) {
      if (error instanceof SegmentNotFoundError) {
        fail({
          code: `segment_not_found`,
          message: `Accounting segment was not found.`,
          status: 404,
        });
        return;
      }

      fail({
        cause: error,
        code: `segment_reorder_failed`,
        logMessage: `Failed to reorder accounting segment ${params.id}.`,
        message: `We could not reorder the accounting segment right now.`,
        status: 500,
      });
    }
  },
});

route({
  method: `delete`,
  route: `/:id`,
  validators: {
    params: segmentParamsSchema,
  },
  handler: async ({ fail, params, respond }) => {
    try {
      const segment = await deleteSegment(params.id);
      respond(segment);
    } catch (error) {
      if (error instanceof SegmentRequiredDeleteError) {
        fail({
          code: `segment_required_delete_forbidden`,
          message: `Required accounting segments cannot be deleted.`,
          status: 400,
        });
        return;
      }

      if (error instanceof SegmentNotFoundError) {
        fail({
          code: `segment_not_found`,
          message: `Accounting segment was not found.`,
          status: 404,
        });
        return;
      }

      fail({
        cause: error,
        code: `segment_delete_failed`,
        logMessage: `Failed to delete accounting segment ${params.id}.`,
        message: `We could not delete the accounting segment right now.`,
        status: 500,
      });
    }
  },
});
