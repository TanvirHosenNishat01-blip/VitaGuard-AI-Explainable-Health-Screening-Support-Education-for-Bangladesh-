# Encryption proposal

**Status:** NOT IMPLEMENTED. BLOCKED BY HUMAN APPROVAL.

Field-level encryption is not present. Database files are ordinary SQLite. This note is a proposal only.

## What would change later

- A reviewed key stored outside the repository.
- Encryption of selected columns such as message bodies, names, and contact fields.
- A migration that can be reversed only with the key.
- A backup plan that does not leave plaintext copies untracked.

## What this proposal does not do

- It does not change `vitaguard.db`.
- It does not rewrite historical screening rows.
- It does not claim that encryption is already in the product.

Any migration needs a separate approval because it is irreversible without the key.
