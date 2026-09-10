# Local demo content

The optional seed adds **8 fictional profiles, 12 public posts, 24 comments and 45 reactions**. It also creates 16 follows between the fictional profiles. It does not follow anyone, publish posts or send messages on behalf of an existing account.

Each persona's displayed nickname ends in **· Demo**, and its bio identifies it as fictional. Demo personas cannot sign in: their password field deliberately contains no usable password hash. The three existing campaign images illustrate the posts; initials provide the avatars. No real people's identities or photographs are imported.

## Add the examples

First run Common against an isolated local runtime database with migrations applied. Keep the database and generated media outside the source checkout. From `backend/`, run:

```sh
go run ./cmd/seed-demo -runtime-dir /absolute/path/to/local-runtime -assets-dir ../frontend/public/images
```

The runtime directory must already contain `social_network.db`. Both arguments are required. The command refuses source directories containing `go.mod`, `package.json` or `.git`; it does not run as part of application startup or a migration.

Refresh the feed to see the examples. You can like, comment on, bookmark or follow the fictional profiles using your own account. The sample accounts stay offline and do not automatically answer messages.

## Repeatability and boundaries

Stable IDs let the command be rerun without duplicating records or moving their timestamps. Existing rows are not updated, and seeded relationships use only demo IDs. Normal database triggers calculate reaction and comment counts. The seed transaction rolls back if an insertion fails.

The command writes only files prefixed `demo-` inside the runtime's `avatars/` and `uploads/` folders. It reuses identical files and rejects a filename collision containing different bytes. Newly created demo media can remain if a later database operation fails; rerunning the command safely reuses it.

Keep runtime databases and generated media out of Git. The seed source and tests are committed; the populated local database is not. Back up any local runtime you want to preserve before experimenting. The integration test checks repeatability, original-record preservation, counters, demo labels, media files and authenticated feed responses using a temporary database.
