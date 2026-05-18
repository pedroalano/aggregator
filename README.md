# gator

RSS feed aggregator CLI written in TypeScript. Subscribe to feeds, scrape them on a loop, and browse the latest posts — all from your terminal. Backed by PostgreSQL via Drizzle ORM.

## Prerequisites

- **Node.js 22.15.0** — pinned in `.nvmrc`. With `nvm` installed: `nvm use`.
- **PostgreSQL 14+** — running locally or any reachable instance. You need a database and a user with privileges to create tables.

## Install

```bash
npm install
```

## Config

`gator` reads its config from `~/.gatorconfig.json`. Create it before running anything:

```json
{
  "db_url": "postgres://user:password@localhost:5432/gator"
}
```

- `db_url` (required) — Postgres connection string. Used by both the app and migrations.
- `current_user_name` (optional) — added automatically by `register` / `login`; don't set it by hand.

## Database setup

Apply migrations to create the schema:

```bash
npm run migrate
```

Regenerate migration SQL after changing `src/lib/db/schema.ts`:

```bash
npm run generate
```

## Run

```bash
npm start <command> [args...]
```

## Commands

| Command | Description |
|---|---|
| `register <name>` | Create a user and set them as current. |
| `login <name>` | Switch the current user. |
| `users` | List all users (marks the current one). |
| `addfeed <name> <url>` | Create a feed and follow it (requires login). |
| `feeds` | List all feeds and their owners. |
| `follow <url>` | Follow an existing feed (requires login). |
| `following` | List feeds the current user follows. |
| `unfollow <url>` | Stop following a feed (requires login). |
| `agg <duration>` | Continuously scrape feeds on an interval (e.g. `30s`, `1m`, `1h`). Ctrl-C to stop. |
| `browse [limit]` | Show latest posts from feeds you follow. Default limit `2`. |
| `reset` | Wipe the users table (cascades to feeds, follows, posts). |

## Example session

```bash
# one-time setup
nvm use
npm install
echo '{"db_url":"postgres://localhost:5432/gator"}' > ~/.gatorconfig.json
npm run migrate

# create a user and subscribe to a feed
npm start register alice
npm start addfeed "Hacker News" https://hnrss.org/frontpage

# scrape every 30 seconds (leave running in another terminal)
npm start agg 30s

# read the latest 5 posts
npm start browse 5
```
