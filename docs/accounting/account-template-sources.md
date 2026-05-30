# Account Template Source Audit

_Last reviewed: 2026-05-29 (UTC)_

This document records source provenance, authority ranking, licensing/usage assessment, validation decisions, and reconciliation notes for curated Reados account templates. Internet-sourced accounting data is treated as untrusted until it passes the checks below.

## Template inventory

| Template ID | File | Status | Test coverage |
| --- | --- | --- | --- |
| `tr-tek-duzen` | `src/components/member/account-templates/tr-tek-duzen.json` | Production-ready official baseline | Covered by the accounting member end-to-end test |
| `ifrs` | Not yet embedded | Placeholder only | Not applicable |
| `us-gaap` | Not yet embedded | Placeholder only | Not applicable |

## Turkey Tek Düzen (`tr-tek-duzen`)

### Authority-ranked sources

| Rank | Authority | URL | Access date | How it was used |
| --- | --- | --- | --- | --- |
| Primary mandatory | Official professional chamber / mevzuat publication: İstanbul Serbest Muhasebeci Mali Müşavirler Odası (İSMMMO) | https://ismmmo.org.tr/dosya/415/Mevzuat-Dosya/tekduzhesapplani.pdf | 2026-05-29 | Extracted the complete chart baseline, including account classes, account groups, and ledger-account codes/names. |
| Official corroborating | İSMMMO index of Muhasebe Sistemi Uygulama Genel Tebliğleri | https://ismmmo.org.tr/Mevzuat/Muhasebe-Sistemi-Uygulama-Genel-Tebligleri-Tek-Duzen-Hesap-Plani---3988 | 2026-05-29 | Verified that the mandatory PDF is published in the chamber's Tek Düzen mevzuat collection and that related MSUGT texts are linked together. |
| Official corroborating | İSMMMO publication of 1 Seri No'lu Muhasebe Sistemi Uygulama Genel Tebliği (26.12.1992) | https://ismmmo.org.tr/Mevzuat/1-Seri-No-lu-Muhasebe-Sistemi-Uygulama-Genel-Tebligi-26-12-1992---3997 | 2026-05-29 | Verified legal scope, effective date, and enterprise applicability of the accounting system rules. |
| Official corroborating | İSMMMO publication of 2 Seri No'lu Muhasebe Sistemi Uygulama Genel Tebliği (16.12.1993) | https://ismmmo.org.tr/Mevzuat/2-Seri-No-lu-Muhasebe-Sistemi-Uygulama-Genel-Tebligi-16-12-1993---4053 | 2026-05-29 | Verified corrections/new accounts and the rule that blank class 8 can be used for management accounting without financial statement presentation. |
| Official corroborating | İSMMMO publication of 12 Sıra No'lu Muhasebe Sistemi Uygulama Genel Tebliği (05.05.2004) | https://ismmmo.org.tr/Mevzuat/12-Sira-No-lu-Muhasebe-Sistemi-Uygulama-Genel-Tebligi-05-05-2004---2998 | 2026-05-29 | Verified inflation-adjustment ledger accounts including `178`, `358`, `502`, `503`, `648`, `658`, `697`, and `698`. |
| Official regulator corroborating | Gelir İdaresi Başkanlığı özelge archive example referencing MSUGT and 360/391 usage | https://gib.gov.tr/mevzuat/kanun/437/ozelge/24956 | 2026-05-29 | Confirmed ongoing regulator usage of Tek Düzen account codes in practical tax/accounting guidance. |
| Official regulator corroborating | Gelir İdaresi Başkanlığı özelge archive example referencing 170/350/178/358 and MSUGT 12 | https://gib.gov.tr/mevzuat/kanun/434/ozelge/38853 | 2026-05-29 | Confirmed current construction/inflation adjustment usage conventions for the reconciled `170-177`, `178`, `350`, and `358` treatment. |

No community, blog, or forum source was used as a source of truth for the embedded template.

### Provenance and licensing/usage notes

- The primary source is a publicly accessible İSMMMO mevzuat PDF and the corroborating sources are public mevzuat/regulator pages. They are suitable for internal source verification and implementation traceability.
- The source material is official/legal-professional guidance, but no explicit open-data license was identified on the source pages during review. Reados therefore stores the normalized account-code facts and short account names needed for interoperability, records provenance, and flags external redistribution/package publication for legal review.
- The template is not generated from a third-party commercial dataset.

### Integrity and format validation

- The mandatory PDF was downloaded directly from `ismmmo.org.tr` on 2026-05-29 and parsed from the account-plan section.
- Account `description` texts are authored from the same official source's **C- Hesap Planı Açıklamaları** section, preserving Tek Düzen account intent in concise explanatory prose.
- Extracted entries were normalized to deterministic JSON records with:
  - `code`
  - `name`
  - `description`
  - `parentCode`
  - `type`
  - `reporting`
  - `level`
  - `active`
  - `classificationTags`
- The embedded JSON is hardcoded and covered by `src/components/member/Member.spec.ts`, which verifies the template is listed, applies idempotently, loads 344 account members, preserves representative parent/child links, and includes the reconciled `170`, `178`, `790`, class `8`, and class `9` entries.

### Reconciliation decisions

1. **Official baseline preservation:** The template preserves the official class/group/ledger structure from the mandatory PDF. Official names were normalized only for spacing, punctuation consistency, and obvious PDF extraction abbreviations, without changing code identity or hierarchy.
2. **`170.-178.` range conflict:** The mandatory PDF lists `170.-178. Yıllara Yaygın İnşaat ve Onarım Maliyetleri` and separately lists `178. Yıllara Yaygın İnşaat Enflasyon Düzeltme`. MSUGT 12 explicitly establishes `178` as the inflation-adjustment account. The Reados template therefore expands construction cost accounts as `170` through `177`, keeps `178` for inflation adjustment, and documents this reconciliation decision here.
3. **7/B cost accounts:** The mandatory PDF lists `790` through `799` under the 7/B cost-accounting option without an explicit `79` group heading in the account-plan list. To keep the official baseline intact and avoid inventing a source-line group, `790` through `799` are parented directly to class `7`.
4. **Class 8 and class 9 support:** The template includes `8 Serbest Hesaplar` and `9 Nazım Hesaplar` because they are explicit official account classes. Reados adds `management` and `memo` member types so these classes are not misclassified as assets, liabilities, revenues, expenses, or equity.
5. **Enterprise extension layer:** No optional enterprise extensions are embedded yet. Future customer/project/bank/cost-center subaccounts must be added under a separate extension layer and must not silently alter the official core set.

### ERP Sales and Procurement segment compatibility notes

- `120 Alıcılar` and `220 Alıcılar` carry `customer` and `sales-segment-compatible` tags. Large corporations should keep customer identity in the Sales `Customer` segment and use customer-specific subaccounts or dimensions only where statutory reporting or legacy migration requires them.
- `320 Satıcılar` and `420 Satıcılar` carry `supplier` and `procurement-segment-compatible` tags. Large corporations should keep supplier identity in the Procurement `Supplier` segment and use supplier-specific subaccounts or dimensions only where statutory reporting or legacy migration requires them.
- The official CoA account segment and operational party segments are intentionally separate dimensions; reapplying the template is idempotent by account code and does not remove tenant-specific customer/supplier segment members.

### Adoption proof as of 2026-05-29

- Official baseline total: 344 template members (9 account classes, 57 account groups, 278 ledger accounts after the documented `170-177` range expansion).
- The template is hardcoded in repository source and has end-to-end coverage for listing, idempotent application, total imported member count, uniqueness by code, representative hierarchy links, and classes `8`/`9` type support.

## Required safety checks before authoring new JSON

1. Verify publishing authority (official or quasi-official).
2. Verify licensing/redistribution rights.
3. Record source URL and access date in this document.
4. Normalize naming/codes and map to Reados account `type` and normal `reporting` balance.
5. Add end-to-end coverage for template listing/application before shipping.
6. Keep optional enterprise extensions separate from the official baseline.

## JSON shape to author

Each file should match this structure:

```json
{
  "id": "ifrs",
  "label": "IFRS",
  "description": "IFRS-oriented starter hierarchy.",
  "source": "embedded",
  "members": [
    {
      "code": "1000",
      "name": "Assets",
      "description": "Statement bucket",
      "parentCode": null,
      "type": "asset"
    }
  ]
}
```

## Recommended curation workflow

1. Build level-1 classes from authoritative references.
2. Expand to level-2/3 groups with stable code ranges.
3. Confirm parent-child `type` consistency.
4. Dry-run apply on empty account segment in local env.
5. Add reviewer sign-off notes (source + mapping assumptions).

## Authored IFRS global core template

- Template files:
  - `src/components/member/account-templates/ifrs-global-core.json`
  - `src/components/member/account-templates/ifrs-global-enterprise-extension.json`
- Source audit: `docs/accounting/ifrs-coa-source-audit.md`
- Validation report: `docs/accounting/ifrs-coa-validation-report.md` and `docs/accounting/ifrs-coa-validation-report.json`
- Last source access date: 2026-05-29 (UTC)
- Decision: manually authored IFRS-oriented Reados template, not copied from IFRS Taxonomy files or any jurisdictional uniform CoA.

## Current runtime status

- Backend member creation is enabled.
- Template listing currently returns documented template identifiers.
- Template apply endpoint intentionally rejects until curated JSON files are reintroduced with full provenance.

Any embedded template JSON must remain compatible with the `AccountTemplateDocument` type in `src/components/member/member.schema.ts`.
