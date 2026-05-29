# Account Template Authoring Guide (Manual JSON)

_Last reviewed: 2026-05-28 (UTC)_

Embedded account template JSON files were intentionally removed. Teams should now curate and author template JSON files manually with strict source validation.

## Where to source authoritative structure

Use these sources as starting points for hierarchy design and terminology:

- **Turkey Tek Düzen**
  - Gelir İdaresi Başkanlığı (GİB): https://www.gib.gov.tr/
  - Turkish legal publications and ministry circulars referencing Tek Düzen account classes.
- **IFRS-oriented**
  - IFRS Foundation / IASB: https://www.ifrs.org/
  - IFRS Taxonomy resources (statement structure reference): https://www.ifrs.org/issued-standards/ifrs-taxonomy/xifrs/
- **US GAAP-oriented**
  - FASB taxonomy resources: https://www.fasb.org/xbrl
- **France PCG-oriented**
  - ANC references and official Plan Comptable Général publications.
- **Germany SKR-oriented**
  - DATEV SKR references and official accounting guidance.
- **Spain PGC-oriented**
  - ICAC and official PGC publications.

## Required safety checks before authoring JSON

1. Verify publishing authority (official or quasi-official).
2. Verify licensing/redistribution rights.
3. Record source URL and access date in this document.
4. Normalize naming/codes and map to Reados `type` (`asset|liability|revenue|expense`).
5. Validate JSON against runtime Zod schema before shipping.

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

## Current runtime status

- Backend member creation is enabled.
- Template listing currently returns documented template identifiers.
- Template apply endpoint intentionally rejects until curated JSON files are reintroduced with full provenance.
