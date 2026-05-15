import cors from "cors";
import type { Express } from "express";

const getRootFqdn = () => {
  return process.env.ROOT_FQDN?.trim() || `reados.localhost`;
};

const isAllowedCorsOrigin = (origin: string) => {
  try {
    const requestOrigin = new URL(origin);
    const rootFqdn = getRootFqdn();

    return requestOrigin.hostname === rootFqdn || requestOrigin.hostname.endsWith(`.${rootFqdn}`);
  } catch {
    return false;
  }
};

export const defineCors = (app: Express) => {
  app.use(
    cors({
      credentials: true,
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (isAllowedCorsOrigin(origin)) {
          callback(null, origin);
          return;
        }

        callback(null, false);
      },
    }),
  );
};
