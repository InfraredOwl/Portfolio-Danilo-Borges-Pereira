# Security Specification for Blob Physics Simulator

## Data Invariants
1. A preset must always have a valid `authorId` matching the authenticated user.
2. `createdAt` must be the current server time on creation and immutable on update.
3. Numeric values (complexity, contrast, stiffness) must be within their UI-defined ranges.
4. Identifiers (names, IDs) must be size-constrained to prevent resource poisoning.

## The Dirty Dozen Payloads (Denial Tests)
1. **Identity Spoofing**: `authorId: "someone_else_uid"`
2. **Shadow Field Injection**: `isVerified: true` (not in schema)
3. **Immortality Breach**: Attempting to update `createdAt`.
4. **Range Poisoning (High)**: `complexity: 99999`
5. **Range Poisoning (Negative)**: `stiffness: -1`
6. **Large String Attack**: `name: "A" * 2000`
7. **Type Mismatch**: `color: 12345` (should be string)
8. **Orphaned Write**: Creating a preset without being signed in.
9. **Bypass Rules via List**: Querying all presets without a size limit or owner filter (if applicable).
10. **ID Poisoning**: Using a 2KB document ID.
11. **State Injection**: Modifying someone else's preset.
12. **Null Value Attack**: Setting `name: null` when it is required.

These will be blocked by the following `firestore.rules`.
