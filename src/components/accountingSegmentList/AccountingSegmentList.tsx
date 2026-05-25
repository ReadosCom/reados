import { useTranslation } from '@components/i18n/useTranslation.ts';
import { useDeleteSegmentMutation, useReorderSegmentMutation, useSegmentsQuery } from '@components/segment/segment.query.ts';
import { Button } from '@components/uiframework/Button';
import { Skeleton } from '@components/uiframework/Skeleton';
import { IconChevronDown, IconChevronUp, IconTrash } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

/**
 * Renders a read-only table of accounting segments.
 */
export const AccountingSegmentList = () => {
  const { t } = useTranslation(`./AccountingSegmentList.i18n.ts`);
  const navigate = useNavigate();
  const { data: segmentData, isError, isPending } = useSegmentsQuery();
  const { mutateAsync: reorderSegmentAsync, isPending: isReorderSegmentPending } = useReorderSegmentMutation();
  const { mutateAsync: deleteSegmentAsync, isPending: isDeleteSegmentPending } = useDeleteSegmentMutation();
  const [deleteState, setDeleteState] = useState<`error` | `idle`>(`idle`);
  const [reorderState, setReorderState] = useState<`error` | `idle`>(`idle`);
  const segments = [...(segmentData ?? [])].sort((left, right) => left.order - right.order);

  const onMoveSegment = async (segmentId: string, direction: -1 | 1) => {
    const sourceIndex = segments.findIndex((segment) => segment.id === segmentId);
    const targetIndex = sourceIndex + direction;

    if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= segments.length) {
      return;
    }

    setReorderState(`idle`);

    try {
      await reorderSegmentAsync({
        body: { direction: direction === -1 ? `up` : `down` },
        id: segmentId,
      });
    } catch {
      setReorderState(`error`);
    }
  };

  const deleteSegment = async (id: string) => {
    setDeleteState(`idle`);

    try {
      await deleteSegmentAsync(id);
    } catch {
      setDeleteState(`error`);
    }
  };

  if (isPending) {
    return (
      <section className="space-y-3" aria-label={t(`Segment List`)}>
        <p className="text-sm text-muted-foreground">{t(`Loading segment list...`)}</p>
        <Skeleton className="h-72 rounded-xl" />
      </section>
    );
  }

  return (
    <section className="space-y-3" aria-label={t(`Segment List`)}>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            void navigate({ to: `/erp/accounting/configuration/segments/new-segment` as never } as never);
          }}
          type="button"
        >
          {t(`New Segment`)}
        </Button>
      </div>
      {isError ? <p className="text-sm text-destructive">{t(`Could not load segment list right now.`)}</p> : null}
      {deleteState === `error` ? <p className="text-sm text-destructive">{t(`Could not delete segment right now.`)}</p> : null}
      {reorderState === `error` ? <p className="text-sm text-destructive">{t(`Could not reorder segments right now.`)}</p> : null}
      {!isError && segments.length === 0 ? <p className="text-sm text-muted-foreground">{t(`No segments yet.`)}</p> : null}
      {!isError && segments.length > 0 ? (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b border-border">
                <th className="h-10 px-3 text-left align-middle font-medium">{t(`Label`)}</th>
                <th className="h-10 px-3 text-left align-middle font-medium">{t(`Required`)}</th>
                <th className="h-10 px-3 text-right align-middle font-medium">{t(`Actions`)}</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {segments.map((segment, index) => (
                <tr className="border-b border-border" key={segment.id}>
                  <td className="p-3 align-middle">{segment.label}</td>
                  <td className="p-3 align-middle">{segment.required ? t(`Yes`) : t(`No`)}</td>
                  <td className="p-3 align-middle">
                    <div className="flex justify-end gap-1">
                      <Button
                        aria-label={t(`Move segment up`)}
                        className="h-7 w-7 p-0"
                        disabled={isReorderSegmentPending || isDeleteSegmentPending || index === 0}
                        onClick={() => {
                          void onMoveSegment(segment.id, -1);
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <IconChevronUp aria-hidden stroke={2} />
                      </Button>
                      <Button
                        aria-label={t(`Move segment down`)}
                        className="h-7 w-7 p-0"
                        disabled={isReorderSegmentPending || isDeleteSegmentPending || index === segments.length - 1}
                        onClick={() => {
                          void onMoveSegment(segment.id, 1);
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <IconChevronDown aria-hidden stroke={2} />
                      </Button>
                      <Button
                        aria-label={t(`Delete segment`)}
                        className="h-7 w-7 p-0"
                        disabled={segment.required || isReorderSegmentPending || isDeleteSegmentPending}
                        onClick={() => {
                          void deleteSegment(segment.id);
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        <IconTrash aria-hidden stroke={2} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};
