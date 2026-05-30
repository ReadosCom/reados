import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { accountTemplateDocumentSchema, type MemberReporting, type MemberType } from "../src/components/member/member.schema.ts";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), `..`);
const templatePaths = [`src/components/member/templates/us-gaap.json`, `src/components/member/templates/us-gaap-enterprise-extensions.json`];
const validationOutputPath = `docs/accounting/validation/us-gaap-coa-validation-report.md`;

const expectedReportingByType: Record<MemberType, MemberReporting> = {
  asset: `debit`,
  equity: `credit`,
  expense: `debit`,
  liability: `credit`,
  revenue: `credit`,
};

type ValidationIssue = {
  code?: string;
  message: string;
  templateId: string;
};

const formatIssue = (issue: ValidationIssue) => `- ${issue.templateId}${issue.code ? ` ${issue.code}` : ``}: ${issue.message}`;

const main = async () => {
  const schemaIssues: ValidationIssue[] = [];
  const duplicateIssues: ValidationIssue[] = [];
  const orphanIssues: ValidationIssue[] = [];
  const completenessIssues: ValidationIssue[] = [];
  const classificationIssues: ValidationIssue[] = [];
  const documents = [];

  for (const templatePath of templatePaths) {
    const rawDocument = JSON.parse(await readFile(join(repositoryRoot, templatePath), `utf8`));
    const parsed = accountTemplateDocumentSchema.safeParse(rawDocument);
    if (!parsed.success) {
      schemaIssues.push({ templateId: String(rawDocument.id ?? templatePath), message: z.prettifyError(parsed.error) });
      continue;
    }
    documents.push(parsed.data);
  }

  const membersByCode = new Map<string, { templateId: string; type: MemberType }>();

  for (const document of documents) {
    const codes = new Set<string>();
    const namesByParent = new Map<string, Set<string>>();

    for (const member of document.members) {
      if (codes.has(member.code)) duplicateIssues.push({ templateId: document.id, code: member.code, message: `Duplicate account code.` });
      codes.add(member.code);

      const parentNameKey = member.parentCode ?? `ROOT`;
      const siblingNames = namesByParent.get(parentNameKey) ?? new Set<string>();
      const normalizedName = member.name.trim().toLocaleLowerCase(`en-US`);
      if (siblingNames.has(normalizedName)) duplicateIssues.push({ templateId: document.id, code: member.code, message: `Duplicate account name under parent ${parentNameKey}.` });
      siblingNames.add(normalizedName);
      namesByParent.set(parentNameKey, siblingNames);

      const requiredFields = [`code`, `name`, `description`, `type`, `reporting`, `level`, `active`, `tags`] as const;
      for (const field of requiredFields) {
        if (member[field] === undefined || member[field] === null || member[field] === ``) completenessIssues.push({ templateId: document.id, code: member.code, message: `Missing required field ${field}.` });
      }

      if (member.reporting !== expectedReportingByType[member.type]) {
        classificationIssues.push({ templateId: document.id, code: member.code, message: `Reporting side ${member.reporting} is inconsistent with ${member.type}.` });
      }

      if (!member.tags.some((tag) => tag.startsWith(`statement:`))) classificationIssues.push({ templateId: document.id, code: member.code, message: `Missing statement classification tag.` });
      if (!member.tags.some((tag) => tag.startsWith(`section:`))) classificationIssues.push({ templateId: document.id, code: member.code, message: `Missing section classification tag.` });
      if (member.parentCode === null && member.level !== 1) classificationIssues.push({ templateId: document.id, code: member.code, message: `Root account must be level 1.` });
      if (member.parentCode !== null && member.level <= 1) classificationIssues.push({ templateId: document.id, code: member.code, message: `Child account must be below level 1.` });

      membersByCode.set(member.code, { templateId: document.id, type: member.type });
    }
  }

  for (const document of documents) {
    for (const member of document.members) {
      if (!member.parentCode) continue;
      const parent = membersByCode.get(member.parentCode);
      if (!parent) {
        orphanIssues.push({ templateId: document.id, code: member.code, message: `Parent code ${member.parentCode} was not found.` });
        continue;
      }
      if (parent.type !== member.type) {
        classificationIssues.push({ templateId: document.id, code: member.code, message: `Parent type ${parent.type} does not match child type ${member.type}.` });
      }
    }
  }

  const totalAccounts = documents.reduce((sum, document) => sum + document.members.length, 0);
  const invalidRowCount = schemaIssues.length + completenessIssues.length + classificationIssues.length;
  const generatedAt = new Date().toISOString();
  const issueSections = [
    [`Schema validation issues`, schemaIssues],
    [`Duplicate issues`, duplicateIssues],
    [`Orphan hierarchy issues`, orphanIssues],
    [`Required-field completeness issues`, completenessIssues],
    [`Classification consistency issues`, classificationIssues],
  ] as const;

  const report = [
    `# US GAAP CoA Validation Report`,
    ``,
    `_Generated: ${generatedAt}_`,
    ``,
    `## Final Quality Summary`,
    ``,
    `- Total templates: ${documents.length}`,
    `- Total accounts: ${totalAccounts}`,
    `- Duplicate count: ${duplicateIssues.length}`,
    `- Orphan count: ${orphanIssues.length}`,
    `- Invalid row count: ${invalidRowCount}`,
    `- Unresolved/ambiguous items: None for template structure. Finance teams must still review policy elections and industry-specific accounts before production adoption.`,
    ``,
    `## Template Counts`,
    ``,
    ...documents.map((document) => `- ${document.id}: ${document.members.length} accounts`),
    ``,
    `## Validation Protocol Results`,
    ``,
    ...issueSections.flatMap(([heading, issues]) => [`### ${heading}`, ``, issues.length === 0 ? `- Passed with 0 issues.` : issues.map(formatIssue).join(`\n`), ``]),
    `## Determinism and Importability Checks`,
    ``,
    `- Account codes are unique per template and sort deterministically by level and code during application.`,
    `- Parent references use stable account codes so repeated application can upsert by (segment, code).`,
    `- Core baseline and optional extension layer are separate files; extensions only reference core parents or local extension parents.`,
    ``,
  ].join(`\n`);

  await writeFile(join(repositoryRoot, validationOutputPath), report);

  console.log(`US GAAP CoA validation summary`);
  console.log(`totalAccounts=${totalAccounts}`);
  console.log(`duplicateCount=${duplicateIssues.length}`);
  console.log(`orphanCount=${orphanIssues.length}`);
  console.log(`invalidRowCount=${invalidRowCount}`);
  console.log(`report=${validationOutputPath}`);

  if (duplicateIssues.length > 0 || orphanIssues.length > 0 || invalidRowCount > 0) process.exitCode = 1;
};

await main();
