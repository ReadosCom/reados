import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "@components/i18n/useTranslation.ts";
import { useCreateSegmentMutation, useUpdateSegmentMutation } from "@components/segment/segment.query.ts";
import { segmentSchema, type Segment as SegmentRecord } from "@components/segment/segment.schema.ts";
import { Button } from "@components/uiframework/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/uiframework/Dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/uiframework/Form";
import { Input } from "@components/uiframework/Input";

const segmentFormSchema = segmentSchema.pick({
  label: true,
});

type SegmentFormValues = z.infer<typeof segmentFormSchema>;

type SegmentEditorDialogProps =
  | {
      mode: `create`;
      nextOrder: number;
      onOpenChange: (open: boolean) => void;
      onSaved?: (segmentId: string) => void;
      open: boolean;
    }
  | {
      mode: `edit`;
      segment: SegmentRecord;
      onOpenChange: (open: boolean) => void;
      onSaved?: (segmentId: string) => void;
      open: boolean;
    };

export const SegmentEditorDialog = (props: SegmentEditorDialogProps) => {
  const { mode, onOpenChange, onSaved, open } = props;
  const { t } = useTranslation(`./Segment.i18n.ts`);
  const { mutateAsync: createSegmentAsync, isPending: isCreateSegmentPending } = useCreateSegmentMutation();
  const { mutateAsync: updateSegmentAsync, isPending: isUpdateSegmentPending } = useUpdateSegmentMutation();
  const [saveState, setSaveState] = useState<`error` | `idle`>(`idle`);
  const segment = mode === `edit` ? props.segment : undefined;
  const form = useForm<SegmentFormValues>({
    defaultValues: {
      label: segment?.label ?? ``,
    },
    resolver: zodResolver(segmentFormSchema),
  });

  useEffect(() => {
    form.reset({
      label: segment?.label ?? ``,
    });
  }, [form, segment, open]);

  const isSaving = isCreateSegmentPending || isUpdateSegmentPending;

  const onSubmit = async (values: SegmentFormValues) => {
    setSaveState(`idle`);

    try {
      if (mode === `create`) {
        const createdSegment = await createSegmentAsync({
          label: values.label,
          order: props.nextOrder,
          required: false,
        });
        onOpenChange(false);
        onSaved?.(createdSegment.id);
        return;
      }

      const editSegment = props.segment;

      if (editSegment.label !== values.label) {
        await updateSegmentAsync({
          body: {
            label: values.label,
          },
          id: editSegment.id,
        });
      }

      onOpenChange(false);
      onSaved?.(editSegment.id);
    } catch {
      setSaveState(`error`);
    }
  };

  return (
    <Dialog
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setSaveState(`idle`);
        }
        onOpenChange(nextOpen);
      }}
      open={open}
    >
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
                    <Input {...segmentLabelField} disabled={isSaving} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {saveState === `error` ? <p className="text-sm text-destructive">{t(`Could not save segment right now.`)}</p> : null}
            <div className="flex justify-end gap-2">
              <Button
                disabled={isSaving}
                onClick={() => {
                  onOpenChange(false);
                }}
                type="button"
                variant="outline"
              >
                {t(`Cancel`)}
              </Button>
              <Button disabled={isSaving} type="submit">
                {isSaving ? t(`Saving...`) : t(`Save segment`)}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
