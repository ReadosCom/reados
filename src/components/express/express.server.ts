import express from 'express';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

type ValidateOptions = {
  body?: z.ZodType | undefined;
  params?: z.ZodType | undefined;
  query?: z.ZodType | undefined;
};

type InferValidatedValue<Schema extends z.ZodType | undefined> = Schema extends z.ZodType ? z.infer<Schema> : unknown;

type ValidatedResponseLocals<BodySchema extends z.ZodType | undefined, QuerySchema extends z.ZodType | undefined, ParamsSchema extends z.ZodType | undefined> = {
  body: InferValidatedValue<BodySchema>;
  params: InferValidatedValue<ParamsSchema>;
  query: InferValidatedValue<QuerySchema>;
};

type ValidatedHandler<BodySchema extends z.ZodType | undefined, QuerySchema extends z.ZodType | undefined, ParamsSchema extends z.ZodType | undefined> = (
  request: express.Request,
  response: express.Response<unknown, ValidatedResponseLocals<BodySchema, QuerySchema, ParamsSchema>>,
  next: express.NextFunction,
) => unknown;

type RouteMethod = `delete` | `get` | `patch` | `post` | `put`;
type RequestLogger = {
  error: (object: Record<string, unknown>, message?: string) => void;
  info: (object: Record<string, unknown>, message?: string) => void;
};
type RouteFailOptions = ApiErrorOptions & { cause?: unknown; logMessage?: string };

type RouteOptions<BodySchema extends z.ZodType | undefined, QuerySchema extends z.ZodType | undefined, ParamsSchema extends z.ZodType | undefined> = {
  handler: (context: {
    body: InferValidatedValue<BodySchema>;
    fail: (options: RouteFailOptions) => void;
    params: InferValidatedValue<ParamsSchema>;
    query: InferValidatedValue<QuerySchema>;
    request: express.Request;
    respond: <Data>(data: Data, status?: number) => void;
    response: express.Response;
  }) => unknown;
  method: RouteMethod;
  route: string;
  validators?: {
    body?: BodySchema;
    params?: ParamsSchema;
    query?: QuerySchema;
  };
};

type ApiErrorOptions = {
  code: string;
  details?: unknown;
  message: string;
  status: number;
};

type ApiErrorResponse = {
  error: {
    code: string;
    correlationId: string;
    details?: unknown;
    message: string;
  };
  success: false;
};

const createRouteResponder = (request: express.Request, response: express.Response, logger: RequestLogger | undefined) => {
  const correlationId = getCorrelationId(request, response);

  const fail = ({ cause, code, details, logMessage, message, status }: RouteFailOptions) => {
    logger?.error(
      {
        code,
        correlationId,
        details,
        error: cause,
        status,
      },
      logMessage ?? message,
    );

    response.status(status).json({
      error: {
        code,
        correlationId,
        details,
        message,
      },
      success: false,
    } satisfies ApiErrorResponse);
  };

  const respond = <Data>(data: Data, status = 200) => {
    logger?.info(
      {
        correlationId,
        status,
      },
      `Route handler succeeded.`,
    );
    response.status(status).json({
      data,
      success: true,
    });
  };

  return {
    fail,
    respond,
  };
};

export const route = <BodySchema extends z.ZodType | undefined, QuerySchema extends z.ZodType | undefined, ParamsSchema extends z.ZodType | undefined>(
  router: express.Router,
  { handler, method, route, validators }: RouteOptions<BodySchema, QuerySchema, ParamsSchema>,
) => {
  const registerHandler = validate(validators ?? {}, async (request, response) => {
    const locals = response.locals as ValidatedResponseLocals<BodySchema, QuerySchema, ParamsSchema>;
    const logger = (request as express.Request & { log?: RequestLogger }).log;
    const { fail, respond } = createRouteResponder(request, response, logger);

    await handler({
      body: locals.body,
      fail,
      params: locals.params,
      query: locals.query,
      request,
      respond,
      response,
    });
  });

  router[method](route, registerHandler);
};

export const defineRoutes = (router: express.Router) => {
  return <BodySchema extends z.ZodType | undefined, QuerySchema extends z.ZodType | undefined, ParamsSchema extends z.ZodType | undefined>(
    options: RouteOptions<BodySchema, QuerySchema, ParamsSchema>,
  ) => {
    route(router, options);
  };
};

/**
 * Validates request sources against provided Zod schemas and stores parsed data on response.locals.
 */
export function validate<BodySchema extends z.ZodType | undefined, QuerySchema extends z.ZodType | undefined, ParamsSchema extends z.ZodType | undefined>(options: {
  body?: BodySchema;
  params?: ParamsSchema;
  query?: QuerySchema;
}): express.RequestHandler;

export function validate<BodySchema extends z.ZodType | undefined, QuerySchema extends z.ZodType | undefined, ParamsSchema extends z.ZodType | undefined>(
  options: {
    body?: BodySchema;
    params?: ParamsSchema;
    query?: QuerySchema;
  },
  handler: ValidatedHandler<BodySchema, QuerySchema, ParamsSchema>,
): express.RequestHandler;

export function validate({ body, params, query }: ValidateOptions, handler?: ValidatedHandler<z.ZodType | undefined, z.ZodType | undefined, z.ZodType | undefined>): express.RequestHandler {
  return (request, response, next) => {
    if (body) {
      const parsedBody = body.safeParse(request.body);

      if (!parsedBody.success) {
        response.status(400).json({
          error: {
            code: `invalid_request_body`,
            correlationId: getCorrelationId(request, response),
            details: z.flattenError(parsedBody.error),
            message: `Invalid request body.`,
          },
          success: false,
        } satisfies ApiErrorResponse);
        return;
      }

      response.locals.body = parsedBody.data;
    }

    if (query) {
      const parsedQuery = query.safeParse(request.query);

      if (!parsedQuery.success) {
        response.status(400).json({
          error: {
            code: `invalid_request_query`,
            correlationId: getCorrelationId(request, response),
            details: z.flattenError(parsedQuery.error),
            message: `Invalid request query.`,
          },
          success: false,
        } satisfies ApiErrorResponse);
        return;
      }

      response.locals.query = parsedQuery.data;
    }

    if (params) {
      const parsedParams = params.safeParse(request.params);

      if (!parsedParams.success) {
        response.status(400).json({
          error: {
            code: `invalid_request_params`,
            correlationId: getCorrelationId(request, response),
            details: z.flattenError(parsedParams.error),
            message: `Invalid request params.`,
          },
          success: false,
        } satisfies ApiErrorResponse);
        return;
      }

      response.locals.params = parsedParams.data;
    }

    if (handler) {
      const typedResponse = response as express.Response<unknown, ValidatedResponseLocals<z.ZodType | undefined, z.ZodType | undefined, z.ZodType | undefined>>;
      Promise.resolve(handler(request, typedResponse, next)).catch(next);
      return;
    }

    next();
  };
}

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
