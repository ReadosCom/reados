import { z } from "zod";
import { apiSuccessSchema } from "./api.schema.ts";

export const parseApiSuccess = <Schema extends z.ZodType>(payload: unknown, schema: Schema): z.infer<Schema> => {
  const parsedResponse = apiSuccessSchema(schema).parse(payload) as {
    data: z.infer<Schema>;
    success: true;
  };

  return parsedResponse.data;
};
