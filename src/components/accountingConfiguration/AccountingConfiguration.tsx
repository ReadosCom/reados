import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

import { useSegmentsQuery, useCreateSegmentMutation, useDeleteSegmentMutation, useUpdateSegmentMutation } from '@components/segment/segment.query.ts';
import { segmentSchema } from '@components/segment/segment.schema.ts';
import { useTranslation } from '@components/i18n/useTranslation.ts';
import { Button } from '@components/uiframework/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/uiframework/Card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/uiframework/Form';
import { Input } from '@components/uiframework/Input';
import { Skeleton } from '@components/uiframework/Skeleton';
import { Switch } from '@components/uiframework/Switch';

import { useAccountingConfigurationQuery, useFinalizeAccountingConfigurationMutation } from './accountingConfiguration.query.ts';

const accountingConfigurationScreenSegmentSchema = segmentSchema.pick({
  active: true,
  id: true,
  label: true,
  required: true,
});

const accountingConfigurationScreenFormSchema = z.object({
  segments: z.array(accountingConfigurationScreenSegmentSchema),
});

type AccountingConfigurationScreenFormValues = z.infer<typeof accountingConfigurationScreenFormSchema>;

export const AccountingConfiguration = () => {
  const { t } = useTranslation(`./AccountingConfiguration.i18n.ts`);
  const { data: configurationData, isError: isConfigurationError, isPending: isConfigurationPending } = useAccountingConfigurationQuery();
  const { data: segmentData, isError: isSegmentError, isPending: isSegmentPending } = useSegmentsQuery();
  const { mutateAsync: createSegmentAsync, isPending: isCreateSegmentPending } = useCreateSegmentMutation();
  const { mutateAsync: updateSegmentAsync, isPending: isUpdateSegmentPending } = useUpdateSegmentMutation();
  const { mutateAsync: deleteSegmentAsync, isPending: isDeleteSegmentPending } = useDeleteSegmentMutation();
  const { mutateAsync: finalizeConfigurationAsync, isPending: isFinalizePending } = useFinalizeAccountingConfigurationMutation();
  const [finalizeState, setFinalizeState] = useState<`error` | `idle` | `success`>(`idle`);
  const [saveState, setSaveState] = useState<`error` | `idle` | `saved`>(`idle`);
  const form = useForm<AccountingConfigurationScreenFormValues>({
    defaultValues: {
      segments: [],
    },
    resolver: zodResolver(accountingConfigurationScreenFormSchema),
  });
  const segments = useFieldArray({
    control: form.control,
    name: `segments`,
  });

  useEffect(() => {
    if (!configurationData && !segmentData) {
      return;
    }

    form.reset({
      segments: (segmentData ?? [])
        .sort((left, right) => left.order - right.order)
        .map((segment) => ({
          active: segment.active,
          id: segment.id,
          label: segment.label,
          required: segment.required,
        })),
    });
  }, [configurationData, form, segmentData]);

  const onSubmit = async (values: AccountingConfigurationScreenFormValues) => {
    setSaveState(`idle`);

    try {
      const existingSegments = segmentData ?? [];
      const existingById = new Map(existingSegments.map((segment) => [segment.id, segment] as const));
      const nextIds = new Set(values.segments.map((segment) => segment.id));
      const isFinalized = configurationData?.configuration.finalized === true;

      for (const existingSegment of existingSegments) {
        if (!nextIds.has(existingSegment.id) && !existingSegment.required && !isFinalized) {
          await deleteSegmentAsync(existingSegment.id);
        }
      }

      for (const [index, segment] of values.segments.entries()) {
        const existingSegment = existingById.get(segment.id);

        if (!existingSegment) {
          await createSegmentAsync({
            active: segment.active,
            label: segment.label,
            order: index,
            required: segment.required,
          });
          continue;
        }

        if (existingSegment.active !== segment.active || existingSegment.label !== segment.label || existingSegment.order !== index || existingSegment.required !== segment.required) {
          await updateSegmentAsync({
            body: {
              active: segment.active,
              label: segment.label,
              order: index,
              required: segment.required,
            },
            id: existingSegment.id,
          });
        }
      }

      setSaveState(`saved`);
    } catch {
      setSaveState(`error`);
    }
  };

  const onFinalize = async () => {
    const shouldFinalize = window.confirm(
      t(`This is a critical operation. After finalization, future changes may require downtime due to database operations. Do you want to continue?`),
    );

    if (!shouldFinalize) {
      return;
    }

    setFinalizeState(`idle`);

    try {
      await finalizeConfigurationAsync();
      setFinalizeState(`success`);
    } catch {
      setFinalizeState(`error`);
    }
  };

  const isUpdating = isCreateSegmentPending || isUpdateSegmentPending || isDeleteSegmentPending || isFinalizePending;
  const isFinalized = configurationData?.configuration.finalized === true;

  if (isConfigurationPending || isSegmentPending) {
    return (
      <>
        <p className="text-sm text-muted-foreground">{t(`Loading accounting configuration...`)}</p>
        <Skeleton className="h-96 rounded-xl" />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t(`Segments`)}</CardTitle>
          <CardDescription>{t(`Configure chart segment labels and activation states.`)}</CardDescription>
        </CardHeader>
        <CardContent>
        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              void form.handleSubmit(onSubmit)(event);
            }}
          >
            <section className="space-y-3" aria-label={t(`Segments`)}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{t(`Segments`)}</h3>
                <Button
                  onClick={() => {
                    segments.append({
                      active: true,
                      id: uuidv7(),
                      label: ``,
                      required: false,
                    });
                  }}
                  type="button"
                  variant="outline"
                >
                  {t(`Add segment`)}
                </Button>
              </div>

              {segments.fields.map((field, index) => (
                <div className="space-y-3 rounded-md border border-border p-3" key={field.id}>
                  <FormField
                    control={form.control}
                    name={`segments.${index}.label`}
                    render={({ field: segmentLabelField }) => (
                      <FormItem>
                        <FormLabel>{t(`Label`)}</FormLabel>
                        <FormControl>
                          <Input {...segmentLabelField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`segments.${index}.active`}
                    render={({ field: segmentActiveField }) => (
                      <FormItem>
                        <div className="flex items-center justify-between rounded-md border border-border p-3">
                          <div className="space-y-1">
                            <FormLabel>{t(`Active`)}</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={segmentActiveField.value} onCheckedChange={segmentActiveField.onChange} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end">
                    <Button
                      disabled={isFinalized || form.getValues(`segments.${index}.required`) === true}
                      onClick={() => {
                        segments.remove(index);
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
            {isFinalized ? <p className="text-sm text-muted-foreground">{t(`Configuration is finalized. Segment deletion is disabled.`)}</p> : null}
            {saveState === `saved` ? <p className="text-sm text-muted-foreground">{t(`Configuration saved.`)}</p> : null}
            {saveState === `error` ? <p className="text-sm text-destructive">{t(`Could not save configuration right now.`)}</p> : null}
            {finalizeState === `success` ? <p className="text-sm text-muted-foreground">{t(`Configuration finalized.`)}</p> : null}
            {finalizeState === `error` ? <p className="text-sm text-destructive">{t(`Could not finalize accounting configuration right now.`)}</p> : null}

            <div className="flex justify-end gap-2">
              <Button
                disabled={isFinalized || isUpdating}
                onClick={() => {
                  void onFinalize();
                }}
                type="button"
                variant="outline"
              >
                {isFinalizePending ? t(`Finalizing...`) : t(`Finalize Configuration`)}
              </Button>
              <Button disabled={isUpdating} type="submit">
                {isUpdating ? t(`Saving...`) : t(`Save configuration`)}
              </Button>
            </div>
          </form>
        </Form>
        </CardContent>
      </Card>
    </>
  );
};
