# Accounting Configuration Finalization Notes

## Status

- Discussion completed on 2026-05-18.
- This document captures agreed direction only.
- No implementation is included in this note.

## Finalize Configuration (UX + behavior)

- Configuration screen will include a `Finalize Configuration` button.
- Triggering finalize must show a clear critical warning before confirmation.
- Warning message intent:
  - This is a critical operation.
  - Future segment changes may require downtime due to heavy database migration work (for example, adding new columns to `gl`).
- On successful finalization, configuration field `finalized` becomes `true`.

## Core Ledger Model Direction

We agreed to avoid a multi-target FK in `gl.reference` and use a shared `journal` parent table.

### Why

- A single SQL foreign key cannot reference multiple different tables.
- `journal` gives one stable FK target for all journal lines.
- New processes can be added without redesigning `gl` relationships.

## Planned Tables

### `journal` (shared header)

Purpose:
- Canonical parent record for each accounting transaction source.

Planned fields (baseline):
- `id` (UUID v7, primary key)
- `type` (for example: `manualJournal`, `sale`, `receipt`, `pettyCash`)
- `date` (`date`)
- `createdAt`
- `updatedAt`


### `gl` (general ledger lines / journal items)

Purpose:
- Stores journal line items tied to `journal`.

Planned fields (baseline):
- `id` (UUID v7, primary key)
- `journal` (FK -> `journal.id`)
- `date` (`date`, journal date)
- Segment columns (one per finalized configuration segment)
- `debit`
- `credit`
- `createdAt`
- `updatedAt`

Open item:
- Additional optional line-level text fields may be added later if needed.

### Process-specific tables

Examples:
- `manualJournal`
- `sale`
- `receipt`
- `pettyCash`

Direction:
- Each process has its own table and domain-specific fields.
- Each process record links to one `journal` record.
- `gl` never references process tables directly; it references `journal`.

## Reference Strategy Outcome

- We will not use a single `reference` column in `gl` as a direct FK to multiple tables.
- Cross-process reference is handled through `gl.journal -> journal.id`.
- Process-specific unique IDs remain in their own process tables and are connected through `journal`.

## Future PR Scope (separate PRs)

- Manual Journal Entry process + screen.
- Sales process + screen.
- Receipt process + screen.
- Petty Cash process + screen.
- Additional processes to be added following the same pattern.

## Open Questions To Finalize Before Build

- Exact warning copy and confirm flow for `Finalize Configuration`.
- Numeric precision and constraints for `debit` / `credit`.
- Final naming list for `type` values.
- Whether `date` should exist only in `journal` or also be duplicated in `gl` (current note keeps it in `gl` per discussion).
