# Accounting Configuration V1: Required Segments + E2E-Only Quality Gate

## Summary
Implement strict accounting configuration with required `Entity` and `Account` segments, keep posting invariants (`timestamp`, `postingDate`, `debit`, `credit`) outside configuration UI, and validate delivery exclusively through end-to-end tests.

## Key Changes
1. Accounting Configuration Contract
- Replace free-form accounting config JSON with strict shared schema.
- Required system segments:
  - `entity` (required, non-removable)
  - `account` (required, non-removable)
- Optional custom segments remain user-manageable.
- Enforce uniqueness and required-segment presence in shared Zod schema.

2. Backend Configuration API
- `GET /configuration/accounting` returns strict typed config shape.
- `PATCH /configuration/accounting` accepts only strict typed shape (legacy free-form rejected).
- Enforce `finalized=true` only when config passes required-segment invariants.

3. Frontend Configuration UI
- Replace minimal toggle form with segment management UI.
- Show `Entity` and `Account` as locked required rows.
- Allow add/edit/remove/reorder optional custom segments.
- Keep finalized toggle and right-aligned primary save button.
- Do not expose posting invariants (`timestamp`, `postingDate`, `debit`, `credit`) in this screen.

4. Posting Invariants (Journal Domain)
- Add/extend shared journal-entry schema enforcement for:
  - required `postingDate`, `entity`, `account`
  - valid debit/credit line rules
  - journal-level balancing
- Keep timestamps server-generated as audit metadata.

5. AGENTS.md Rule Update
- Add an explicit repository rule clarifying test policy:
  - feature validation must be done with e2e tests only
  - coverage is produced from e2e execution
- Keep existing `npm test` e2e command guidance aligned with this rule.

## Test Plan (100% E2E)
1. User can open accounting configuration, sees locked `Entity` and `Account` required segments.
2. User can add/edit/remove optional custom segments and persist changes via real backend.
3. Finalization succeeds only with valid required segment structure; invalid config remains blocked with visible error.
4. Accounting route access redirects correctly when configuration is not finalized; allows entry when finalized.
5. Journal entry flow rejects missing `postingDate`, missing `entity/account`, invalid debit/credit input, and unbalanced entries.
6. Journal entry flow confirms server-managed timestamp presence in persisted/returned records.
7. Coverage artifact generation is validated as part of the e2e run completion process.

## Assumptions
- Required baseline segments for v1 are exactly `Entity` and `Account`.
- Optional segments are custom and non-required by default.
- No unit/integration test additions are planned; all acceptance and regression checks are e2e-only.
