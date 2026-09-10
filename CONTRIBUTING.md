# Contributing to Common

Start with the [setup guide](README.md#run-common) and [architecture notes](docs/ARCHITECTURE.md). The redesign currently lives on `feat/common-social-redesign`; use that branch as the base for changes to the new interface while its pull request is open.

## Make a focused change

1. Create a branch for one problem or improvement.
2. Keep Go handlers responsible for authentication, membership and visibility decisions. The browser is a presentation layer.
3. Use `src/lib/api.ts` for frontend HTTP, media and WebSocket addresses. Avoid hardcoded service origins.
4. Compose existing UI primitives at their call sites. Leave `src/components/ui` unchanged for visual adjustments.
5. Use the theme tokens and type hierarchy in the design notes. Keep keyboard focus visible and respect reduced-motion preferences.
6. Keep real error, loading and empty states. Do not invent production members, activity or delivery confirmations. Explicitly requested local samples belong in the [opt-in demo seed](docs/DEMO_DATA.md), clearly labeled as fictional.

Add comments when they explain a contract or constraint that the code alone does not make clear. Avoid comments that restate the next line.

## Check the change

From `frontend/`:

```sh
npm ci
npm run format
npm run format:check
npm run lint
npm run build
```

From `backend/`:

```sh
go test ./... -count=1
go vet ./...
```

The formatter is pinned, following the [official Prettier installation guidance](https://prettier.io/docs/install). Its scope is application source; installed UI primitives and generated files are excluded.

For backend behavior changes, extend the temporary-database integration journeys where they can demonstrate a regression. Keep tests independent from the tracked legacy database and media. Never use real account records as fixtures.

For interface changes, record which routes, viewport sizes, keyboard flows and motion settings you actually checked. Do not describe compilation as browser verification.

## Open a pull request

Explain the user-visible problem and the resulting behavior. Include relevant checks and limitations. Preserve contributor history and split independent changes into focused commits.

Keep environment files, tokens, newly generated local databases, uploaded media and compiled binaries out of commits. The original tracked runtime files are legacy artifacts; local development should use a separate database or the isolated Docker volumes.
