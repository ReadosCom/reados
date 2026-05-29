import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTranslation } from "@components/i18n/useTranslation.ts";
import { accountMemberReportingSchema, accountMemberTypeSchema, memberEditorSchema, type Member as MemberRecord } from "@components/member/member.schema.ts";
import type { SegmentType } from "@components/segment/segment.schema.ts";
import { Button } from "@components/uiframework/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/uiframework/Form";
import { Input } from "@components/uiframework/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/uiframework/Select";

const formSchema = memberEditorSchema.extend({ parent: z.string().nullable() });
type MemberFormValues = z.infer<typeof formSchema>;

const getDefaultValues = (member?: MemberRecord, initialValues?: Partial<MemberFormValues>): MemberFormValues => ({
  code: member?.code ?? ``,
  name: member?.name ?? ``,
  description: member?.description ?? ``,
  parent: member?.parent ?? null,
  type: member?.type ?? undefined,
  reporting: member?.reporting ?? undefined,
  ...initialValues,
});

export const Member = ({
  excludedMemberId,
  isSaving,
  initialValues,
  member,
  members,
  onCancel,
  onSubmit,
  segmentType,
  submitLabel,
}: {
  excludedMemberId?: string;
  isSaving: boolean;
  initialValues?: Partial<MemberFormValues>;
  member?: MemberRecord;
  members: MemberRecord[];
  onCancel?: () => void;
  onSubmit: (values: MemberFormValues) => Promise<void>;
  segmentType: SegmentType;
  submitLabel: string;
}) => {
  const { t } = useTranslation(`./Segment.i18n.ts`);
  const form = useForm<MemberFormValues>({ defaultValues: getDefaultValues(member, initialValues), resolver: zodResolver(formSchema) });

  useEffect(() => {
    form.reset(getDefaultValues(member, initialValues));
  }, [form, initialValues, member]);

  return (
    <Form {...form}>
      <form
        className="space-y-3"
        onSubmit={(event) =>
          void form.handleSubmit(async (values) => {
            await onSubmit({
              ...values,
              parent: values.parent && values.parent.length > 0 ? values.parent : null,
              reporting: segmentType === `account` ? values.reporting : undefined,
              type: segmentType === `account` ? values.type : undefined,
            });
          })(event)
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`Code`)}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`Name`)}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t(`Description`)}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-3 md:grid-cols-2">
          <FormField
            control={form.control}
            name="parent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t(`Parent`)}</FormLabel>
                <FormControl>
                  <Select onValueChange={(value) => field.onChange(value === `none` ? null : value)} value={field.value ?? `none`}>
                    <SelectTrigger>
                      <SelectValue placeholder={t(`No parent`)} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t(`No parent`)}</SelectItem>
                      {members
                        .filter((candidate) => candidate.id !== excludedMemberId)
                        .map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id}>
                            {candidate.code} - {candidate.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {segmentType === `account` ? (
            <>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(`Type`)}</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <SelectTrigger>
                          <SelectValue placeholder={t(`Select type`)} />
                        </SelectTrigger>
                        <SelectContent>
                          {accountMemberTypeSchema.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reporting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(`Reporting`)}</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                        <SelectTrigger>
                          <SelectValue placeholder={t(`Select reporting`)} />
                        </SelectTrigger>
                        <SelectContent>
                          {accountMemberReportingSchema.options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : null}
        </div>
        <div className="flex justify-end gap-2">
          {onCancel ? (
            <Button onClick={onCancel} type="button" variant="outline">
              {t(`Cancel`)}
            </Button>
          ) : null}
          <Button disabled={isSaving} type="submit">
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};
