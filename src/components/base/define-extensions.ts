import express from "express";
import type { Express } from "express";

export const defineExtensions = (app: Express) => {
  app.use(express.json());
};
