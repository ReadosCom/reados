import { useState } from "react";
import { useTranslation } from "@components/i18n/useTranslation.ts";
import { MemberEditor } from "@components/member/MemberEditor.tsx";
import { useAccountTemplatesQuery, useApplyAccountTemplateMutation, useCreateMemberMutation, useMembersQuery, useUpdateMemberMutation } from "@components/member/member.query.ts";
import type { Member as MemberRecord } from "@components/member/member.schema.ts";
import type { SegmentType } from "@components/segment/segment.schema.ts";
import { Button } from "@components/uiframework/Button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/uiframework/Dialog";

export const Member = ({ segmentId, segmentType }: { segmentId: string; segmentType: SegmentType }) => {
  const { t } = useTranslation(`./Segment.i18n.ts`);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberRecord | null>(null);
  const membersQuery = useMembersQuery(segmentId);
  const templatesQuery = useAccountTemplatesQuery(segmentId);
  const createMutation = useCreateMemberMutation(segmentId);
  const updateMutation = useUpdateMemberMutation(segmentId);
  const applyTemplateMutation = useApplyAccountTemplateMutation(segmentId);

  const members = membersQuery.data ?? [];
  const showTemplateApply = segmentType === `account` && members.length === 0;

  return (
    <section className="space-y-3 rounded-md border border-border p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t(`Members`)}</h3>
        <Button onClick={() => setIsCreateModalOpen(true)} type="button">{t(`Create member`)}</Button>
      </div>

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

      <Dialog onOpenChange={setIsCreateModalOpen} open={isCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(`Create member`)}</DialogTitle>
            <DialogDescription>{t(`Create a new segment member with code, hierarchy, and type rules.`)}</DialogDescription>
          </DialogHeader>
          <MemberEditor
            isSaving={createMutation.isPending}
            members={members}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
              setIsCreateModalOpen(false);
            }}
            segmentType={segmentType}
            submitLabel={t(`Create member`)}
          />
          {createMutation.isError ? <p className="text-sm text-destructive">{t(`Could not create member right now.`)}</p> : null}
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={(open) => !open && setEditingMember(null)} open={editingMember !== null}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(`Edit member`)}</DialogTitle>
            <DialogDescription>{t(`Update segment member fields and account rules.`)}</DialogDescription>
          </DialogHeader>
          {editingMember ? (
            <MemberEditor
              excludedMemberId={editingMember.id}
              isSaving={updateMutation.isPending}
              member={editingMember}
              members={members}
              onCancel={() => setEditingMember(null)}
              onSubmit={async (values) => {
                await updateMutation.mutateAsync({ id: editingMember.id, body: values });
                setEditingMember(null);
              }}
              segmentType={segmentType}
              submitLabel={t(`Save changes`)}
            />
          ) : null}
          {updateMutation.isError ? <p className="text-sm text-destructive">{t(`Could not update member right now.`)}</p> : null}
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm"><thead><tr className="border-b"><th className="p-2 text-left">{t(`Code`)}</th><th className="p-2 text-left">{t(`Name`)}</th><th className="p-2 text-left">{t(`Description`)}</th><th className="p-2 text-left">{t(`Type`)}</th><th className="p-2 text-left">{t(`Reporting`)}</th><th className="p-2 text-left">{t(`Parent`)}</th><th className="p-2 text-right">{t(`Actions`)}</th></tr></thead><tbody>
          {members.map((member) => <tr className="border-b" key={member.id}><td className="p-2">{member.code}</td><td className="p-2">{member.name}</td><td className="p-2">{member.description}</td><td className="p-2">{member.type ?? `-`}</td><td className="p-2">{member.reporting ?? `-`}</td><td className="p-2">{members.find((entry) => entry.id === member.parent)?.name ?? `-`}</td><td className="p-2 text-right"><Button onClick={() => setEditingMember(member)} size="sm" type="button" variant="outline">{t(`Edit`)}</Button></td></tr>)}
        </tbody></table>
      </div>
    </section>
  );
};
