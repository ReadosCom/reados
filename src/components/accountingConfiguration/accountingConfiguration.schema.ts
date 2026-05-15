import { z } from "zod";
import { apiSuccessSchema } from "@components/application/api.schema.ts";

export const accountingConfigurationSchema = z.record(z.string(), z.unknown());

export const accountingConfigurationResponseDataSchema = z.object({
  configuration: accountingConfigurationSchema,
  module: z.literal(`accounting`),
});
export const accountingConfigurationResponseSchema = apiSuccessSchema(accountingConfigurationResponseDataSchema);

export const accountingConfigurationUpdateBodySchema = z.object({
  configuration: accountingConfigurationSchema,
});

export type AccountingConfigurationResponseData = z.infer<typeof accountingConfigurationResponseDataSchema>;
export type AccountingConfigurationResponse = z.infer<typeof accountingConfigurationResponseSchema>;
export type AccountingConfigurationUpdateBody = z.infer<typeof accountingConfigurationUpdateBodySchema>;
