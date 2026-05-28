import { ensurePool } from "@components/postgres/pool.ts";
import type { SegmentType } from "@components/segment/segment.schema.ts";
import type { AccountTemplate, CreateMemberBody, Member, MemberReporting, MemberType, UpdateMemberBody } from "./member.schema.ts";

const pool = ensurePool();

type MemberRow = {
  id: string;
  segment: string;
  code: string;
  name: string;
  description: string;
  parent: string | null;
  type: MemberType | null;
  reporting: MemberReporting | null;
  createdAt: Date;
  updatedAt: Date;
};

const asMember = (row: MemberRow): Member => ({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });

const getSegmentType = async (segmentId: string): Promise<SegmentType | null> => {
  const result = await pool.query<{ type: SegmentType }>(`SELECT "type" FROM "segment" WHERE "id" = $1 LIMIT 1;`, [segmentId]);
  return result.rows[0]?.type ?? null;
};

export const listMembers = async (segmentId: string) => {
  const result = await pool.query<MemberRow>(`SELECT * FROM "member" WHERE "segment" = $1 ORDER BY "code" ASC;`, [segmentId]);
  return result.rows.map(asMember);
};

export const createMember = async (segmentId: string, body: CreateMemberBody) => {
  const segmentType = await getSegmentType(segmentId);
  if (!segmentType) throw new Error(`Segment not found.`);
  if (segmentType === `account` && !body.type) throw new Error(`type is required for account segment members.`);
  if (segmentType === `account` && !body.reporting) throw new Error(`reporting is required for account segment members.`);

  if (body.parent) {
    const parentResult = await pool.query<{ id: string; type: Member["type"] }>(
      `SELECT "id", "type" FROM "member" WHERE "id" = $1 AND "segment" = $2 LIMIT 1;`,
      [body.parent, segmentId],
    );
    const parent = parentResult.rows[0];
    if (!parent) throw new Error(`Parent member does not exist in segment.`);
    if (segmentType === `account` && parent.type !== body.type) throw new Error(`Parent-child type mismatch is not allowed.`);
  }

  const result = await pool.query<MemberRow>(
    `INSERT INTO "member" ("segment", "code", "name", "description", "parent", "type", "reporting") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
    [segmentId, body.code, body.name, body.description, body.parent, segmentType === `account` ? body.type ?? null : null, segmentType === `account` ? body.reporting ?? null : null],
  );

  return asMember(result.rows[0]);
};

export const updateMember = async (segmentId: string, id: string, body: UpdateMemberBody) => {
  const segmentType = await getSegmentType(segmentId);
  if (!segmentType) throw new Error(`Segment not found.`);
  if (segmentType === `account` && !body.type) throw new Error(`type is required for account segment members.`);
  if (segmentType === `account` && !body.reporting) throw new Error(`reporting is required for account segment members.`);

  const existingResult = await pool.query<{ id: string; type: Member["type"] }>(
    `SELECT "id", "type" FROM "member" WHERE "id" = $1 AND "segment" = $2 LIMIT 1;`,
    [id, segmentId],
  );
  const existing = existingResult.rows[0];
  if (!existing) throw new Error(`Member not found in segment.`);

  if (body.parent) {
    if (body.parent === id) throw new Error(`Member cannot be parent of itself.`);

    const parentResult = await pool.query<{ id: string; type: Member["type"] }>(
      `SELECT "id", "type" FROM "member" WHERE "id" = $1 AND "segment" = $2 LIMIT 1;`,
      [body.parent, segmentId],
    );
    const parent = parentResult.rows[0];
    if (!parent) throw new Error(`Parent member does not exist in segment.`);
    if (segmentType === `account` && parent.type !== body.type) throw new Error(`Parent-child type mismatch is not allowed.`);
  }

  const result = await pool.query<MemberRow>(
    `UPDATE "member" SET "code" = $1, "name" = $2, "description" = $3, "parent" = $4, "type" = $5, "reporting" = $6 WHERE "id" = $7 AND "segment" = $8 RETURNING *;`,
    [body.code, body.name, body.description, body.parent, segmentType === `account` ? body.type ?? null : null, segmentType === `account` ? body.reporting ?? null : null, id, segmentId],
  );

  return asMember(result.rows[0]);
};

export const listAccountTemplates = async (): Promise<AccountTemplate[]> => {
  return [
    { id: `tr-tek-duzen`, label: `Turkey Tek Düzen`, description: `See docs/accounting/account-template-sources.md for official sourcing guidance and manual JSON authoring rules.`, source: `embedded` },
    { id: `ifrs`, label: `IFRS`, description: `See docs/accounting/account-template-sources.md for official sourcing guidance and manual JSON authoring rules.`, source: `embedded` },
    { id: `us-gaap`, label: `US GAAP`, description: `See docs/accounting/account-template-sources.md for official sourcing guidance and manual JSON authoring rules.`, source: `embedded` },
  ];
};

export const applyAccountTemplate = async () => {
  throw new Error(`Embedded account templates were removed. Create template JSON files manually using docs/accounting/account-template-sources.md guidance.`);
};
