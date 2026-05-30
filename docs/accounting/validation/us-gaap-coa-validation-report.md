# US GAAP CoA Validation Report

_Generated: 2026-05-29T12:55:23.114Z_

## Final Quality Summary

- Total templates: 2
- Total accounts: 258
- Duplicate count: 0
- Orphan count: 0
- Invalid row count: 0
- Unresolved/ambiguous items: None for template structure. Finance teams must still review policy elections and industry-specific accounts before production adoption.

## Template Counts

- us-gaap: 238 accounts
- us-gaap-enterprise-extensions: 20 accounts

## Validation Protocol Results

### Schema validation issues

- Passed with 0 issues.

### Duplicate issues

- Passed with 0 issues.

### Orphan hierarchy issues

- Passed with 0 issues.

### Required-field completeness issues

- Passed with 0 issues.

### Classification consistency issues

- Passed with 0 issues.

## Determinism and Importability Checks

- Account codes are unique per template and sort deterministically by level and code during application.
- Parent references use stable account codes so repeated application can upsert by (segment, code).
- Core baseline and optional extension layer are separate files; extensions only reference core parents or local extension parents.
