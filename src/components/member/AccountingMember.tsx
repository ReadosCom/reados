import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "@components/i18n/useTranslation.ts";
import { useAccountTemplatesQuery, useApplyAccountTemplateMutation, useCreateMemberMutation, useMembersQuery } from "@components/member/member.query.ts";
import { accountMemberTypeSchema, createMemberBodySchema } from "@components/member/member.schema.ts";
import type { SegmentType } from "@components/segment/segment.schema.ts";
import { Button } from "@components/uiframework/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/uiframework/Form";
import { Input } from "@components/uiframework/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/uiframework/Select";

const formSchema = createMemberBodySchema.extend({ parent: z.string().nullable() });

export const AccountingMember = ({ segmentId, segmentType }: { segmentId: string; segmentType: SegmentType }) => {
  const { t } = useTranslation(`./AccountingSegment.i18n.ts`);
  const membersQuery = useMembersQuery(segmentId);
  const templatesQuery = useAccountTemplatesQuery(segmentId);
  const createMutation = useCreateMemberMutation(segmentId);
  const applyTemplateMutation = useApplyAccountTemplateMutation(segmentId);
  const form = useForm<z.infer<typeof formSchema>>({ defaultValues: { code: ``, description: ``, name: ``, parent: null, type: undefined }, resolver: zodResolver(formSchema) });

  const members = membersQuery.data ?? [];
  const showTemplateApply = segmentType === `account` && members.length === 0;

  return (
    <section className="space-y-3 rounded-md border border-border p-3">
      <h3 className="text-sm font-medium">{t(`Members`)}</h3>
      {showTemplateApply ? (
        <div className="space-y-2 rounded-md border border-dashed p-3">
          <p className="text-sm text-muted-foreground">{t(`Account segment is empty. You can apply a starter template or create members manually.`)}</p>
          <div className="flex flex-wrap justify-end gap-2">
            {(templatesQuery.data ?? []).map((template) => (
              <Button key={template.id} onClick={() => void applyTemplateMutation.mutateAsync(template.id)} type="button" variant="outline">
                {t(`Apply`)} {template.label}
              </Button>
            ))}
          </div>
          {applyTemplateMutation.isError ? <p className="text-sm text-destructive">{t(`Could not apply account template right now.`)}</p> : null}
        </div>
      ) : null}

      <Form {...form}>
        <form className="space-y-3" onSubmit={(event) => void form.handleSubmit(async (values) => {
          await createMutation.mutateAsync({ ...values, parent: values.parent && values.parent.length > 0 ? values.parent : null, type: segmentType === `account` ? values.type : undefined });
          form.reset({ code: ``, description: ``, name: ``, parent: null, type: undefined });
        })(event)}>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField control={form.control} name="code" render={({ field }) => <FormItem><FormLabel>{t(`Code`)}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>{t(`Name`)}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
          </div>
          <FormField control={form.control} name="description" render={({ field }) => <FormItem><FormLabel>{t(`Description`)}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
          <div className="grid gap-3 md:grid-cols-2">
            <FormField control={form.control} name="parent" render={({ field }) => <FormItem><FormLabel>{t(`Parent`)}</FormLabel><FormControl><Select onValueChange={(value) => field.onChange(value === `none` ? null : value)} value={field.value ?? `none`}><SelectTrigger><SelectValue placeholder={t(`No parent`)} /></SelectTrigger><SelectContent><SelectItem value="none">{t(`No parent`)}</SelectItem>{members.map((member) => <SelectItem key={member.id} value={member.id}>{member.code} - {member.name}</SelectItem>)}</SelectContent></Select></FormControl><FormMessage /></FormItem>} />
            {segmentType === `account` ? <FormField control={form.control} name="type" render={({ field }) => <FormItem><FormLabel>{t(`Type`)}</FormLabel><FormControl><Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder={t(`Select type`)} /></SelectTrigger><SelectContent>{accountMemberTypeSchema.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></FormControl><FormMessage /></FormItem>} /> : null}
          </div>
          {createMutation.isError ? <p className="text-sm text-destructive">{t(`Could not create member right now.`)}</p> : null}
          <div className="flex justify-end"><Button type="submit">{t(`Create member`)}</Button></div>
        </form>
      </Form>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm"><thead><tr className="border-b"><th className="p-2 text-left">{t(`Code`)}</th><th className="p-2 text-left">{t(`Name`)}</th><th className="p-2 text-left">{t(`Type`)}</th><th className="p-2 text-left">{t(`Parent`)}</th></tr></thead><tbody>
          {members.map((member) => <tr className="border-b" key={member.id}><td className="p-2">{member.code}</td><td className="p-2">{member.name}</td><td className="p-2">{member.type ?? `-`}</td><td className="p-2">{members.find((entry) => entry.id === member.parent)?.name ?? `-`}</td></tr>)}
        </tbody></table>
      </div>
    </section>
  );
};
