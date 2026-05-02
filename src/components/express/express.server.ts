import cors from 'cors';
import express from 'express';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

type CreateModuleServerOptions = {
  moduleName: string;
};

const getRootFQDN = () => {
  const envFqdn = process.env.ROOT_FQDN?.trim() || `reados.localhost`;
  return envFqdn;
};

const isAllowedCorsOrigin = (origin: string) => {
  try {
    const requestOrigin = new URL(origin);
    const rootFQDN = getRootFQDN();

    return requestOrigin.hostname === rootFQDN || requestOrigin.hostname.endsWith(`.${rootFQDN}`);
  } catch {
    return false;
  }
};

/**
 * Validates an incoming request body against a Zod schema before the route handler runs.
 */
export const validateRequestBody = <Schema extends z.ZodTypeAny>(schema: Schema): express.RequestHandler => {
  return (request, response, next) => {
    const parsedBody = schema.safeParse(request.body);

    if (!parsedBody.success) {
      response.status(400).json({
        message: `Invalid request body.`,
        issues: parsedBody.error.flatten(),
      });
      return;
    }

    response.locals.validatedBody = parsedBody.data;
    next();
  };
};

/**
 * Validates an incoming request query against a Zod schema before the route handler runs.
 */
export const validateRequestQuery = <Schema extends z.ZodTypeAny>(schema: Schema): express.RequestHandler => {
  return (request, response, next) => {
    const parsedQuery = schema.safeParse(request.query);

    if (!parsedQuery.success) {
      response.status(400).json({
        message: `Invalid request query.`,
        issues: parsedQuery.error.flatten(),
      });
      return;
    }

    response.locals.validatedQuery = parsedQuery.data;
    next();
  };
};

/**
 * Resolves the current correlation identifier from request context.
 */
export const getCorrelationId = (request: express.Request, response: express.Response) => {
  const responseCorrelationId = response.locals.correlationId;

  if (typeof responseCorrelationId === `string` && responseCorrelationId.trim().length > 0) {
    return responseCorrelationId;
  }

  const requestCorrelationId = request.header(`x-correlation-id`);

  if (typeof requestCorrelationId === `string` && requestCorrelationId.trim().length > 0) {
    return requestCorrelationId.trim();
  }

  return uuidv7();
};

/**
 * Creates a minimal module server with shared middleware and health endpoints.
 */
export const createModuleServer = ({ moduleName }: CreateModuleServerOptions) => {
  const app = express();

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
  app.use(express.json());
  app.use((request, response, next) => {
    const correlationId = getCorrelationId(request, response);

    response.locals.correlationId = correlationId;
    response.setHeader(`x-correlation-id`, correlationId);
    next();
  });

  app.get(`/health`, (_request, response) => {
    response.json({
      module: moduleName,
      status: `ok`,
    });
  });

  app.get(`/`, (_request, response) => {
    response.json({
      message: `${moduleName} module is running.`,
      module: moduleName,
    });
  });

  if (process.env.COVERAGE === `true`) {
    app.get(`/__coverage__`, (_request, response) => {
      const runtimeCoverage = (globalThis as { __coverage__?: unknown }).__coverage__ ?? {};
      response.json(runtimeCoverage);
    });
  }

  return app;
};
