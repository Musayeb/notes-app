# Notes app

A small notes API (Node.js, Express, PostgreSQL) with a web page.

## Run locally

```sh
docker compose up
```

Open http://localhost:3000. Code changes in `src/` and `public/` reload automatically.
Data is kept in the `db-data` volume across `docker compose down`
(`docker compose down -v` deletes it).

To change ports or credentials, copy `.env.example` to `.env` and edit it.

## Endpoints

| Path | Purpose |
|---|---|
| `GET /health` | Liveness: the process answers (does not check the database) |
| `GET /ready` | Readiness: the database answers |
| `GET /api/version` | Running version |
| `GET /api/notes` | Last 100 notes |
| `POST /api/notes` | Create a note: `{"text": "..."}` |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
