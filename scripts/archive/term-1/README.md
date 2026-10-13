# Archived term-1 one-off scripts

These scripts were used once to extract, clean, enrich or patch the term-1 canonical data.
They are kept for history and as reference when ingesting a new part (e.g. term-2).
They are **not** part of the build or CI. Some read hard-coded paths from the old
`book-sources/term-1/` layout or from `scratch/`; `getSources('term-1')` still resolves
to the term-1 part through an alias in `scripts/sources-config.mjs`.

Run from the repo root, e.g. `node scripts/archive/term-1/audit-book.mjs`.
