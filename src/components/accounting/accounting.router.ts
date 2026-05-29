import { Router } from "express";
import { accountingConfigurationRouter } from "@components/accountingConfiguration/accountingConfiguration.router.ts";
import { accountingDashboardRouter } from "@components/accountingDashboard/accountingDashboard.router.ts";
import { memberRouter } from "@components/member/member.router.ts";
import { segmentRouter } from "@components/segment/segment.router.ts";

/**
 * Accounting module routes.
 */
export const accountingRouter = Router();

accountingRouter.use(`/configuration`, accountingConfigurationRouter);
accountingRouter.use(`/dashboard`, accountingDashboardRouter);
accountingRouter.use(`/member`, memberRouter);
accountingRouter.use(`/segment`, segmentRouter);
