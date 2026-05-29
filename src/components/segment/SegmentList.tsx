import { useTranslation } from "@components/i18n/useTranslation.ts";
import { useAwaitedPrompt } from "@components/prompt/prompt.context.ts";
import { SegmentEditorDialog } from "@components/segment/SegmentEditorDialog.tsx";
import { useDeleteSegmentMutation, useReorderSegmentMutation, useSegmentsQuery } from "@components/segment/segment.query.ts";
import type { Segment as SegmentRecord } from "@components/segment/segment.schema.ts";
import { Button } from "@components/uiframework/Button";
import { ButtonGroup } from "@components/uiframework/ButtonGroup";
import { DataTable } from "@components/uiframework/DataTable.tsx";
import { Skeleton } from "@components/uiframework/Skeleton";
import { IconChevronDown, IconChevronUp, IconPencil, IconTrash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";

/**
 * Renders a read-only table of accounting segments.
 */
export const SegmentList = () => {
  const { t } = useTranslation(`./SegmentList.i18n.ts`);
  const { confirm } = useAwaitedPrompt();
  const { data: segmentData, isError, isPending } = useSegmentsQuery();
  const { mutateAsync: reorderSegmentAsync, isPending: isReorderSegmentPending } = useReorderSegmentMutation();
  const { mutateAsync: deleteSegmentAsync, isPending: isDeleteSegmentPending } = useDeleteSegmentMutation();
  const [deleteState, setDeleteState] = useState<`error` | `idle`>(`idle`);
  const [reorderState, setReorderState] = useState<`error` | `idle`>(`idle`);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<SegmentRecord | undefined>(undefined);
  const segments = [...(segmentData ?? [])].sort((left, right) => left.order - right.order);

  const onMoveSegment = useCallback(
    async (segmentId: string, direction: -1 | 1) => {
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
    },
    [reorderSegmentAsync, segments],
  );

  const deleteSegment = useCallback(
    async (id: string) => {
      const shouldDelete = await confirm({
        confirmLabel: t(`Delete`),
        description: t(`Are you sure, segment deletion will re-shape whole General Ledger?`),
        title: t(`Delete segment`),
        variant: `destructive`,
      });

      if (!shouldDelete) {
        return;
      }

      setDeleteState(`idle`);

      try {
        await deleteSegmentAsync(id);
      } catch {
        setDeleteState(`error`);
      }
    },
    [confirm, deleteSegmentAsync, t],
  );

  const columns = useMemo<ColumnDef<SegmentRecord>[]>(
    () => [
      {
        id: `actions`,
        meta: {
          cellClassName: `w-[8rem] whitespace-nowrap px-1`,
          headerClassName: `w-[8rem] whitespace-nowrap px-1`,
        },
        header: () => <span className="whitespace-nowrap">{t(`Actions`)}</span>,
        cell: ({ row }) => {
          const segment = row.original;
          const index = row.index;

          return (
            <div className="w-1 whitespace-nowrap">
              <ButtonGroup>
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
                  aria-label={t(`Edit segment`)}
                  className="h-7 w-7 p-0"
                  disabled={isReorderSegmentPending || isDeleteSegmentPending}
                  onClick={() => {
                    setSelectedSegment(segment);
                    setIsEditorOpen(true);
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <IconPencil aria-hidden stroke={2} />
                </Button>
                <Button
                  aria-label={t(`Delete segment`)}
                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
              </ButtonGroup>
            </div>
          );
        },
      },
      {
        accessorKey: `label`,
        header: t(`Label`),
      },
      {
        accessorKey: `type`,
        header: t(`Type`),
        cell: ({ row }) => <>{row.original.type === `entity` ? t(`Entity`) : row.original.type === `account` ? t(`Account`) : t(`Generic`)}</>,
      },
      {
        accessorKey: `required`,
        header: t(`Required`),
        cell: ({ row }) => <>{row.original.required ? t(`Yes`) : t(`No`)}</>,
      },
    ],
    [deleteSegment, isDeleteSegmentPending, isReorderSegmentPending, onMoveSegment, segments.length, t],
  );

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
            setSelectedSegment(undefined);
            setIsEditorOpen(true);
          }}
          type="button"
        >
          {t(`New Segment`)}
        </Button>
      </div>
      {isError ? <p className="text-sm text-destructive">{t(`Could not load segment list right now.`)}</p> : null}
      {deleteState === `error` ? <p className="text-sm text-destructive">{t(`Could not delete segment right now.`)}</p> : null}
      {reorderState === `error` ? <p className="text-sm text-destructive">{t(`Could not reorder segments right now.`)}</p> : null}
      <DataTable columns={columns} data={segments} emptyMessage={t(`No segments yet.`)} errorMessage={t(`Could not load segment list right now.`)} isError={isError} isLoading={false} />
      {selectedSegment ? (
        <SegmentEditorDialog mode="edit" onOpenChange={setIsEditorOpen} open={isEditorOpen} segment={selectedSegment} />
      ) : (
        <SegmentEditorDialog mode="create" nextOrder={segments.length} onOpenChange={setIsEditorOpen} open={isEditorOpen} />
      )}
    </section>
  );
};
