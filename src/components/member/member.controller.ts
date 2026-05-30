import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { ensurePool } from "@components/postgres/pool.ts";
import type { SegmentType } from "@components/segment/segment.schema.ts";
import { accountTemplateDocumentSchema, type AccountTemplate, type CreateMemberBody, type Member, type MemberOwnershipRow, type MemberRow, type UpdateMemberBody } from "./member.schema.ts";

const pool = ensurePool();
const templateDirectory = join(dirname(fileURLToPath(import.meta.url)), `templates`);
const accountTemplateFiles = [`us-gaap.json`, `us-gaap-enterprise-extensions.json`] as const;

const asMember = (row: MemberRow): Member => ({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });

const getSegmentType = async (segmentId: string): Promise<SegmentType | null> => {
  const result = await pool.query<{ type: SegmentType }>(`SELECT "type" FROM "segment" WHERE "id" = $1 LIMIT 1;`, [segmentId]);
  return result.rows[0]?.type ?? null;
};

const readAccountTemplateDocuments = async () => {
  return Promise.all(
    accountTemplateFiles.map(async (fileName) => {
      const document = JSON.parse(await readFile(join(templateDirectory, fileName), `utf8`));
      return accountTemplateDocumentSchema.parse(document);
    }),
  );
};

const getAccountTemplateDocument = async (templateId: string) => {
  const documents = await readAccountTemplateDocuments();
  return documents.find((document) => document.id === templateId) ?? null;
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
  const documents = await readAccountTemplateDocuments();
  return documents.map(({ members, ...template }) => {
    void members;
    return template;
  });
};

export const applyAccountTemplate = async (segmentId: string, templateId: string) => {
  const segmentType = await getSegmentType(segmentId);
  if (segmentType !== `account`) throw new Error(`Account templates can only be applied to account segments.`);

  const template = await getAccountTemplateDocument(templateId);
  if (!template) throw new Error(`Account template was not found.`);

  const client = await pool.connect();

  try {
    await client.query(`BEGIN;`);
    const memberIdsByCode = new Map<string, string>();
    const existingResult = await client.query<Pick<MemberRow, "id" | "code">>(`SELECT "id", "code" FROM "member" WHERE "segment" = $1;`, [segmentId]);
    for (const member of existingResult.rows) memberIdsByCode.set(member.code, member.id);

    for (const member of [...template.members].sort((left, right) => left.level - right.level || left.code.localeCompare(right.code))) {
      const parent = member.parentCode ? memberIdsByCode.get(member.parentCode) : null;
      if (member.parentCode && !parent) throw new Error(`Template parent ${member.parentCode} must be applied before child ${member.code}.`);

      const result = await client.query<Pick<MemberRow, "id" | "code">>(
        `INSERT INTO "member" ("segment", "code", "name", "description", "parent", "type", "reporting")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT ("segment", "code") DO UPDATE
        SET "name" = EXCLUDED."name",
          "description" = EXCLUDED."description",
          "parent" = EXCLUDED."parent",
          "type" = EXCLUDED."type",
          "reporting" = EXCLUDED."reporting"
        RETURNING "id", "code";`,
        [segmentId, member.code, member.name, member.description, parent, member.type, member.reporting],
      );
      const applied = result.rows[0];
      memberIdsByCode.set(applied.code, applied.id);
    }

    await client.query(`COMMIT;`);
  } catch (error) {
    await client.query(`ROLLBACK;`);
    throw error;
  } finally {
    client.release();
  }
};
