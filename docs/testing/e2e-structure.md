# E2E Test Structure

This document is the source of truth for E2E test file structure in this repository.

## Goal
Keep E2E tests easy to review and parallel-safe.

## File Organization
- Use one spec file per component/area.
- Keep each spec file small.
- Inside the file, write multiple focused tests (for example: create, update, delete).

Examples:
- `src/components/member/member.spec.ts`
- `src/components/segment/segmentList.spec.ts`
- `src/components/authentication/authentication.spec.ts`

## Atomic Test Rules
- One behavior per `test(...)`.
- No dependency on execution order.
- Use unique test data per test.
- Always clean up in `try/finally`.

## Helpers
- Use shared helpers in `testing/` only for cross-cutting setup/navigation (for example auth, host navigation).
- Prefer keeping behavior-specific flow steps readable inside the spec file when the file remains small.

## Cleanup Contract
- A test must remove entities it creates.
- Running the test suite repeatedly must not grow persistent data.
