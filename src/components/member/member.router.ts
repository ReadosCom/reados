import { Router } from "express";
import { defineRoutes } from "@components/express/express.router.ts";
import { applyAccountTemplate, createMember, listAccountTemplates, listMembers } from "./member.controller.ts";
import { createMemberBodySchema, memberSegmentParamsSchema } from "./member.schema.ts";

export const memberRouter = Router({ mergeParams: true });
const route = defineRoutes(memberRouter);

route({
  method: `get`,
  route: `/`,
  validators: { params: memberSegmentParamsSchema },
  handler: async ({ params, respond, fail }) => {
    try {
      respond(await listMembers(params.segmentId));
    } catch (error) {
      fail({ cause: error, status: 500, code: `segment_member_list_failed`, message: `We could not load segment members right now.` });
    }
  },
});

route({
  method: `post`,
  route: `/`,
  validators: { params: memberSegmentParamsSchema, body: createMemberBodySchema },
  handler: async ({ params, body, respond, fail }) => {
    try {
      respond(await createMember(params.segmentId, body), 201);
    } catch (error) {
      fail({ cause: error, status: 400, code: `segment_member_create_failed`, message: `We could not create segment member.` });
    }
  },
});

route({
  method: `get`,
  route: `/templates`,
  handler: async ({ respond, fail }) => {
    try {
      respond(await listAccountTemplates());
    } catch (error) {
      fail({ cause: error, status: 500, code: `account_template_list_failed`, message: `We could not load account templates.` });
    }
  },
});

route({
  method: `post`,
  route: `/templates/apply`,
  handler: async ({ respond, fail }) => {
    try {
      await applyAccountTemplate();
      respond({ applied: true });
    } catch (error) {
      fail({ cause: error, status: 400, code: `account_template_apply_failed`, message: `We could not apply the selected account template.` });
    }
  },
});
