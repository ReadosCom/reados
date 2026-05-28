import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTranslation } from '@components/i18n/useTranslation.ts';
import { useCreateSegmentMutation, useDeleteSegmentMutation, useUpdateSegmentMutation } from '@components/segment/segment.query.ts';
import { segmentSchema, type Segment as SegmentRecord } from '@components/segment/segment.schema.ts';
import { Badge } from '@components/uiframework/Badge';
import { Button } from '@components/uiframework/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@components/uiframework/Dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/uiframework/Form';
import { Input } from '@components/uiframework/Input';
import { TabsContent } from '@components/uiframework/Tabs';
import { z } from 'zod';
import { Member } from "@components/member/Member.tsx";

const accountingSegmentFormSchema = segmentSchema.pick({
  label: true,
});

type SegmentFormValues = z.infer<typeof accountingSegmentFormSchema>;

type SegmentProps = {
  nextOrder: number;
  onCreated: (segmentId: string) => void;
  onDeleted: (segmentId: string) => void;
  segment?: SegmentRecord;
  tabValue: string;
};

export const Segment = ({ nextOrder, onCreated, onDeleted, segment, tabValue }: SegmentProps) => {
  const { t } = useTranslation(`./Segment.i18n.ts`);
  const { mutateAsync: createSegmentAsync, isPending: isCreateSegmentPending } = useCreateSegmentMutation();
  const { mutateAsync: deleteSegmentAsync, isPending: isDeleteSegmentPending } = useDeleteSegmentMutation();
  const { mutateAsync: updateSegmentAsync, isPending: isUpdateSegmentPending } = useUpdateSegmentMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveState, setSaveState] = useState<`error` | `idle` | `saved`>(`idle`);
  const form = useForm<SegmentFormValues>({
    defaultValues: {
      label: segment?.label ?? ``,
    },
    resolver: zodResolver(accountingSegmentFormSchema),
  });

  useEffect(() => {
    form.reset({
      label: segment?.label ?? ``,
    });
  }, [form, segment]);

  const isRequired = segment?.required === true;
  const canRemove = Boolean(segment) && !isRequired;
  const isUpdating = isCreateSegmentPending || isDeleteSegmentPending || isUpdateSegmentPending;

  const onSubmit = async (values: SegmentFormValues) => {
    setSaveState(`idle`);

    try {
      if (!segment) {
        const createdSegment = await createSegmentAsync({
          label: values.label,
          order: nextOrder,
          required: false,
        });
        setSaveState(`saved`);
        setIsModalOpen(false);
        onCreated(createdSegment.id);
        return;
      }

      if (segment.label !== values.label) {
        await updateSegmentAsync({
          body: {
            label: values.label,
          },
          id: segment.id,
        });
      }

      setSaveState(`saved`);
      setIsModalOpen(false);
    } catch {
      setSaveState(`error`);
    }
  };

  const onRemove = async () => {
    if (!segment || !canRemove) {
      return;
    }

    setSaveState(`idle`);

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
        <p className="text-sm text-muted-foreground">{segment ? segment.label : t(`Create a new segment.`)}</p>
        <div className="flex justify-end gap-2">
          {canRemove && segment ? (
            <Button disabled={isUpdating} onClick={onRemove} type="button" variant="outline">
              {isDeleteSegmentPending ? t(`Removing...`) : t(`Remove`)}
            </Button>
          ) : null}
          <Button onClick={() => setIsModalOpen(true)} type="button">
            {segment ? t(`Edit segment`) : t(`Create segment`)}
          </Button>
        </div>
      </div>
      {segment && !canRemove ? <div className="flex justify-end"><Badge variant="secondary">{t(`Required segments can't be deleted`)}</Badge></div> : null}
      {saveState === `saved` ? <p className="text-sm text-muted-foreground">{t(`Segment saved.`)}</p> : null}
      {saveState === `error` ? <p className="text-sm text-destructive">{t(`Could not save segment right now.`)}</p> : null}
      <Dialog onOpenChange={setIsModalOpen} open={isModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{segment ? t(`Edit segment`) : t(`Create segment`)}</DialogTitle>
            <DialogDescription>{t(`Set segment label.`)}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              className="space-y-3"
              onSubmit={(event) => {
                void form.handleSubmit(onSubmit)(event);
              }}
            >
              <FormField
                control={form.control}
                name="label"
                render={({ field: segmentLabelField }) => (
                  <FormItem>
                    <FormLabel>{t(`Label`)}</FormLabel>
                    <FormControl>
                      <Input {...segmentLabelField} disabled={isUpdating} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button disabled={isUpdating} type="submit">
                  {isCreateSegmentPending || isUpdateSegmentPending ? t(`Saving...`) : t(`Save segment`)}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {segment ? <Member segmentId={segment.id} segmentType={segment.type} /> : null}
    </TabsContent>
  );
};
