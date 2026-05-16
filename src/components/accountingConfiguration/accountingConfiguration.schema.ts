import { z } from "zod";
import { apiSuccessSchema } from "@components/application/api.schema.ts";

export const segmentSchema = z.object({
  active: z.boolean(),
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  order: z.number().int().nonnegative(),
  required: z.boolean(),
});

export const accountingConfigurationSchema = z
  .object({
    finalized: z.boolean(),
    segments: z.array(segmentSchema),
  })
  .superRefine((value, context) => {
    const seenOrders = new Set<number>();

    for (const segment of value.segments) {
      if (seenOrders.has(segment.order)) {
        context.addIssue({
          code: `custom`,
          message: `Segment order values must be unique.`,
          path: [`segments`],
        });
      } else {
        seenOrders.add(segment.order);
      }
    }

    const activeRequiredSegments = value.segments.filter((segment) => segment.required === true && segment.active === true);
    if (activeRequiredSegments.length < 2) {
      context.addIssue({
        code: `custom`,
        message: `At least two active required segments must exist.`,
        path: [`segments`],
      });
    }

    if (value.finalized && context.issues.length > 0) {
      context.addIssue({
        code: `custom`,
        message: `Configuration cannot be finalized until required segment rules pass.`,
        path: [`finalized`],
      });
    }
  });

export const accountingConfigurationResponseDataSchema = z.object({
  configuration: accountingConfigurationSchema,
  module: z.literal(`accounting`),
});
export const accountingConfigurationResponseSchema = apiSuccessSchema(accountingConfigurationResponseDataSchema);

export const accountingConfigurationUpdateBodySchema = z.object({
  configuration: accountingConfigurationSchema,
});

export const accountingConfigurationSegmentFormSchema = segmentSchema.pick({
  active: true,
  id: true,
  label: true,
  required: true,
});

export const accountingConfigurationFormSchema = z.object({
  finalized: z.boolean(),
  segments: z.array(accountingConfigurationSegmentFormSchema),
});

export type AccountingConfigurationResponseData = z.infer<typeof accountingConfigurationResponseDataSchema>;
export type AccountingConfigurationResponse = z.infer<typeof accountingConfigurationResponseSchema>;
export type AccountingConfigurationUpdateBody = z.infer<typeof accountingConfigurationUpdateBodySchema>;
export type AccountingConfiguration = z.infer<typeof accountingConfigurationSchema>;
export type AccountingConfigurationFormValues = z.infer<typeof accountingConfigurationFormSchema>;
export type AccountingConfigurationSegmentFormValues = z.infer<typeof accountingConfigurationSegmentFormSchema>;
