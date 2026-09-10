# Dependency maintenance

The September 2026 repository polish refreshes the frontend lockfile within the declared major-version ranges and pins Prettier for reproducible formatting. Next.js stays on the project's 15.5.24 maintenance release; this is not a Next.js 16 migration.

Two explicit overrides are recorded in `frontend/package.json`:

| Override | Reason |
|---|---|
| `next` → `postcss` | Reuse the direct PostCSS 8.5.28 dependency instead of Next.js 15's nested 8.4.31 copy. The old copy is covered by source-map and stringify advisories. |
| `brace-expansion@^1.0.0` → `1.1.18` | Update the old 1.x chain without forcing consumers of newer major versions back to 1.x. |

PostCSS references: [source-map disclosure](https://github.com/advisories/GHSA-r28c-9q8g-f849), [incomplete source-map fix](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp), [stringify output](https://github.com/advisories/GHSA-qx2v-qp2m-jg93). Brace expansion reference: [unbounded intermediate expansion](https://github.com/advisories/GHSA-rgw5-rvv9-x895).

The lockfile was resolved in an isolated folder and then installed with `npm ci` to remove an inconsistent nested dependency resolution. Future updates should use the pinned manifest and a clean installation, then run formatting, lint and production build checks. Remove an override when the parent package adopts a suitable upstream dependency and the resulting tree passes the checks.

The npm advisory database is a time-specific dependency check, not a security certification of the application. It does not review the Go handlers, authorization rules, host configuration or business logic. See [the validation record](VALIDATION.md) for recorded results.
