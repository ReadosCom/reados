import { useTranslation } from "@components/i18n/useTranslation.ts";
import { Member } from "@components/member/Member.tsx";
import { useAccountTemplatesQuery, useApplyAccountTemplateMutation, useCreateMemberMutation, useDeleteMemberMutation, useMembersQuery, useUpdateMemberMutation } from "@components/member/member.query.ts";
import type { Member as MemberRecord } from "@components/member/member.schema.ts";
import type { SegmentType } from "@components/segment/segment.schema.ts";
import { Button } from "@components/uiframework/Button";
import { ButtonGroup } from "@components/uiframework/ButtonGroup";
import { DataTable } from "@components/uiframework/DataTable.tsx";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/uiframework/Dialog";
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

export const MemberList = ({ segmentId, segmentType }: { segmentId: string; segmentType: SegmentType }) => {
  const { t } = useTranslation(`./Segment.i18n.ts`);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [childParentMember, setChildParentMember] = useState<MemberRecord | null>(null);
  const [editingMember, setEditingMember] = useState<MemberRecord | null>(null);
  const [deletingMember, setDeletingMember] = useState<MemberRecord | null>(null);
  const membersQuery = useMembersQuery(segmentId);
  const templatesQuery = useAccountTemplatesQuery(segmentId);
  const createMutation = useCreateMemberMutation(segmentId);
  const updateMutation = useUpdateMemberMutation(segmentId);
  const deleteMutation = useDeleteMemberMutation(segmentId);
  const applyTemplateMutation = useApplyAccountTemplateMutation(segmentId);

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);
  const createInitialValues = useMemo(
    () =>
      childParentMember
        ? {
            parent: childParentMember.id,
            reporting: childParentMember.reporting ?? undefined,
            type: childParentMember.type ?? undefined,
          }
        : undefined,
    [childParentMember],
  );
  const showTemplateApply = segmentType === `account` && members.length === 0;
  const columns = useMemo<ColumnDef<MemberRecord>[]>(
    () => [
      {
        id: `actions`,
        meta: {
          cellClassName: `w-[6rem] px-1`,
          headerClassName: `w-[6rem] px-1`,
        },
        header: () => <span className="whitespace-nowrap">{t(`Actions`)}</span>,
        cell: ({ row }) => {
          const member = row.original;

          return (
            <div className="whitespace-nowrap">
              <ButtonGroup>
                <Button aria-label={t(`Edit member`)} className="h-7 w-7 p-0" onClick={() => setEditingMember(member)} size="sm" type="button" variant="outline">
                  <IconPencil aria-hidden stroke={2} />
                </Button>
                <Button
                  aria-label={t(`Create child member`)}
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setChildParentMember(member);
                    setIsCreateModalOpen(true);
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <IconPlus aria-hidden stroke={2} />
                </Button>
                <Button aria-label={t(`Delete member`)} className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setDeletingMember(member)} size="sm" type="button" variant="outline">
                  <IconTrash aria-hidden stroke={2} />
                </Button>
              </ButtonGroup>
            </div>
          );
        },
      },
      {
        accessorKey: `code`,
        header: t(`Code`),
      },
      {
        accessorKey: `name`,
        header: t(`Name`),
      },
      {
        accessorKey: `description`,
        header: t(`Description`),
      },
      {
        accessorKey: `type`,
        header: t(`Type`),
        cell: ({ row }) => <>{row.original.type ?? `-`}</>,
      },
      {
        accessorKey: `reporting`,
        header: t(`Reporting`),
        cell: ({ row }) => <>{row.original.reporting ?? `-`}</>,
      },
      {
        accessorKey: `parent`,
        header: t(`Parent`),
        cell: ({ row }) => <>{members.find((entry) => entry.id === row.original.parent)?.name ?? `-`}</>,
      },
    ],
    [members, t],
  );

  return (
    <section className="space-y-3 rounded-md border border-border p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t(`Members`)}</h3>
        <Button
          onClick={() => {
            setChildParentMember(null);
            setIsCreateModalOpen(true);
          }}
          type="button"
        >
          {t(`Create member`)}
        </Button>
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

      <Dialog
        onOpenChange={(open) => {
          setIsCreateModalOpen(open);
          if (!open) {
            setChildParentMember(null);
          }
        }}
        open={isCreateModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{childParentMember ? t(`Create child member`) : t(`Create member`)}</DialogTitle>
            <DialogDescription>{childParentMember ? t(`Create a child member under the selected parent with inherited hierarchy defaults.`) : t(`Create a new segment member with code, hierarchy, and type rules.`)}</DialogDescription>
          </DialogHeader>
          <Member
            initialValues={createInitialValues}
            isSaving={createMutation.isPending}
            members={members}
            onCancel={() => {
              setIsCreateModalOpen(false);
              setChildParentMember(null);
            }}
            onSubmit={async (values) => {
              await createMutation.mutateAsync(values);
              setIsCreateModalOpen(false);
              setChildParentMember(null);
            }}
            segmentType={segmentType}
            submitLabel={childParentMember ? t(`Create child member`) : t(`Create member`)}
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
            <Member
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

      <Dialog onOpenChange={(open) => !open && setDeletingMember(null)} open={deletingMember !== null}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(`Delete member`)}</DialogTitle>
            <DialogDescription>
              {t(`Are you sure you want to delete this member?`)} {deletingMember ? `${deletingMember.code} - ${deletingMember.name}` : ``}
            </DialogDescription>
          </DialogHeader>
          {deleteMutation.isError ? <p className="text-sm text-destructive">{t(`Could not delete member right now.`)}</p> : null}
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDeletingMember(null)} type="button" variant="outline">
              {t(`Cancel`)}
            </Button>
            <Button
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deletingMember) {
                  return;
                }

                void deleteMutation.mutateAsync(deletingMember.id).then(() => {
                  setDeletingMember(null);
                });
              }}
              type="button"
              variant="destructive"
            >
              {deleteMutation.isPending ? t(`Deleting...`) : t(`Delete`)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={columns}
        data={members}
        emptyMessage={t(`No members yet.`)}
        errorMessage={t(`Could not load members right now.`)}
        isError={membersQuery.isError}
        isLoading={membersQuery.isPending}
        loadingMessage={t(`Loading members...`)}
      />
    </section>
  );
};
