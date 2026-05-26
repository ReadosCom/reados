import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTranslation } from '@components/i18n/useTranslation.ts';
import { useCreateSegmentMutation, useDeleteSegmentMutation, useUpdateSegmentMutation } from '@components/segment/segment.query.ts';
import { segmentSchema, type Segment } from '@components/segment/segment.schema.ts';
import { Badge } from '@components/uiframework/Badge';
import { Button } from '@components/uiframework/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@components/uiframework/Form';
import { Input } from '@components/uiframework/Input';
import { TabsContent } from '@components/uiframework/Tabs';
import { z } from 'zod';

const accountingSegmentFormSchema = segmentSchema.pick({
  label: true,
});

type AccountingSegmentFormValues = z.infer<typeof accountingSegmentFormSchema>;

type AccountingSegmentProps = {
  nextOrder: number;
  onCreated: (segmentId: string) => void;
  onDeleted: (segmentId: string) => void;
  segment?: Segment;
  tabValue: string;
};

export const AccountingSegment = ({ nextOrder, onCreated, onDeleted, segment, tabValue }: AccountingSegmentProps) => {
  const { t } = useTranslation(`./AccountingSegment.i18n.ts`);
  const { mutateAsync: createSegmentAsync, isPending: isCreateSegmentPending } = useCreateSegmentMutation();
  const { mutateAsync: deleteSegmentAsync, isPending: isDeleteSegmentPending } = useDeleteSegmentMutation();
  const { mutateAsync: updateSegmentAsync, isPending: isUpdateSegmentPending } = useUpdateSegmentMutation();
  const [saveState, setSaveState] = useState<`error` | `idle` | `saved`>(`idle`);
  const form = useForm<AccountingSegmentFormValues>({
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

  const onSubmit = async (values: AccountingSegmentFormValues) => {
    setSaveState(`idle`);

    try {
      if (!segment) {
        const createdSegment = await createSegmentAsync({
          label: values.label,
          order: nextOrder,
          required: false,
        });
        setSaveState(`saved`);
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
          {saveState === `saved` ? <p className="text-sm text-muted-foreground">{t(`Segment saved.`)}</p> : null}
          {saveState === `error` ? <p className="text-sm text-destructive">{t(`Could not save segment right now.`)}</p> : null}
          <div className="flex justify-end gap-2 pt-1">
            {canRemove && segment ? (
              <Button disabled={isUpdating} onClick={onRemove} type="button" variant="outline">
                {isDeleteSegmentPending ? t(`Removing...`) : t(`Remove`)}
              </Button>
            ) : null}
            {segment && !canRemove ? <Badge variant="secondary">{t(`Required segments can't be deleted`)}</Badge> : null}
            <Button disabled={isUpdating} type="submit">
              {isCreateSegmentPending || isUpdateSegmentPending ? t(`Saving...`) : t(`Save segment`)}
            </Button>
          </div>
        </form>
      </Form>
    </TabsContent>
  );
};
