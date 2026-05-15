import express from "express";

/**
 * Defines tenant core routes.
 */
export const coreRouter = express.Router();

coreRouter.get(`/whoami`, (_request, response) => {
  response.status(200).json({
    data: {
      whoami: `tenant`,
    },
    success: true,
  });
});
