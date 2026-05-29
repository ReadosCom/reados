import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useTranslation } from '@components/i18n/useTranslation.ts';
import { useSegmentsQuery } from '@components/segment/segment.query.ts';
import type { Segment as SegmentRecord } from '@components/segment/segment.schema.ts';
import { Skeleton } from '@components/uiframework/Skeleton';
import { Tabs, TabsList, TabsTrigger } from '@components/uiframework/Tabs';

import { Segment } from "./Segment.tsx";

const accountingSegmentsPath = `/erp/accounting/configuration/segments`;

const sortSegments = (segments: SegmentRecord[]) => {
  return [...segments].sort((left, right) => left.order - right.order);
};

export const Segments = () => {
  const { t } = useTranslation(`./Segments.i18n.ts`);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: segmentData, isError: isSegmentError, isPending: isSegmentPending } = useSegmentsQuery();
  const routeSegmentId = location.pathname.split(`/`).at(-1) ?? ``;
  const activeTabValue = routeSegmentId;
  const segments = sortSegments(segmentData ?? []);

  useEffect(() => {
    const isSegmentsRoute = location.pathname === accountingSegmentsPath || location.pathname.startsWith(`${accountingSegmentsPath}/`);

    if (!isSegmentsRoute) {
      return;
    }

    if (isSegmentPending || !segmentData) {
      return;
    }

    const hasRouteSegment = segmentData.some((segment) => segment.id === routeSegmentId);

    if (hasRouteSegment) {
      return;
    }

    const fallbackSegmentId = sortSegments(segmentData).at(0)?.id;
    if (!fallbackSegmentId) {
      return;
    }
    void navigate({
      replace: true,
      to: `/erp/accounting/configuration/segments/${fallbackSegmentId}` as never,
    } as never);
  }, [isSegmentPending, location.pathname, navigate, routeSegmentId, segmentData]);

  const activeSegmentIndex = segments.findIndex((segment) => segment.id === activeTabValue);

  if (isSegmentPending) {
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
        value={activeTabValue}
      >
        <TabsList variant="line">
          {segments.map((segment, index) => {
            const segmentLabel = segment.label.trim().length > 0 ? segment.label : `${t(`Segment`)} ${index + 1}`;

            return (
              <TabsTrigger key={segment.id} value={segment.id}>
                {segmentLabel}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {segments.map((segment) => (
          <Segment
            key={segment.id}
            onDeleted={(segmentId) => {
              const fallbackSegmentId = segments.find((nextSegment) => nextSegment.id !== segmentId)?.id;
              if (!fallbackSegmentId) {
                return;
              }
              void navigate({
                replace: true,
                to: `/erp/accounting/configuration/segments/${fallbackSegmentId}` as never,
              } as never);
            }}
            segment={segment}
            tabValue={segment.id}
          />
        ))}
      </Tabs>
      {segments.length === 0 && activeSegmentIndex === -1 ? <p className="text-sm text-muted-foreground">{t(`No segments yet. Create one from Segment List.`)}</p> : null}
      {isSegmentError ? <p className="text-sm text-destructive">{t(`Could not load accounting configuration right now.`)}</p> : null}
    </section>
  );
};
