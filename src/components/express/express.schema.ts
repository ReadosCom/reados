import type express from "express";
import { z } from "zod";

export type ValidateOptions = {
  body?: z.ZodType | undefined;
  params?: z.ZodType | undefined;
  query?: z.ZodType | undefined;
};

export type InferValidatedValue<Schema extends z.ZodType | undefined> = Schema extends z.ZodType ? z.infer<Schema> : unknown;

export type ValidatedResponseLocals<BodySchema extends z.ZodType | undefined, QuerySchema extends z.ZodType | undefined, ParamsSchema extends z.ZodType | undefined> = {
  body: InferValidatedValue<BodySchema>;
  params: InferValidatedValue<ParamsSchema>;
  query: InferValidatedValue<QuerySchema>;
};

export type ValidatedHandler<BodySchema extends z.ZodType | undefined, QuerySchema extends z.ZodType | undefined, ParamsSchema extends z.ZodType | undefined> = (
  request: express.Request,
  response: express.Response<unknown, ValidatedResponseLocals<BodySchema, QuerySchema, ParamsSchema>>,
  next: express.NextFunction,
) => unknown;

export type RouteMethod = `delete` | `get` | `patch` | `post` | `put`;

export type RequestLogger = {
  error: (object: Record<string, unknown>, message?: string) => void;
  info: (object: Record<string, unknown>, message?: string) => void;
};

export type ApiErrorOptions = {
  code: string;
  details?: unknown;
  message: string;
  status: number;
};

export type RouteFailOptions = ApiErrorOptions & {
  cause?: unknown;
  logMessage?: string;
};

export type RouteOptions<BodySchema extends z.ZodType | undefined, QuerySchema extends z.ZodType | undefined, ParamsSchema extends z.ZodType | undefined> = {
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

export type ApiErrorResponse = {
  error: {
    code: string;
    correlationId: string;
    details?: unknown;
    message: string;
  };
  success: false;
};

export type CreateServerOptions = {
  module: string;
  port: number;
  routers: express.Router[];
};
