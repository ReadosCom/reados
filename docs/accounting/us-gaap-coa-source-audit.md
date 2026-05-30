# US GAAP Chart of Accounts Source Audit

_Last reviewed: 2026-05-29 (UTC)_

## Scope and deliverables

This audit supports the standalone `us-gaap` account template and the optional `us-gaap-enterprise-extensions` layer. The template is intended for commercial and industrial organizations that need a GAAP-oriented baseline chart of accounts for Reados account segments. It is not a substitute for professional accounting judgment, industry-specific regulatory charts, tax ledgers, or statutory reporting ledgers.

## Source authority ranking

| Rank | Source | URL | Access date | Authority / provenance | Licensing and usage suitability | Use in template |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | FASB 2026 GAAP Financial Reporting Taxonomy | https://www.fasb.org/page/detail?pageId=%2Fprojects%2FFASB-Taxonomies%2F2026-gaap-financial-reporting-taxonomy.html | 2026-05-29 | Primary standard-setter taxonomy for U.S. GAAP reporting concepts. | FASB taxonomy materials are available for royalty-free public use for reporting financial statements and for works that explain or assist implementation, subject to authorized-use terms. The Reados template is not a copy of the taxonomy and does not modify taxonomy files. | Confirmed GAAP-oriented statement vocabulary, line-item groupings, and XBRL compatibility direction. |
| 1 | FASB Taxonomies overview | https://www.fasb.org/xbrl | 2026-05-29 | Primary FASB page for taxonomy role and annual releases. | Used as an implementation reference, not as a redistributed taxonomy artifact. | Confirmed that FASB taxonomies are the official digital dictionary reference for GAAP reporting concepts. |
| 1 | FASB Concepts Statement / Conceptual Framework elements reference | https://www.fasb.org/page/PageContent?bcpath=tff&pageId=%2Farchive%2Ffasb-staff-issuances%2Ffif-july-2020-fasb-concepts-statement-no-8-conceptual-framework-for-financial-reportingchapter-4-elements-of.html | 2026-05-29 | Primary conceptual-framework source for financial statement element definitions. | Used for classification principles only; no source text copied into account data. | Drove top-level classification into assets, liabilities, equity, revenues, expenses, gains, and losses as represented in Reados account member types. |
| 1 | SEC Regulation S-X Article 5, Rule 5-02 Balance Sheets | https://www.ecfr.gov/current/title-17/chapter-II/part-210/section-210.5-02 | 2026-05-29 | Official eCFR publication of SEC financial-statement presentation requirements for commercial and industrial companies. | U.S. government regulatory text is suitable as a public regulatory reference. The template uses normalized account names and does not embed long regulatory text. | Drove balance-sheet current/noncurrent groupings, receivables, inventory, PP&E, debt, equity, and liability presentation coverage. |
| 1 | SEC Regulation S-X Article 5, Rule 5-03 Statements of Comprehensive Income | https://www.ecfr.gov/current/title-17/chapter-II/part-210/section-210.5-03 | 2026-05-29 | Official eCFR publication of SEC income-statement line-item presentation requirements for commercial and industrial companies. | U.S. government regulatory text is suitable as a public regulatory reference. The template uses normalized account names and does not embed long regulatory text. | Drove revenue, cost of sales, SG&A, credit loss, non-operating income/expense, tax, discontinued operations, and comprehensive income coverage decisions. |
| 2 | FASB Taxonomy authorized-use terms | https://xbrl.fasb.org/terms/TaxonomiesTermsConditions.html | 2026-05-29 | Primary FAF/FASB legal notice for taxonomy usage. | Confirmed the template should not redistribute a modified taxonomy; the account set is a curated implementation aid with source attribution. | Licensing control for provenance documentation. |
| 2 | Deloitte DART mirror of Regulation S-X Article 5 | https://dart.deloitte.com/USDART/home/accounting/sec/rules-regulations/210_reg_s-x_edit/210-5-commercial-industrial-companies | 2026-05-29 | Major accounting-firm research tool mirroring SEC rule organization. | Secondary support only; not used as sole authority. | Cross-check for Article 5 captions and practical organization. |
| 2 | EY US GAAP / IFRS presentation comparison | https://www.ey.com/en_us/technical/accountinglink | 2026-05-29 | Major accounting-firm technical publication index. | Secondary support only; not used as sole authority. | Confirmed practical terminology differences and avoided IFRS dependency. |

## Safety checks

### Provenance and publication authority

- Primary structure was reconciled to FASB and SEC sources before considering accounting-firm references.
- Major-firm materials were used only as secondary corroboration, not as sole truth.
- Community datasets and community chart-of-accounts examples were excluded from the baseline.

### Licensing and redistribution suitability

- The core and extension JSON files are original Reados-authored implementation templates. They are not copied FASB taxonomy files, SEC rule text, or accounting-firm templates.
- FASB taxonomy licensing was reviewed because the taxonomy informed terminology. The Reados template is an implementation aid and preserves attribution in this source audit rather than redistributing modified taxonomy artifacts.
- eCFR regulatory sources were used as public regulatory references. Long excerpts are intentionally not embedded in the product data.

### Integrity and format consistency

- Every row is validated with the shared Reados account template Zod schema.
- Account codes are deterministic four-digit strings and are unique per template.
- Parent references use stable account codes rather than database IDs so application is idempotent across tenants and databases.
- Parent/child classifications use the same Reados member type to satisfy current account-segment import constraints.

### Semantic fit to Reados contracts

- Template members use the shared account member classifications: `asset`, `liability`, `equity`, `revenue`, and `expense`.
- Reporting side is explicit for every row: debit for assets and expenses; credit for liabilities, equity, and revenue.
- Metadata is schema-supported through `level`, `active`, and `tags` fields while the runtime import path maps Reados-supported fields into the `member` table.
- Optional enterprise accounts are isolated in a separate extension file and reference the core baseline by parent code.

## Reconciliation decisions

| Area | Decision | Rationale |
| --- | --- | --- |
| Independence from IFRS and Turkey Tek Düzen templates | Use a standalone U.S. GAAP code range and hierarchy. | Avoids hidden dependency on regional or IFRS chart structures. |
| Top-level classes | Use assets, liabilities, equity, revenue, cost of sales, operating expenses, non-operating income, non-operating expenses, and income tax/special items. | Aligns to Reados member types while preserving external-reporting and internal-management views. |
| Gains and losses | Represent gains as `revenue` and losses as `expense` in separate non-operating sections. | Reados currently supports revenue/expense but not separate gain/loss member types. Separation avoids mixed-type parent/child conflicts. |
| Contra accounts | Preserve the legal/accounting classification of the related account class and identify contra behavior in tags. | Current Reados schema has no contra flag. Tags keep the distinction without breaking import. |
| Current/noncurrent split | Include practical current/noncurrent groupings for assets and liabilities. | Supports SEC-style presentation and common management reporting. |
| Industry-specific accounts | Keep specialized regulated industries out of the core baseline. | Banks, insurance, broker-dealers, utilities, government, and nonprofits need different charts and review. |
| Enterprise extensions | Place management-accounting and specialized accounts in `us-gaap-enterprise-extensions`. | Keeps the baseline broadly adoptable and makes optional expansion explicit. |

## Enterprise readiness notes for finance teams

### Intended scope

- Commercial and industrial organizations using U.S. GAAP-oriented books.
- Tenant-level Reados account segments that need a production-ready baseline with deterministic codes and import behavior.
- External reporting preparation and internal management accounting at a practical starter depth.

### Assumptions

- Organizations will map existing legacy accounts to this baseline before importing opening balances.
- The default reporting side follows normal balance conventions; unusual contra-account presentation is documented with tags and should be reviewed by finance owners.
- The template is a baseline. Entity-specific materiality, disclosure aggregation, tax requirements, and internal cost-center design remain local decisions.

### Judgment areas requiring accountant review

- Revenue recognition account granularity and contract asset/liability usage.
- Lease classification and lease liability split between current and noncurrent.
- Deferred tax assets/liabilities and uncertain tax positions.
- Inventory costing, reserves, and obsolescence policies.
- Capitalized software, cloud implementation costs, and R&D capitalization/expense policy.
- Equity structure for corporations, LLCs, partnerships, and consolidated groups.
- Discontinued operations, restructuring, impairment, and unusual/nonrecurring items.
