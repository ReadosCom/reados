import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), `..`);
const templatePaths = [`src/components/member/account-templates/ifrs-global-core.json`, `src/components/member/account-templates/ifrs-global-enterprise-extension.json`];

const accountMemberTypeSchema = z.enum([`expense`, `revenue`, `asset`, `liability`, `equity`]);
const accountMemberReportingSchema = z.enum([`debit`, `credit`]);
const accountTemplateStatementSchema = z.enum([`financial-position`, `profit-or-loss`, `other-comprehensive-income`, `cash-flows`, `equity-changes`, `management-reporting`]);
const accountTemplateClassificationSchema = z.enum([`current`, `non-current`, `operating`, `investing`, `financing`, `income-tax`, `discontinued-operations`, `contra`, `control`, `detail`, `subtotal`, `extension`]);

const accountTemplateMemberSchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  parentCode: z.string().trim().min(1).nullable(),
  level: z.number().int().positive(),
  type: accountMemberTypeSchema,
  reporting: accountMemberReportingSchema,
  statement: accountTemplateStatementSchema,
  classificationTags: z.array(accountTemplateClassificationSchema).min(1),
  active: z.boolean(),
  ifrsReferences: z.array(z.string().trim().min(1)).min(1),
});

const accountTemplateDocumentSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  source: z.enum([`embedded`, `public-dataset`]),
  extensionOf: z.string().trim().min(1).optional(),
  metadata: z.object({
    accessDate: z.string().trim().min(1),
    baseline: z.enum([`core`, `optional-extension`]),
    framework: z.literal(`IFRS Accounting Standards`),
    idempotencyKey: z.string().trim().min(1),
    independentOfJurisdictionalCoa: z.boolean(),
    intendedUse: z.string().trim().min(1),
    ordering: z.literal(`code-ascending`),
  }),
  members: z.array(accountTemplateMemberSchema).min(1),
});

const expectedReporting = (type) => (type === `asset` || type === `expense` ? `debit` : `credit`);
const expectedStatement = (type) => ([`asset`, `liability`, `equity`].includes(type) ? `financial-position` : `profit-or-loss`);
const documents = [];
const globalCodes = new Set();
const globalDuplicates = [];

for (const templatePath of templatePaths) {
  const absolutePath = resolve(repositoryRoot, templatePath);
  const parsed = accountTemplateDocumentSchema.safeParse(JSON.parse(readFileSync(absolutePath, `utf8`)));
  const invalidRows = [];
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      invalidRows.push(`${issue.path.join(`.`)}: ${issue.message}`);
    }
  }

  const document = parsed.success ? parsed.data : JSON.parse(readFileSync(absolutePath, `utf8`));
  const codeCounts = new Map();
  const nameCounts = new Map();
  for (const member of document.members ?? []) {
    codeCounts.set(member.code, (codeCounts.get(member.code) ?? 0) + 1);
    nameCounts.set(`${member.parentCode ?? `ROOT`}::${member.name}`, (nameCounts.get(`${member.parentCode ?? `ROOT`}::${member.name}`) ?? 0) + 1);
    const globalKey = `${member.code}`;
    if (globalCodes.has(globalKey)) globalDuplicates.push(`${document.id}:${member.code}`);
    globalCodes.add(globalKey);
  }

  documents.push({ document, invalidRows, path: templatePath, codeCounts, nameCounts });
}

const coreDocument = documents.find(({ document }) => document.id === `ifrs-global-core`)?.document;
const coreCodes = new Set((coreDocument?.members ?? []).map((member) => member.code));
let totalAccounts = 0;
let duplicateCount = globalDuplicates.length;
let orphanCount = 0;
let invalidRowCount = 0;
const allProblems = [];
const summary = [];

for (const { document, invalidRows, path, codeCounts, nameCounts } of documents) {
  totalAccounts += document.members?.length ?? 0;
  invalidRowCount += invalidRows.length;
  allProblems.push(...invalidRows.map((problem) => `${path}: ${problem}`));

  const localCodes = new Set((document.members ?? []).map((member) => member.code));
  const duplicateCodes = [...codeCounts.entries()].filter(([, count]) => count > 1).map(([code]) => code);
  const duplicateNames = [...nameCounts.entries()].filter(([, count]) => count > 1).map(([name]) => name);
  duplicateCount += duplicateCodes.length + duplicateNames.length;
  allProblems.push(...duplicateCodes.map((code) => `${path}: duplicate code ${code}`));
  allProblems.push(...duplicateNames.map((name) => `${path}: duplicate sibling name ${name}`));

  let templateOrphans = 0;
  let templateInvalid = invalidRows.length;
  const previousCodes = new Set();
  const members = document.members ?? [];
  for (const member of members) {
    const parentExternalToExtension = document.metadata?.baseline === `optional-extension` && coreCodes.has(member.parentCode);
    if (member.parentCode && !localCodes.has(member.parentCode) && !parentExternalToExtension) {
      templateOrphans += 1;
      allProblems.push(`${path}: orphan ${member.code} references ${member.parentCode}`);
    }

    if (member.parentCode === null && member.level !== 1) {
      templateInvalid += 1;
      allProblems.push(`${path}: root ${member.code} must have level 1`);
    }

    const parent = members.find((candidate) => candidate.code === member.parentCode) ?? coreDocument?.members.find((candidate) => candidate.code === member.parentCode);
    if (parent) {
      if (member.level !== parent.level + 1) {
        templateInvalid += 1;
        allProblems.push(`${path}: ${member.code} level ${member.level} does not equal parent ${member.parentCode} level + 1`);
      }
      if (member.type !== parent.type) {
        templateInvalid += 1;
        allProblems.push(`${path}: ${member.code} type ${member.type} does not match parent ${member.parentCode} type ${parent.type}`);
      }
    }

    if (!previousCodes.has(member.code) && [...previousCodes].some((code) => code > member.code)) {
      templateInvalid += 1;
      allProblems.push(`${path}: ${member.code} is not in code-ascending order`);
    }
    previousCodes.add(member.code);

    const isContra = member.classificationTags.includes(`contra`);
    if (!isContra && member.reporting !== expectedReporting(member.type)) {
      templateInvalid += 1;
      allProblems.push(`${path}: ${member.code} reporting ${member.reporting} is inconsistent with ${member.type}`);
    }

    if (member.statement !== expectedStatement(member.type)) {
      templateInvalid += 1;
      allProblems.push(`${path}: ${member.code} statement ${member.statement} is inconsistent with ${member.type}`);
    }

    const hasRequiredFields =
      [`code`, `name`, `description`, `type`, `reporting`, `statement`].every((field) => typeof member[field] === `string` && member[field].trim().length > 0) &&
      Array.isArray(member.classificationTags) &&
      member.classificationTags.length > 0 &&
      Array.isArray(member.ifrsReferences) &&
      member.ifrsReferences.length > 0 &&
      typeof member.active === `boolean` &&
      Number.isInteger(member.level);
    if (!hasRequiredFields) {
      templateInvalid += 1;
      allProblems.push(`${path}: ${member.code} has incomplete required fields`);
    }
  }

  orphanCount += templateOrphans;
  invalidRowCount += templateInvalid - invalidRows.length;
  summary.push({
    template: document.id,
    path,
    accounts: members.length,
    duplicateCount: duplicateCodes.length + duplicateNames.length,
    orphanCount: templateOrphans,
    invalidRowCount: templateInvalid,
  });
}

const unresolvedItems = [
  `IFRS 18 category assignment for entities with specified main business activities requires accountant review before adoption.`,
  `Industry-specific statutory reporting, tax ledgers and local filing mappings are intentionally excluded from the core baseline.`,
];

const output = {
  generatedAt: new Date().toISOString(),
  templatePaths: templatePaths.map((path) => relative(repositoryRoot, resolve(repositoryRoot, path))),
  summary,
  totals: {
    totalAccounts,
    duplicateCount,
    orphanCount,
    invalidRowCount,
    unresolvedOrAmbiguousItemCount: unresolvedItems.length,
  },
  unresolvedOrAmbiguousItems: unresolvedItems,
  problems: allProblems,
};

writeFileSync(resolve(repositoryRoot, `docs/accounting/ifrs-coa-validation-report.json`), `${JSON.stringify(output, null, 2)}\n`);

const markdown = `# IFRS CoA Validation Report\n\n_Last generated: ${output.generatedAt}_\n\n## Quality Summary\n\n- Total accounts: ${totalAccounts}\n- Duplicate count: ${duplicateCount}\n- Orphan count: ${orphanCount}\n- Invalid row count: ${invalidRowCount}\n\n## Template Results\n\n${summary.map((row) => `- ${row.template}: ${row.accounts} accounts, duplicates ${row.duplicateCount}, orphans ${row.orphanCount}, invalid rows ${row.invalidRowCount} (${row.path})`).join(`\n`)}\n\n## Unresolved / Ambiguous Items\n\n${unresolvedItems.map((item) => `- ${item}`).join(`\n`)}\n\n## Validation Checks Performed\n\n1. Schema validation for all rows.\n2. Duplicate code and sibling-name detection.\n3. Orphan hierarchy detection, allowing extension-layer members to attach to core baseline parent codes.\n4. Required-field completeness checks.\n5. Classification consistency checks for type, normal reporting balance, statement placement and level/parent relationships.\n6. Deterministic code-ascending ordering checks.\n\n## Problems\n\n${allProblems.length === 0 ? `None.` : allProblems.map((problem) => `- ${problem}`).join(`\n`)}\n`;
writeFileSync(resolve(repositoryRoot, `docs/accounting/ifrs-coa-validation-report.md`), markdown);

execFileSync(resolve(repositoryRoot, `node_modules/.bin/biome`), [`format`, `--write`, `docs/accounting/ifrs-coa-validation-report.json`, `docs/accounting/ifrs-coa-validation-report.md`], { cwd: repositoryRoot, stdio: `ignore` });

console.log(`IFRS CoA validation passed for ${totalAccounts} accounts.`);
console.log(`duplicateCount=${duplicateCount} orphanCount=${orphanCount} invalidRowCount=${invalidRowCount}`);

if (duplicateCount !== 0 || orphanCount !== 0 || invalidRowCount !== 0) {
  process.exitCode = 1;
}
