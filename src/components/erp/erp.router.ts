import { Router } from "express";
import { accountingRouter } from "@components/accounting/accounting.router.ts";

/**
 * ERP route composition.
 */
export const erpRouter = Router();

erpRouter.use(`/accounting`, accountingRouter);
