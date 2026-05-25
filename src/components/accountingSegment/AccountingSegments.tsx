import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';

import { useTranslation } from '@components/i18n/useTranslation.ts';
import { useSegmentsQuery } from '@components/segment/segment.query.ts';
import type { Segment } from '@components/segment/segment.schema.ts';
import { Skeleton } from '@components/uiframework/Skeleton';
import { Tabs, TabsList, TabsTrigger } from '@components/uiframework/Tabs';

import { useAccountingConfigurationQuery, useFinalizeAccountingConfigurationMutation } from '@components/accountingConfiguration/accountingConfiguration.query.ts';
import { Button } from '@components/uiframework/Button';
import { AccountingSegment } from './AccountingSegment.tsx';

const accountingSegmentsPath = `/erp/accounting/configuration/segments`;
const newSegmentTabValue = `new-segment`;

const sortSegments = (segments: Segment[]) => {
  return [...segments].sort((left, right) => left.order - right.order);
};

export const AccountingSegments = () => {
  const { t } = useTranslation(`./AccountingSegments.i18n.ts`);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: configurationData, isError: isConfigurationError, isPending: isConfigurationPending } = useAccountingConfigurationQuery();
  const { data: segmentData, isError: isSegmentError, isPending: isSegmentPending } = useSegmentsQuery();
  const { mutateAsync: finalizeConfigurationAsync, isPending: isFinalizePending } = useFinalizeAccountingConfigurationMutation();
  const [finalizeState, setFinalizeState] = useState<`error` | `idle` | `success`>(`idle`);
  const routeSegmentId = location.pathname.split(`/`).at(-1) ?? newSegmentTabValue;
  const activeTabValue = routeSegmentId;
  const segments = sortSegments(segmentData ?? []);

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

    const fallbackSegmentId = sortSegments(segmentData).at(0)?.id ?? newSegmentTabValue;
    void navigate({
      replace: true,
      to: `/erp/accounting/configuration/segments/${fallbackSegmentId}` as never,
    } as never);
  }, [isSegmentPending, location.pathname, navigate, routeSegmentId, segmentData]);

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

  const isFinalized = configurationData?.configuration.finalized === true;
  const activeSegmentIndex = segments.findIndex((segment) => segment.id === activeTabValue);

  if (isConfigurationPending || isSegmentPending) {
    return (
      <>
        <p className="text-sm text-muted-foreground">{t(`Loading accounting configuration...`)}</p>
        <Skeleton className="h-96 rounded-xl" />
      </>
    );
  }

  return (
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
          {segments.map((segment, index) => {
            const segmentLabel = segment.label.trim().length > 0 ? segment.label : `${t(`Segment`)} ${index + 1}`;

            return (
              <TabsTrigger key={segment.id} value={segment.id}>
                {segmentLabel}
              </TabsTrigger>
            );
          })}
          <TabsTrigger value={newSegmentTabValue}>{t(`New Segment`)}</TabsTrigger>
        </TabsList>
        {segments.map((segment) => (
          <AccountingSegment
            isFinalized={isFinalized}
            key={segment.id}
            nextOrder={segments.length}
            onCreated={(segmentId) => {
              void navigate({
                to: `/erp/accounting/configuration/segments/${segmentId}` as never,
              } as never);
            }}
            onDeleted={(segmentId) => {
              const fallbackSegmentId = segments.find((nextSegment) => nextSegment.id !== segmentId)?.id ?? newSegmentTabValue;
              void navigate({
                replace: true,
                to: `/erp/accounting/configuration/segments/${fallbackSegmentId}` as never,
              } as never);
            }}
            segment={segment}
            tabValue={segment.id}
          />
        ))}
        <AccountingSegment
          isFinalized={isFinalized}
          nextOrder={segments.length}
          onCreated={(segmentId) => {
            void navigate({
              to: `/erp/accounting/configuration/segments/${segmentId}` as never,
            } as never);
          }}
          onDeleted={() => {}}
          tabValue={newSegmentTabValue}
        />
      </Tabs>
      {segments.length === 0 && activeSegmentIndex === -1 ? <p className="text-sm text-muted-foreground">{t(`Select New Segment to create your first segment.`)}</p> : null}
      {isConfigurationError || isSegmentError ? <p className="text-sm text-destructive">{t(`Could not load accounting configuration right now.`)}</p> : null}
      {isFinalized ? <p className="text-sm text-muted-foreground">{t(`Configuration is finalized. Segment deletion is disabled.`)}</p> : null}
      {finalizeState === `success` ? <p className="text-sm text-muted-foreground">{t(`Configuration finalized.`)}</p> : null}
      {finalizeState === `error` ? <p className="text-sm text-destructive">{t(`Could not finalize accounting configuration right now.`)}</p> : null}
      <div className="flex justify-end">
        <Button
          disabled={isFinalized || isFinalizePending}
          onClick={() => {
            void onFinalize();
          }}
          type="button"
          variant="outline"
        >
          {isFinalizePending ? t(`Finalizing...`) : t(`Finalize Configuration`)}
        </Button>
      </div>
    </section>
  );
};
