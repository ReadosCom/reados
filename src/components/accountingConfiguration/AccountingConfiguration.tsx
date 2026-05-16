import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { v7 as uuidv7 } from "uuid";

import { useTranslation } from "@components/i18n/useTranslation.ts";
import { Button } from "@components/uiframework/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/uiframework/Card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@components/uiframework/Form";
import { Input } from "@components/uiframework/Input";
import { Switch } from "@components/uiframework/Switch";
import { useAccountingSegmentsQuery, useCreateAccountingSegmentMutation, useDeleteAccountingSegmentMutation, useUpdateAccountingSegmentMutation } from "@components/accountingSegment/accountingSegment.query.ts";

import { useAccountingConfigurationQuery, useUpdateAccountingConfigurationMutation } from "./accountingConfiguration.query.ts";
import { accountingConfigurationFormSchema, type AccountingConfigurationFormValues } from "./accountingConfiguration.schema.ts";

export const AccountingConfiguration = () => {
  const { t } = useTranslation(`./AccountingConfiguration.i18n.ts`);
  const { data: configurationData, isError: isConfigurationError, isPending: isConfigurationPending } = useAccountingConfigurationQuery();
  const { data: segmentData, isError: isSegmentError, isPending: isSegmentPending, refetch: refetchSegments } = useAccountingSegmentsQuery();
  const { mutateAsync: updateConfigurationAsync, isPending: isConfigurationUpdating } = useUpdateAccountingConfigurationMutation();
  const { mutateAsync: createSegmentAsync, isPending: isCreateSegmentPending } = useCreateAccountingSegmentMutation();
  const { mutateAsync: updateSegmentAsync, isPending: isUpdateSegmentPending } = useUpdateAccountingSegmentMutation();
  const { mutateAsync: deleteSegmentAsync, isPending: isDeleteSegmentPending } = useDeleteAccountingSegmentMutation();
  const [saveState, setSaveState] = useState<`error` | `idle` | `saved`>(`idle`);
  const form = useForm<AccountingConfigurationFormValues>({
    defaultValues: {
      finalized: false,
      optionalSegments: [],
    },
    resolver: zodResolver(accountingConfigurationFormSchema),
  });
  const optionalSegments = useFieldArray({
    control: form.control,
    name: `optionalSegments`,
  });

  useEffect(() => {
    if (!configurationData && !segmentData) {
      return;
    }

    form.reset({
      finalized: configurationData?.configuration.finalized === true,
      optionalSegments: (segmentData ?? [])
        .filter((segment) => segment.source === `custom`)
        .sort((left, right) => left.order - right.order)
        .map((segment) => ({
          active: segment.active,
          id: segment.id,
          label: segment.label,
        })),
    });
  }, [configurationData, form, segmentData]);

  const onSubmit = async (values: AccountingConfigurationFormValues) => {
    setSaveState(`idle`);

    try {
      const existingCustomSegments = (segmentData ?? []).filter((segment) => segment.source === `custom`);
      const existingById = new Map(existingCustomSegments.map((segment) => [segment.id, segment] as const));
      const nextIds = new Set(values.optionalSegments.map((segment) => segment.id));

      for (const existingSegment of existingCustomSegments) {
        if (!nextIds.has(existingSegment.id)) {
          await deleteSegmentAsync(existingSegment.id);
        }
      }

      for (const [index, segment] of values.optionalSegments.entries()) {
        const existingSegment = existingById.get(segment.id);

        if (!existingSegment) {
          await createSegmentAsync({
            active: segment.active,
            label: segment.label,
            order: index + 2,
            required: false,
            source: `custom`,
          });
          continue;
        }

        if (existingSegment.active !== segment.active || existingSegment.label !== segment.label || existingSegment.order !== index + 2) {
          await updateSegmentAsync({
            body: {
              active: segment.active,
              label: segment.label,
              order: index + 2,
            },
            id: existingSegment.id,
          });
        }
      }

      const latestSegmentQuery = await refetchSegments();
      const latestSegments = latestSegmentQuery.data ?? [];
      const segments = latestSegments.map((segment) => {
        if (segment.source === `system`) {
          return {
            active: true as const,
            id: segment.id,
            label: segment.label,
            order: segment.order,
            required: true as const,
            source: `system` as const,
          };
        }

        return {
          active: segment.active,
          id: segment.id,
          label: segment.label,
          order: segment.order,
          required: false as const,
          source: `custom` as const,
        };
      });

      await updateConfigurationAsync({
        configuration: {
          finalized: values.finalized,
          segments,
        },
      });
      setSaveState(`saved`);
    } catch {
      setSaveState(`error`);
    }
  };

  const isUpdating = isConfigurationUpdating || isCreateSegmentPending || isUpdateSegmentPending || isDeleteSegmentPending;
  const isFinalized = form.watch(`finalized`);
  const requiredSegments = (segmentData ?? []).filter((segment) => segment.source === `system`).sort((left, right) => left.order - right.order);

  if (isConfigurationPending || isSegmentPending) {
    return <p className="text-sm text-muted-foreground">{t(`Loading accounting configuration...`)}</p>;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{t(`Accounting configuration`)}</CardTitle>
        <CardDescription>{t(`Configure accounting module readiness and defaults.`)}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              void form.handleSubmit(onSubmit)(event);
            }}
          >
            <FormField
              control={form.control}
              name="finalized"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between rounded-md border border-border p-3">
                    <div className="space-y-1">
                      <FormLabel>{t(`Finalized`)}</FormLabel>
                      <FormDescription>{t(`Allow users to continue from configuration to accounting workflows.`)}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <section className="space-y-3" aria-label={t(`Segments`)}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t(`Segments`)}</h3>
                <Button
                  onClick={() => {
                    optionalSegments.append({
                      active: true,
                      id: uuidv7(),
                      label: ``,
                    });
                  }}
                  type="button"
                  variant="outline"
                >
                  {t(`Add segment`)}
                </Button>
              </div>

              {requiredSegments.map((segment) => (
                <div className="rounded-md border border-border p-3 text-sm" key={segment.id}>
                  <p className="font-medium">{segment.label}</p>
                  <p className="text-muted-foreground">{t(`System required segment`)}</p>
                </div>
              ))}

              {optionalSegments.fields.map((field, index) => (
                <div className="space-y-3 rounded-md border border-border p-3" key={field.id}>
                  <FormField
                    control={form.control}
                    name={`optionalSegments.${index}.label`}
                    render={({ field: optionalLabelField }) => (
                      <FormItem>
                        <FormLabel>{t(`Label`)}</FormLabel>
                        <FormControl>
                          <Input {...optionalLabelField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`optionalSegments.${index}.active`}
                    render={({ field: optionalActiveField }) => (
                      <FormItem>
                        <div className="flex items-center justify-between rounded-md border border-border p-3">
                          <div className="space-y-1">
                            <FormLabel>{t(`Active`)}</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={optionalActiveField.value} onCheckedChange={optionalActiveField.onChange} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button
                      disabled={isFinalized}
                      onClick={() => {
                        optionalSegments.remove(index);
                      }}
                      type="button"
                      variant="outline"
                    >
                      {t(`Remove`)}
                    </Button>
                  </div>
                </div>
              ))}
            </section>

            {isConfigurationError || isSegmentError ? <p className="text-sm text-destructive">{t(`Could not load accounting configuration right now.`)}</p> : null}
            {saveState === `saved` ? <p className="text-sm text-muted-foreground">{t(`Configuration saved.`)}</p> : null}
            {saveState === `error` ? <p className="text-sm text-destructive">{t(`Could not save configuration right now.`)}</p> : null}

            <div className="flex justify-end">
              <Button disabled={isUpdating} type="submit">
                {isUpdating ? t(`Saving...`) : t(`Save configuration`)}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
