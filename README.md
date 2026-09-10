# Common

**A place for your people.**

A full-stack social network with an editorial interface, original community photography and scroll-linked motion. Built with **Next.js, React, Go and SQLite**.

![Original Common community campaign photograph](frontend/public/images/common-studio.webp)

## The experience

- **Your feed:** publish moments, attach JPEG/PNG/GIF images, react and join the conversation.
- **Your audience:** public posts, followers-only posts and selected-follower posts; public or private profiles.
- **Your circles:** discover groups, request membership, invite people, share posts and organize events.
- **Your conversations:** live messages, emoji, searchable contacts, mobile conversation navigation and delivery acknowledgements.
- **Your activity:** follow requests, circle invitations and event notifications, accessible throughout the app.

The Common redesign carries the photographic depth and editorial typography of the Nexora reference into an everyday social application. Images shift and open as you scroll, posts enter gently, and a reading-progress line follows the page. Reduced-motion preferences are respected.

## Run locally

Requirements: Node.js 22+, Go 1.22+ and npm. Docker is optional.

```sh
git clone https://github.com/hujaafar/social-network.git
cd social-network
# Select feat/common-social-redesign while the redesign is under review.
git checkout feat/common-social-redesign
```

Start the API in one terminal:

```sh
cd backend
go run .
```

Start the frontend in another:

```sh
cd frontend
npm ci
npm run dev
```

Open **http://localhost:3000** and create an account. The browser talks to **http://localhost:8080** by default. Account names and passwords used in automated tests are temporary fixtures, not seeded application accounts.

For a different API host, set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` **before building**. Set `FRONTEND_ORIGIN` on the Go server to the exact frontend origin. Set `PORT` and `DATABASE_PATH` to use a separate port and database. `MIGRATIONS_PATH` defaults to `file://app/db/migrations` when starting inside `backend/`.

## Docker

```sh
docker compose up --build
```

The frontend and backend have separate images. Named volumes persist the database, uploaded media and avatars. Published ports bind to localhost. The public API URL is a frontend **build argument**; the browser must be able to reach that URL. Internal Docker service names are not browser addresses.

## Checks

```sh
cd frontend
npm run lint
npm run build
cd ../backend
go test ./... -count=1
go vet ./...
```

The integration test uses a temporary database and temporary upload directory. It exercises registration, sessions, failed login, following, posts and PNG media, likes, comments, private post visibility, circle membership, notifications, events, RSVP and live chat delivery. CI runs the frontend and backend checks separately.

## Architecture

| Area | Location |
|---|---|
| App routes and shared theme | `frontend/src/app` |
| Editorial imagery and application shell | `frontend/src/components/design` |
| API origin and WebSocket URL configuration | `frontend/src/lib/api.ts` |
| Feed, circles, profile and chat components | `frontend/src/components` |
| HTTP routing and integration journeys | `backend/server` |
| Go application handlers | `backend/app` |
| SQLite migrations | `backend/app/db/migrations` |

[Design and motion notes](docs/REDESIGN.md) · [Validation and limitations](docs/VALIDATION.md) · [Original image prompts](docs/IMAGE_PROMPTS.txt)

## Authors

Original project contributors remain credited:

- [Ali Hasan](https://github.com/AliHJMM)
- [Habib Mansoor](https://github.com/7abib04)
- [Mohamed Alasfoor](https://github.com/Mohamed-Alasfoor)
- [Hussain Jawad](https://github.com/hujaafar)
