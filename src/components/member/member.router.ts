import { Router } from "express";
import { defineRoutes } from "@components/express/express.router.ts";
import { applyAccountTemplate, createMember, deleteMember, listAccountTemplates, listMembers, updateMember } from "./member.controller.ts";
import { applyMemberTemplateBodySchema, createMemberBodySchema, memberIdParamsSchema, memberListQuerySchema, updateMemberBodySchema } from "./member.schema.ts";

export const memberRouter = Router();
const route = defineRoutes(memberRouter);

route({
  method: `get`,
  route: `/`,
  validators: { query: memberListQuerySchema },
  handler: async ({ query, respond, fail }) => {
    try {
      respond(await listMembers(query.segmentId));
    } catch (error) {
      fail({ cause: error, status: 500, code: `segment_member_list_failed`, message: `We could not load segment members right now.` });
    }
  },
});

route({
  method: `post`,
  route: `/`,
  validators: { body: createMemberBodySchema },
  handler: async ({ body, respond, fail }) => {
    try {
      respond(await createMember(body), 201);
    } catch (error) {
      fail({ cause: error, status: 400, code: `segment_member_create_failed`, message: `We could not create segment member.` });
    }
  },
});

route({
  method: `put`,
  route: `/:id`,
  validators: { params: memberIdParamsSchema, body: updateMemberBodySchema },
  handler: async ({ params, body, respond, fail }) => {
    try {
      respond(await updateMember(params.id, body));
    } catch (error) {
      fail({ cause: error, status: 400, code: `segment_member_update_failed`, message: `We could not update segment member.` });
    }
  },
});

route({
  method: `delete`,
  route: `/:id`,
  validators: { params: memberIdParamsSchema },
  handler: async ({ params, respond, fail }) => {
    try {
      await deleteMember(params.id);
      respond({ deleted: true });
    } catch (error) {
      fail({ cause: error, status: 400, code: `segment_member_delete_failed`, message: `We could not delete segment member.` });
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
  validators: { body: applyMemberTemplateBodySchema },
  handler: async ({ body, respond, fail }) => {
    try {
      await applyAccountTemplate(body.segmentId, body.templateId);
      respond({ applied: true });
    } catch (error) {
      fail({ cause: error, status: 400, code: `account_template_apply_failed`, message: `We could not apply the selected account template.` });
    }
  },
});
