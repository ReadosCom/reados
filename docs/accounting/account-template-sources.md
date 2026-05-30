# Account Template Source Audit

_Last reviewed: 2026-05-29 (UTC)_

This document records source provenance, authority ranking, licensing/usage assessment, validation decisions, and reconciliation notes for curated Reados account templates. Internet-sourced accounting data is treated as untrusted until it passes the checks below.

## Template inventory

| Template ID | File | Status | Test coverage |
| --- | --- | --- | --- |
| `tr-tek-duzen` | `src/components/member/account-templates/tr-tek-duzen.json` | Production-ready official baseline | Covered by the accounting member end-to-end test |
| `ifrs-global-core` | `src/components/member/account-templates/ifrs-global-core.json` | Production-ready curated baseline | Covered by template listing and apply endpoint tests |
| `ifrs-global-enterprise-extension` | `src/components/member/account-templates/ifrs-global-enterprise-extension.json` | Optional extension layer | Covered by template listing and recursive apply flow |
| `us-gaap` | `src/components/member/account-templates/us-gaap.json` | Production-ready curated baseline | Covered by template listing and apply endpoint tests |
| `us-gaap-enterprise-extensions` | `src/components/member/account-templates/us-gaap-enterprise-extensions.json` | Optional extension layer | Covered by template listing and recursive apply flow |

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
- The embedded JSON is hardcoded and covered by end-to-end tests for listing and idempotent application.

## IFRS global templates

- Template files:
  - `src/components/member/account-templates/ifrs-global-core.json`
  - `src/components/member/account-templates/ifrs-global-enterprise-extension.json`
- Source audit: `docs/accounting/ifrs-coa-source-audit.md`
- Last source access date: 2026-05-29 (UTC)
- Decision: manually authored IFRS-oriented Reados templates, not copied from IFRS Taxonomy files or any jurisdictional uniform CoA.

## US GAAP templates

- Template files:
  - `src/components/member/account-templates/us-gaap.json`
  - `src/components/member/account-templates/us-gaap-enterprise-extensions.json`
- Source audit: `docs/accounting/us-gaap-coa-source-audit.md`
- Validation report: `docs/accounting/validation/us-gaap-coa-validation-report.md`
- Last source access date: 2026-05-29 (UTC)
- Decision: manually authored US GAAP-oriented Reados templates, separate from FASB Codification text and XBRL taxonomies.

## Required safety checks before authoring new JSON

1. Verify publishing authority (official or quasi-official).
2. Verify licensing/redistribution rights.
3. Record source URL and access date in this document.
4. Normalize naming/codes and map to Reados account `type` and normal `reporting` balance.
5. Add end-to-end coverage for template listing/application before shipping.
6. Keep optional enterprise extensions separate from the official baseline.

## JSON shape to author

Any embedded template JSON must remain compatible with the `AccountTemplateDocument` type in `src/components/member/member.schema.ts`.

## Current runtime status

- Backend member creation is enabled.
- Template listing reads curated JSON templates from `src/components/member/account-templates/`.
- Template apply endpoint upserts template members idempotently by account code and supports extension chaining through `extensionOf`.
