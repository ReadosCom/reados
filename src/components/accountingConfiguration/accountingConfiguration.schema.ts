import { z } from "zod";
import { apiSuccessSchema } from "@components/application/api.schema.ts";

export const systemSegmentSchema = z.object({
  active: z.literal(true),
  id: z.string().trim().min(1),
  key: z.enum([`account`, `entity`]),
  label: z.string().trim().min(1),
  order: z.number().int().nonnegative(),
  required: z.literal(true),
  source: z.literal(`system`),
});

export const customSegmentSchema = z.object({
  active: z.boolean(),
  id: z.string().trim().min(1),
  key: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^[a-z][a-z0-9_]*$/u),
  label: z.string().trim().min(1).max(64),
  order: z.number().int().nonnegative(),
  required: z.literal(false),
  source: z.literal(`custom`),
});

export const segmentSchema = z.discriminatedUnion(`source`, [systemSegmentSchema, customSegmentSchema]);

export const accountSystemSegment = {
  active: true,
  id: `segment-account`,
  key: `account`,
  label: `Account`,
  order: 1,
  required: true,
  source: `system`,
} as const satisfies z.infer<typeof systemSegmentSchema>;

export const entitySystemSegment = {
  active: true,
  id: `segment-entity`,
  key: `entity`,
  label: `Entity`,
  order: 0,
  required: true,
  source: `system`,
} as const satisfies z.infer<typeof systemSegmentSchema>;

export const defaultSystemSegments = [entitySystemSegment, accountSystemSegment] as const;

export const accountingConfigurationSchema = z
  .object({
    finalized: z.boolean(),
    segments: z.array(segmentSchema).min(2),
  })
  .superRefine((value, context) => {
    const requiredKeys = new Set([`entity`, `account`]);
    const seenKeys = new Set<string>();
    const seenOrders = new Set<number>();

    for (const segment of value.segments) {
      if (seenKeys.has(segment.key)) {
        context.addIssue({
          code: `custom`,
          message: `Segment keys must be unique.`,
          path: [`segments`],
        });
      } else {
        seenKeys.add(segment.key);
      }

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

    for (const requiredKey of requiredKeys) {
      const segment = value.segments.find((candidate) => candidate.key === requiredKey);
      if (!segment) {
        context.addIssue({
          code: `custom`,
          message: `Required segment "${requiredKey}" is missing.`,
          path: [`segments`],
        });
        continue;
      }

      if (segment.source !== `system` || segment.required !== true || segment.active !== true) {
        context.addIssue({
          code: `custom`,
          message: `Required segment "${requiredKey}" must be active system segment.`,
          path: [`segments`],
        });
      }
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

export const accountingConfigurationOptionalSegmentFormSchema = z.object({
  active: z.boolean(),
  id: z.string().trim().min(1),
  key: z
    .string()
    .trim()
    .min(1)
    .max(32)
    .regex(/^[a-z][a-z0-9_]*$/u),
  label: z.string().trim().min(1).max(64),
});

export const accountingConfigurationFormSchema = z.object({
  finalized: z.boolean(),
  optionalSegments: z.array(accountingConfigurationOptionalSegmentFormSchema),
});

export type AccountingConfigurationResponseData = z.infer<typeof accountingConfigurationResponseDataSchema>;
export type AccountingConfigurationResponse = z.infer<typeof accountingConfigurationResponseSchema>;
export type AccountingConfigurationUpdateBody = z.infer<typeof accountingConfigurationUpdateBodySchema>;
export type AccountingConfiguration = z.infer<typeof accountingConfigurationSchema>;
export type AccountingConfigurationFormValues = z.infer<typeof accountingConfigurationFormSchema>;
export type AccountingConfigurationOptionalSegmentFormValues = z.infer<typeof accountingConfigurationOptionalSegmentFormSchema>;
