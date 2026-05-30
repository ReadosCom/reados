# IFRS CoA Validation Report

_Last generated: 2026-05-29T12:55:06.232Z_

## Quality Summary

- Total accounts: 143
- Duplicate count: 0
- Orphan count: 0
- Invalid row count: 0

## Template Results

- ifrs-global-core: 124 accounts, duplicates 0, orphans 0, invalid rows 0 (src/components/member/account-templates/ifrs-global-core.json)
- ifrs-global-enterprise-extension: 19 accounts, duplicates 0, orphans 0, invalid rows 0 (src/components/member/account-templates/ifrs-global-enterprise-extension.json)

## Unresolved / Ambiguous Items

- IFRS 18 category assignment for entities with specified main business activities requires accountant review before adoption.
- Industry-specific statutory reporting, tax ledgers and local filing mappings are intentionally excluded from the core baseline.

## Validation Checks Performed

1. Schema validation for all rows.
2. Duplicate code and sibling-name detection.
3. Orphan hierarchy detection, allowing extension-layer members to attach to core baseline parent codes.
4. Required-field completeness checks.
5. Classification consistency checks for type, normal reporting balance, statement placement and level/parent relationships.
6. Deterministic code-ascending ordering checks.

## Problems

None.
