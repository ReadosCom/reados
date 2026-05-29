import { useState } from "react";

import { useTranslation } from "@components/i18n/useTranslation.ts";
import { MemberList } from "@components/member/MemberList.tsx";
import { SegmentEditorDialog } from "@components/segment/SegmentEditorDialog.tsx";
import { useDeleteSegmentMutation } from "@components/segment/segment.query.ts";
import { type Segment as SegmentRecord } from "@components/segment/segment.schema.ts";
import { Badge } from "@components/uiframework/Badge";
import { Button } from "@components/uiframework/Button";
import { TabsContent } from "@components/uiframework/Tabs";

type SegmentProps = {
  onDeleted: (segmentId: string) => void;
  segment: SegmentRecord;
  tabValue: string;
};

export const Segment = ({ onDeleted, segment, tabValue }: SegmentProps) => {
  const { t } = useTranslation(`./Segment.i18n.ts`);
  const { mutateAsync: deleteSegmentAsync, isPending: isDeleteSegmentPending } = useDeleteSegmentMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveState, setSaveState] = useState<`error` | `idle`>(`idle`);
  const isRequired = segment.required === true;
  const canRemove = !isRequired;

  const onRemove = async () => {
    if (!canRemove) {
      return;
    }

    try {
      await deleteSegmentAsync(segment.id);
      onDeleted(segment.id);
    } catch {
      setSaveState(`error`);
    }
  };

  return (
    <TabsContent className="space-y-3 rounded-md border border-border p-3" value={tabValue}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{segment.label}</p>
        <div className="flex justify-end gap-2">
          {canRemove ? (
            <Button disabled={isDeleteSegmentPending} onClick={onRemove} type="button" variant="outline">
              {isDeleteSegmentPending ? t(`Removing...`) : t(`Remove`)}
            </Button>
          ) : null}
          <Button onClick={() => setIsModalOpen(true)} type="button">
            {t(`Edit segment`)}
          </Button>
        </div>
      </div>
      {!canRemove ? (
        <div className="flex justify-end">
          <Badge variant="secondary">{t(`Required segments can't be deleted`)}</Badge>
        </div>
      ) : null}
      {saveState === `error` ? <p className="text-sm text-destructive">{t(`Could not save segment right now.`)}</p> : null}
      <SegmentEditorDialog mode="edit" onOpenChange={setIsModalOpen} open={isModalOpen} segment={segment} />
      <MemberList segmentId={segment.id} segmentType={segment.type} />
    </TabsContent>
  );
};
