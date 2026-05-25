import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

import { useTranslation } from '@components/i18n/useTranslation.ts';
import { useCreateSegmentMutation, useDeleteSegmentMutation, useSegmentsQuery, useUpdateSegmentMutation } from '@components/segment/segment.query.ts';
import { segmentSchema } from '@components/segment/segment.schema.ts';
import { Button } from '@components/uiframework/Button';
import { Form } from '@components/uiframework/Form';
import { Skeleton } from '@components/uiframework/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/uiframework/Tabs';

import { useAccountingConfigurationQuery, useFinalizeAccountingConfigurationMutation } from '@components/accountingConfiguration/accountingConfiguration.query.ts';
import { AccountingSegment } from './AccountingSegment.tsx';

const accountingConfigurationScreenSegmentSchema = segmentSchema.pick({
  id: true,
  label: true,
  required: true,
});

const accountingConfigurationScreenFormSchema = z.object({
  segments: z.array(accountingConfigurationScreenSegmentSchema),
});

type AccountingConfigurationScreenFormValues = z.infer<typeof accountingConfigurationScreenFormSchema>;
const accountingSegmentsPath = `/erp/accounting/configuration/segments`;
const newSegmentTabValue = `new-segment`;

export const AccountingSegments = () => {
  const { t } = useTranslation(`./AccountingSegments.i18n.ts`);
  const location = useLocation();
  const navigate = useNavigate();
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
    keyName: `fieldKey`,
    name: `segments`,
  });
  const watchedSegments = useWatch({
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
          id: segment.id,
          label: segment.label,
          required: segment.required,
        })),
    });
  }, [configurationData, form, segmentData]);

  const routeSegmentId = location.pathname.split(`/`).at(-1) ?? newSegmentTabValue;
  const activeTabValue = routeSegmentId;

  useEffect(() => {
    const isAccountingSegmentsRoute = location.pathname === accountingSegmentsPath || location.pathname.startsWith(`${accountingSegmentsPath}/`);

    if (!isAccountingSegmentsRoute) {
      return;
    }

    if (isSegmentPending || !segmentData) {
      return;
    }

    const isNewRoute = routeSegmentId === newSegmentTabValue;
    const hasRouteSegment = segmentData.some((segment) => segment.id === routeSegmentId);

    if (isNewRoute || hasRouteSegment) {
      return;
    }

    const fallbackSegmentId = [...segmentData].sort((left, right) => left.order - right.order).at(0)?.id ?? newSegmentTabValue;
    void navigate({
      replace: true,
      to: `/erp/accounting/configuration/segments/${fallbackSegmentId}` as never,
    } as never);
  }, [isSegmentPending, location.pathname, navigate, routeSegmentId, segmentData]);

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
            label: segment.label,
            order: index,
            required: segment.required,
          });
          continue;
        }

        if (existingSegment.label !== segment.label || existingSegment.order !== index || existingSegment.required !== segment.required) {
          await updateSegmentAsync({
            body: {
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
    const shouldFinalize = window.confirm(t(`This is a critical operation. After finalization, future changes may require downtime due to database operations. Do you want to continue?`));

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
  const activeSegmentIndex = segments.fields.findIndex((field) => field.id === activeTabValue);

  if (isConfigurationPending || isSegmentPending) {
    return (
      <>
        <p className="text-sm text-muted-foreground">{t(`Loading accounting configuration...`)}</p>
        <Skeleton className="h-96 rounded-xl" />
      </>
    );
  }

  return (
    <Form {...form}>
      <form
        className="space-y-5"
        onSubmit={(event) => {
          void form.handleSubmit(onSubmit)(event);
        }}
      >
        <section className="space-y-3" aria-label={t(`Segments`)}>
          <Tabs
            onValueChange={(value) => {
              void navigate({
                to: `/erp/accounting/configuration/segments/${value}` as never,
              } as never);
            }}
            orientation="vertical"
            value={activeTabValue}
          >
            <TabsList variant="default">
              {segments.fields.map((field, index) => {
                const segmentLabel = watchedSegments?.[index]?.label ?? ``;
                const tabLabel = segmentLabel.trim().length > 0 ? segmentLabel : `${t(`Segment`)} ${index + 1}`;

                return (
                  <TabsTrigger key={field.fieldKey} value={field.id}>
                    {tabLabel}
                  </TabsTrigger>
                );
              })}
              <TabsTrigger value={newSegmentTabValue}>{t(`New Segment`)}</TabsTrigger>
            </TabsList>
            {segments.fields.map((field, index) => (
              <AccountingSegment
                control={form.control}
                getValues={form.getValues}
                index={index}
                isFinalized={isFinalized}
                key={field.fieldKey}
                onRemove={(segmentIndex) => {
                  segments.remove(segmentIndex);
                }}
                tabValue={field.id}
              />
            ))}
            <TabsContent value={newSegmentTabValue}>
              <div className="space-y-3 rounded-md border border-border p-3">
                <p className="text-sm text-muted-foreground">{t(`Select this tab to create and open a new segment.`)}</p>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      const segmentId = uuidv7();
                      segments.append({
                        id: segmentId,
                        label: ``,
                        required: false,
                      });
                      void navigate({
                        to: `/erp/accounting/configuration/segments/${segmentId}` as never,
                      } as never);
                    }}
                    type="button"
                    variant="outline"
                  >
                    {t(`Add segment`)}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          {segments.fields.length === 0 && activeSegmentIndex === -1 ? <p className="text-sm text-muted-foreground">{t(`Select New Segment to create your first segment.`)}</p> : null}
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
  );
};
