import express from "express";

import { defineMiddlewares } from "@components/base/define-middlewares.ts";
import { erpRouter } from "@components/erp/erp.router.ts";

const port = Number(process.env.PORT ?? 3000);
const app = express();

app.set(`trust proxy`, 1);
defineMiddlewares(app);
app.use(erpRouter);

app.get(`/health`, (_request, response) => {
  response.status(200).json({
    data: {
      module: `erp`,
      status: `ok`,
    },
    success: true,
  });
});

app.get(`/`, (_request, response) => {
  response.status(200).json({
    data: {
      message: `erp module is running.`,
      module: `erp`,
    },
    success: true,
  });
});

if (process.env.COVERAGE === `true`) {
  app.get(`/__coverage__`, (_request, response) => {
    const runtimeCoverage = (globalThis as { __coverage__?: unknown }).__coverage__ ?? {};
    response.json(runtimeCoverage);
  });
}

app.listen(port, () => {
  console.log(`erp server listening on port ${port}`);
});
