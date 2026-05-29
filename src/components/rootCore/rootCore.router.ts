import express from "express";
import { defineRoutes } from "@components/express/express.router.ts";

/**
 * Defines root core routes.
 */
export const rootCoreRouter = express.Router();
const route = defineRoutes(rootCoreRouter);

route({
  method: `get`,
  route: `/whoami`,
  handler: async ({ respond }) => {
    respond({
      whoami: `root`,
    });
  },
});
