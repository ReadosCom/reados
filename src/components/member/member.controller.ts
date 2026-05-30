import { ensurePool } from "@components/postgres/pool.ts";
import type { SegmentType } from "@components/segment/segment.schema.ts";
import type { AccountTemplate, CreateMemberBody, Member, MemberOwnershipRow, MemberRow, UpdateMemberBody } from "./member.schema.ts";

const pool = ensurePool();

const asMember = (row: MemberRow): Member => ({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });

const getSegmentType = async (segmentId: string): Promise<SegmentType | null> => {
  const result = await pool.query<{ type: SegmentType }>(`SELECT "type" FROM "segment" WHERE "id" = $1 LIMIT 1;`, [segmentId]);
  return result.rows[0]?.type ?? null;
};

const isDescendantMember = async ({ candidateId, memberId, segmentId }: { candidateId: string; memberId: string; segmentId: string }) => {
  const result = await pool.query<{ isDescendant: boolean }>(
    `WITH RECURSIVE "memberDescendants" AS (
      SELECT "id", "parent"
      FROM "member"
      WHERE "parent" = $1 AND "segment" = $2
      UNION ALL
      SELECT "child"."id", "child"."parent"
      FROM "member" AS "child"
      INNER JOIN "memberDescendants" AS "ancestor" ON "child"."parent" = "ancestor"."id"
      WHERE "child"."segment" = $2
    )
    SELECT EXISTS(SELECT 1 FROM "memberDescendants" WHERE "id" = $3) AS "isDescendant";`,
    [memberId, segmentId, candidateId],
  );

  return result.rows[0]?.isDescendant === true;
};

export const listMembers = async (segmentId: string) => {
  const result = await pool.query<MemberRow>(`SELECT * FROM "member" WHERE "segment" = $1 ORDER BY "code" ASC;`, [segmentId]);
  return result.rows.map(asMember);
};

export const createMember = async (body: CreateMemberBody) => {
  const segmentType = await getSegmentType(body.segmentId);
  if (!segmentType) throw new Error(`Segment not found.`);
  if (segmentType === `account` && !body.type) throw new Error(`type is required for account segment members.`);
  if (segmentType === `account` && !body.reporting) throw new Error(`reporting is required for account segment members.`);
  if (segmentType !== `account` && body.type) throw new Error(`type is only allowed for account segment members.`);
  if (segmentType !== `account` && body.reporting) throw new Error(`reporting is only allowed for account segment members.`);

  if (body.parent) {
    const parentResult = await pool.query<Pick<MemberOwnershipRow, "id" | "type">>(`SELECT "id", "type" FROM "member" WHERE "id" = $1 AND "segment" = $2 LIMIT 1;`, [body.parent, body.segmentId]);
    const parent = parentResult.rows[0];
    if (!parent) throw new Error(`Parent member does not exist in segment.`);
    if (segmentType === `account` && parent.type !== body.type) throw new Error(`Parent-child type mismatch is not allowed.`);
  }

  const result = await pool.query<MemberRow>(`INSERT INTO "member" ("segment", "code", "name", "description", "parent", "type", "reporting") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`, [
    body.segmentId,
    body.code,
    body.name,
    body.description,
    body.parent,
    segmentType === `account` ? (body.type ?? null) : null,
    segmentType === `account` ? (body.reporting ?? null) : null,
  ]);

  return asMember(result.rows[0]);
};

export const updateMember = async (id: string, body: UpdateMemberBody) => {
  const existingResult = await pool.query<MemberOwnershipRow>(`SELECT "id", "segment", "type" FROM "member" WHERE "id" = $1 LIMIT 1;`, [id]);
  const existing = existingResult.rows[0];
  if (!existing) throw new Error(`Member not found in segment.`);
  const segmentType = await getSegmentType(existing.segment);
  if (!segmentType) throw new Error(`Segment not found.`);
  if (segmentType === `account` && !body.type) throw new Error(`type is required for account segment members.`);
  if (segmentType === `account` && !body.reporting) throw new Error(`reporting is required for account segment members.`);
  if (segmentType !== `account` && body.type) throw new Error(`type is only allowed for account segment members.`);
  if (segmentType !== `account` && body.reporting) throw new Error(`reporting is only allowed for account segment members.`);

  if (body.parent) {
    if (body.parent === id) throw new Error(`Member cannot be parent of itself.`);

    const parentResult = await pool.query<Pick<MemberOwnershipRow, "id" | "type">>(`SELECT "id", "type" FROM "member" WHERE "id" = $1 AND "segment" = $2 LIMIT 1;`, [body.parent, existing.segment]);
    const parent = parentResult.rows[0];
    if (!parent) throw new Error(`Parent member does not exist in segment.`);
    if (await isDescendantMember({ candidateId: body.parent, memberId: id, segmentId: existing.segment })) throw new Error(`Member parent cannot be one of its descendants.`);
    if (segmentType === `account` && parent.type !== body.type) throw new Error(`Parent-child type mismatch is not allowed.`);
  }

  const result = await pool.query<MemberRow>(`UPDATE "member" SET "code" = $1, "name" = $2, "description" = $3, "parent" = $4, "type" = $5, "reporting" = $6 WHERE "id" = $7 AND "segment" = $8 RETURNING *;`, [
    body.code,
    body.name,
    body.description,
    body.parent,
    segmentType === `account` ? (body.type ?? null) : null,
    segmentType === `account` ? (body.reporting ?? null) : null,
    id,
    existing.segment,
  ]);

  return asMember(result.rows[0]);
};

export const deleteMember = async (id: string) => {
  const result = await pool.query<{ id: string }>(`DELETE FROM "member" WHERE "id" = $1 RETURNING "id";`, [id]);

  if (!result.rows[0]) {
    throw new Error(`Member not found in segment.`);
  }
};

export const listAccountTemplates = async (): Promise<AccountTemplate[]> => {
  return [
    { id: `tr-tek-duzen`, label: `Turkey Tek Düzen`, description: `See docs/accounting/account-template-sources.md for official sourcing guidance and manual JSON authoring rules.`, source: `embedded` },
    { id: `ifrs`, label: `IFRS`, description: `See docs/accounting/account-template-sources.md for official sourcing guidance and manual JSON authoring rules.`, source: `embedded` },
    { id: `us-gaap`, label: `US GAAP`, description: `See docs/accounting/account-template-sources.md for official sourcing guidance and manual JSON authoring rules.`, source: `embedded` },
  ];
};

export const applyAccountTemplate = async (segmentId: string, templateId: string) => {
  throw new Error(`Embedded account templates were removed for segment "${segmentId}" and template "${templateId}". Create template JSON files manually using docs/accounting/account-template-sources.md guidance.`);
};
