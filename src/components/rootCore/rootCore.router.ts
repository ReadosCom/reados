import express from "express";

/**
 * Defines root core routes.
 */
export const rootCoreRouter = express.Router();

rootCoreRouter.get(`/whoami`, (_request, response) => {
  response.status(200).json({
    data: {
      whoami: `root`,
    },
    success: true,
  });
});
