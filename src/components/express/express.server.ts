import cors from 'cors';
import express from 'express';
import { z } from 'zod';

type CreateModuleServerOptions = {
  moduleName: string;
};

const getRootFullyQualifiedDomainName = () => {
  const envFqdn = process.env.ROOT_FQDN?.trim() || `reados.localhost`;
  console.log(`Using root fully qualified domain name: ${envFqdn}`);
  return envFqdn;
};

const isAllowedCorsOrigin = (origin: string) => {
  console.log(`Checking CORS origin: ${origin}`);
  console.log(`Allowed root fully qualified domain name: ${getRootFullyQualifiedDomainName()}`);
  try {
    const requestOrigin = new URL(origin);
    const rootFullyQualifiedDomainName = getRootFullyQualifiedDomainName();

    return requestOrigin.hostname === rootFullyQualifiedDomainName || requestOrigin.hostname.endsWith(`.${rootFullyQualifiedDomainName}`);
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
 * Creates a minimal module server with shared middleware and health endpoints.
 */
export const createModuleServer = ({ moduleName }: CreateModuleServerOptions) => {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        callback(null, isAllowedCorsOrigin(origin));
      },
    }),
  );
  app.use(express.json());

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
