# CHG-050 same-ID no-op validator correction

## Status

Bounded producer correction candidate. Independent Step-3R review remains required before any Step-3R PASS or Step-4-R1 routing claim.

## Defect

`validateStoreImportEnvelope` previously treated every error-free, evidence-valid `add` or `update` response row as proof that persistent state was written. That rejected a lawful accepted response:

- a same-ID import whose semantic record is unchanged;
- response row classified as `action: "update"`;
- no write plan and no persistent-state change;
- `writesApplied: false`; and
- unchanged global `userDataVersion`.

An import result does not carry prior state or an internal write-plan witness. A legal `update` row can therefore describe either a real update or a semantic no-op at this response-only validation boundary.

## Corrected invariant

The validator now enforces the strongest conclusions supported by the public envelope:

| Eligible rows | `writesApplied: false` | `writesApplied: true` |
| --- | --- | --- |
| No eligible add/update | valid | invalid |
| Update only | valid | valid |
| At least one add | invalid | valid |

`writesApplied` must still be a boolean. Preview remains `false` only. An eligible row retains the previous conditions: `action` is `add` or `update`, `entry` passes Store evidence validation, and `errors` is an empty array.

This is intentionally asymmetric: an `add` is a necessary write, while an `update` is only a possible write without transaction state. The correction does not infer no-op status from input/entry equality, revision, timestamps, or the post-transaction version.

## Preserved boundaries

- No public type, contract, or JSON Schema change.
- No R2 StoreApi behaviour change.
- No fabricated write or version increment.
- No new public field or import action.
- Quarantine, evidence-class immutability, transaction atomicity, and global `userDataVersion` semantics remain unchanged.

## Verification completed for this candidate

- Complete Step-1 suite: 217/217 passed, with zero fail, skip, todo, or cancellation.
- Focused T-API-034 matrix: passed for add, update-only, conflict-only, error-bearing, mixed, preview, non-boolean, purity, and all three stores.
- Accepted R2 suite: 85/85 passed; 28,798 assertion invocations; zero failures, errors, skips, expected failures, or unexpected successes.
- Fresh R2 store matrix: 2,599/2,599 assertions passed.
- Fresh structural/schema probe: 290/290 cases passed.
- Actual import-envelope bridge: 789/789 schema and corrected-runtime acceptances; all inputs unchanged.
- Original three-store no-op bridge: 39/39 capture assertions and 9/9 schema/runtime envelopes passed.

These results support the bounded correction candidate. They do not provide independent Control credit and do not authorise S2-P6 or Reader integration.
