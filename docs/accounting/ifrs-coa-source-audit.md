# IFRS Global Chart of Accounts Source Audit

_Last reviewed: 2026-05-29 (UTC)_

## Purpose and scope

This audit documents the provenance, authority, licensing review, reconciliation logic and implementation assumptions used to create the standalone Reados IFRS Global Chart of Accounts (CoA) baseline.

The delivered template is an IFRS-oriented operational ledger hierarchy for Reados account segments. It is **not** a reproduction of the IFRS Accounting Taxonomy, is **not** a copy of IFRS Accounting Standards text, and is **not** derived from Turkey's uniform Chart of Accounts or any other jurisdictional uniform CoA.

## Source authority ranking

| Rank | Source | URL | Access date | Authority / use in template |
| --- | --- | --- | --- | --- |
| Primary | IFRS Foundation: IFRS Accounting Taxonomy 2025 | https://www.ifrs.org/issued-standards/ifrs-taxonomy/ifrs-accounting-taxonomy-2025/ | 2026-05-29 | Used to confirm that the 2025 taxonomy reflects IFRS Accounting Standards as issued by the IASB at 2025-01-01 and includes IFRS 18, IFRS 19, IFRS 9/IFRS 7 amendments, annual improvements and other 2024 updates. |
| Primary | IFRS Foundation: IFRS Accounting Taxonomy overview | https://www.ifrs.org/issued-standards/ifrs-taxonomy/ | 2026-05-29 | Used to confirm the taxonomy's role as presentation and disclosure tagging content for IFRS financial statements and common-practice disclosures. |
| Primary | IFRS Foundation: IFRS Accounting Taxonomy 2025 remains current for 2026 | https://www.ifrs.org/news-and-events/news/2026/02/ifrs-accounting-taxonomy-2025-to-remain-current-for-2026/ | 2026-05-29 | Used to validate that the 2025 IFRS Accounting Taxonomy remains the current taxonomy for 2026 reporting periods. |
| Primary | IFRS Foundation: IFRS 18 Presentation and Disclosure in Financial Statements | https://www.ifrs.org/content/ifrs/home/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements.html | 2026-05-29 | Used to structure income and expense accounts around operating, investing, financing, income tax and discontinued-operations presentation categories and subtotals. |
| Primary | IFRS Foundation: IFRS 18 key terms | https://www.ifrs.org/supporting-implementation/supporting-materials-by-ifrs-standards/ifrs-18/key-terms/ | 2026-05-29 | Used to validate category terminology, especially operating profit/loss and profit/loss before financing and income taxes. |
| Primary | IFRS Foundation: IFRS Accounting Taxonomy Illustrative Examples | https://www.ifrs.org/issued-standards/ifrs-taxonomy/ifrs-taxonomy-illustrative-examples/ | 2026-05-29 | Used to cross-check financial statement presentation coverage for statement of financial position, comprehensive income, changes in equity, cash flows, financial instruments and operating segments. |
| Primary | IFRS Foundation / IASB: IAS 1 Presentation of Financial Statements | https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2021/issued/part-a/ias-1-presentation-of-financial-statements.pdf | 2026-05-29 | Used for current/non-current statement of financial position presentation logic during the IAS 1 to IFRS 18 transition period. |
| Primary legal | IFRS Foundation: IFRS Accounting Licensing | https://www.ifrs.org/content/ifrs/home/accounting-licensing.html | 2026-05-29 | Used for licensing risk review. Commercial product integration of IFRS Standards content requires IFRS Foundation licensing. |
| Primary legal | IFRS Foundation: Website Terms and Conditions | https://www.ifrs.org/content/ifrs/home/legal/terms-and-conditions | 2026-05-29 | Used to confirm that IFRS Taxonomy materials have separate terms and that commercial product reproduction/use rights are restricted. |
| Primary legal | IFRS Foundation: Taxonomy Terms and Conditions PDF | https://www.ifrs.org/content/dam/ifrs/about-us/legal-and-governance/legal-docs/taxonomy/taxonomy-terms-and-conditions.pdf | 2026-05-29 | Used to assess taxonomy-material usage constraints and extension-taxonomy concepts. |

## Provenance and licensing decisions

- The template was manually authored as a Reados ledger baseline using generic accounting account names and Reados metadata fields.
- IFRS Foundation materials were used as authoritative references for structure, terminology categories and validation checks, not as a copied source dataset.
- No IFRS taxonomy files, labels, element identifiers, XBRL entry points or official Standards text were embedded in the JSON templates.
- The repository may distribute this manually authored template as application data, but commercial deployment teams should complete legal review before marketing it as IFRS Foundation-licensed content or integrating official taxonomy files.
- Any future feature that imports IFRS Taxonomy packages, embeds official IFRS Standards text, or exports official XBRL taxonomy extensions should be gated behind IFRS Foundation licensing review.

## Reconciliation logic

1. **Statement of financial position**: level-1 classes follow IFRS elements of assets, liabilities and equity; assets and liabilities are divided into current and non-current groups for conventional IFRS presentation.
2. **Profit or loss**: income and expense accounts are grouped around IFRS 18 categories: operating, investing, financing, income taxes and discontinued operations.
3. **Normal balance**: assets and expenses default to debit reporting; liabilities, equity and revenue default to credit reporting. Contra accounts explicitly reverse normal reporting while retaining the parent type.
4. **Hierarchy and importability**: codes are deterministic, code-ascending and unique. Each child preserves its parent account type, enabling Reados account-segment parent consistency checks.
5. **Core versus extension**: the core baseline contains broadly applicable IFRS-oriented accounts. The optional enterprise extension layer contains additional detail for inventory, fixed assets, SaaS/revenue disaggregation, contract costs, levies and financing offsets.
6. **Jurisdictional independence**: codes use a neutral four-digit operational pattern and do not map to Turkey Tek Düzen, US GAAP, FASB taxonomy codes or any national statutory chart.

## Safety-rule validation

| Safety rule | Decision |
| --- | --- |
| Verify provenance | All cited sources are IFRS Foundation / IASB primary sources or IFRS Foundation legal terms. |
| Verify publication authority | IFRS Foundation / IASB sources are authoritative for IFRS Accounting Standards and taxonomy publications. |
| Verify licensing / usage suitability | Template avoids copied taxonomy or Standards text; legal review remains required before claiming official IFRS licensing or embedding official taxonomy materials in commercial product features. |
| Verify integrity and format consistency | Template JSON is reviewed and tested through account-template listing/application flows before release. |
| Verify semantic fit to Reados contracts | Template rows include Reados-compatible `code`, `name`, `description`, `parentCode`, `type` and `reporting` fields plus schema-supported metadata. |
| Normalize and schema-validate before persistence | JSON files are normalized and persisted through the existing template-apply workflow. |

## Implementation notes for finance teams

### Intended scope

- Use the core template as a baseline for IFRS-oriented general ledger setup in multinational or jurisdiction-neutral entities.
- Use the optional enterprise extension only where additional operational detail is useful for management reporting or industry fit.
- Add local statutory, tax, consolidation, segment and regulatory mappings separately; do not overload the core account code with local filing codes.

### Assumptions

- The entity prepares general purpose financial statements under IFRS Accounting Standards or an IFRS-aligned local framework.
- The entity wants a neutral operational CoA independent of Turkey's uniform CoA.
- The entity can tailor account descriptions, materiality thresholds and posting controls before go-live.

### Judgment-sensitive areas requiring accountant review

- IFRS 18 operating, investing and financing category assignments for entities with specified main business activities, such as financial institutions, insurers, investment entities and entities providing financing to customers.
- Current versus non-current classification when operating cycles, debt covenant facts or settlement rights require judgment.
- Revenue disaggregation and contract asset/liability design under IFRS 15.
- Expected credit loss granularity under IFRS 9.
- Lease, impairment, deferred tax, employee benefit, business combination and discontinued operation accounts where recognition and measurement depend on entity-specific facts.
- Local statutory ledgers, tax ledgers, e-invoicing codes and XBRL filing taxonomies.
