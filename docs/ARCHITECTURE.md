# How Common fits together

Common retains the project's Go HTTP server, SQLite persistence and Next.js App Router. The redesign changes presentation and fixes several interaction contracts without replacing the backend.

```mermaid
flowchart LR
    Browser[Browser] -->|HTML and assets| Next[Next.js / React]
    Browser -->|HTTP + session cookie| API[Go HTTP handlers]
    Browser <-->|WebSocket| Chat[Private and circle chat]
    API --> SQLite[(SQLite)]
    Chat --> SQLite
    API --> Media[Uploads and avatars]
    Next --> UI[Shared primitives and Common theme]
```

## Application boundaries

| Boundary | Responsibility | Source |
|---|---|---|
| Next.js routes | Feed, account flows, circles, profiles, notifications and chat | `frontend/src/app` |
| Shared identity | Navigation, editorial images, theme and authentication spread | `frontend/src/components/design`, `frontend/src/app/auth.css` |
| Client data | SWR caches, credentialed HTTP and WebSocket origin configuration | `frontend/src/lib` |
| HTTP entry point | Bind runtime port and construct application handlers | `backend/server/server.go` |
| Domain handlers | Sessions, visibility, membership, posts, events and conversations | `backend/app` |
| Storage | SQLite connection configuration and ordered migrations | `backend/app/db` |

`server.NewHandler(db)` is used by both the running API and the integration test. That keeps the tested routes aligned with the application. The test uses a temporary database and temporary filesystem for uploads.

## Message delivery

```mermaid
sequenceDiagram
    participant Sender as Sender browser
    participant Go as Go WebSocket handler
    participant DB as SQLite
    participant Recipient as Recipient browser
    Sender->>Go: Private message
    Go->>DB: Save message
    DB-->>Go: Durable record and ID
    Go-->>Sender: Saved message acknowledgement
    Go-->>Recipient: Saved message
    Note over Sender: Clear draft after acknowledgement
```

The sender retains the draft until acknowledgement. If confirmation does not arrive within ten seconds, the interface reports uncertainty instead of declaring delivery. HTTP history and socket messages are merged by durable IDs. Reconnect timers and stale history requests are cleaned up when conversations or connections change.

## Saved posts and feed views

Migration `000022` adds `saved_posts`, keyed by the signed-in user and post, with cascading references and indexes for collection reads and post deletion. A save is a reference to a post, not a copy or a new visibility grant. Every collection read re-applies the post's current audience. The owner of a saved collection always comes from the session cookie.

| Request | Behavior |
|---|---|
| `GET /posts/all` | All posts currently visible to the signed-in user |
| `GET /posts/all?feed=following` | Visible posts from accepted follows |
| `GET /posts/all?feed=saved` | The user's currently visible saves, newest save first |
| `POST /posts/save?post_id=…` | Idempotently save a visible post |
| `DELETE /posts/save?post_id=…` | Idempotently remove the user's reference |

The shared SWR provider is mounted only for the authenticated workspace. Returning to sign-in unmounts it, discarding account data and the in-memory composer draft. Feed caches share confirmed save/like updates. The post reader keeps the list mounted, traps focus with the existing dialog primitive, and restores focus without scrolling when closed.

Post deletion removes legacy non-cascading comments, likes, notifications and audience references in a transaction. Saved references cascade with the post. A failure rolls back the whole deletion; tests inject a failure at the final delete to verify this contract. Uploaded media cleanup remains outside this deletion contract.

Post and comment limits count Unicode code points consistently in Go and the client (500 and 250 respectively). Multi-code-point graphemes, such as joined emoji, can count as more than one.

## Configuration

| Variable | Process | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend, resolved at build time | `http://localhost:8080` |
| `FRONTEND_ORIGIN` | Go API | `http://localhost:3000` |
| `PORT` | Go API | `8080` |
| `DATABASE_PATH` | Go API | `social_network.db` |
| `MIGRATIONS_PATH` | Go API | `file://app/db/migrations` |

The public API URL must be reachable by the browser. A Docker service name is not a browser address. Run the Go process from `backend/` for the default relative migration and media paths.

Docker Compose isolates the database, uploads and avatars in named volumes, with published ports bound to localhost. A production host needs a long-running Go process, persistent storage, WebSocket support and appropriate HTTPS/session configuration. This app is not a static export or a Cloudflare Worker bundle.

## Verification boundaries

Integration journeys exercise representative behavior; they do not establish complete authorization or security coverage. See [the validation record](VALIDATION.md) for tests actually run and remaining verification work.
