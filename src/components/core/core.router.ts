import express from "express";
import { defineRoutes } from "@components/express/express.router.ts";

/**
 * Defines tenant core routes.
 */
export const coreRouter = express.Router();
const route = defineRoutes(coreRouter);

route({
  method: `get`,
  route: `/whoami`,
  handler: async ({ respond }) => {
    respond({
      whoami: `tenant`,
    });
  },
  });
