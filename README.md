# Localdeck

Localdeck is a zero-config local dashboard that answers one question:

> What web applications are currently running on my localhost?

It runs in Docker, scans common local development ports, probes HTTP services, extracts a title/favicon, and shows the current live services as visual cards.

Localdeck is intentionally small and ephemeral. If it restarts, it can forget everything.

## What It Is Not

Localdeck is not:

- a configurable dashboard like Homepage or Dashy
- a Docker manager like Portainer
- an observability platform like Grafana
- an uptime monitor like Uptime Kuma
- a bookmark manager
- a favorites system
- a multi-user SaaS product

There is no database, no persistence, no authentication, and no user system.

## Quickstart

Build and run with Docker Compose:

```bash
docker compose up --build
```

Open:

```text
http://localhost:4888
```

Healthcheck:

```text
http://localhost:4888/health
```

Services API:

```text
http://localhost:4888/api/services
```

## Docker Run

Build the image:

```bash
docker build -t localdeck:dev .
```

Run it:

```bash
docker run --rm -p 4888:4888 localdeck:dev
```

On Linux, include `host-gateway` so the container can reach services published on the host:

```bash
docker run --rm \
  --add-host=host.docker.internal:host-gateway \
  -p 4888:4888 \
  localdeck:dev
```

## Scan Custom Ports

v0.1 scans this default list:

```text
3000,3001,4173,4200,5000,5050,5173,5500,6274,7000,7860,8000-8010,8080-8084,8888,9000,9443,11434
```

The list includes common dev servers plus frequent local Docker UI ports such as pgAdmin `5050`, Adminer `8081`, File Browser `8082`, Dozzle `8083`, IT Tools `8084`, Portainer `9000`, Portainer HTTPS `9443`, and local app ranges like `8000-8010`.

If your apps run on other ports, pass `LOCALDECK_SCAN_PORTS`:

```bash
docker run --rm \
  --add-host=host.docker.internal:host-gateway \
  -p 4888:4888 \
  -e LOCALDECK_SCAN_PORTS=8000-8010,8081,9000,5050 \
  localdeck:dev
```

For Docker Compose, edit `docker-compose.yml`:

```yaml
environment:
  LOCALDECK_SCAN_PORTS: 8000-8010,8081,9000,5050
```

## Environment Variables

| Variable | Default | Description |
|---|---:|---|
| `LOCALDECK_HOST` | `host.docker.internal` | Local/private host scanned from inside the container |
| `LOCALDECK_PORT` | `4888` | Port used by Localdeck itself |
| `LOCALDECK_SCAN_PORTS` | common dev ports | Comma-separated ports and simple ranges to scan |
| `LOCALDECK_SCAN_INTERVAL` | `10` | Scan interval in seconds |
| `LOCALDECK_REQUEST_TIMEOUT` | `2` | HTTP request timeout in seconds |

## Current Behavior

Localdeck currently:

- only allows local/private scan hosts
- scans explicit HTTP/HTTPS ports
- tries HTTP first, then HTTPS when HTTP does not respond
- follows safe same-protocol local redirects
- ignores Localdeck's own port
- extracts HTML titles
- resolves basic favicons
- falls back to a title initial when favicon loading fails
- groups multiple endpoints for the same detected service in one card
- stores only the latest snapshot in memory
- supports manual rescans from the UI

Not included yet:

- Docker socket discovery
- port ranges like `3000-3010`
- persistent settings
- history
- authentication
- favorites

## Linux Notes

Inside Docker, `localhost` points to the container, not the host. Localdeck defaults to scanning `host.docker.internal`.

On Linux, Docker needs this mapping:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

The included `docker-compose.yml` already contains it.

## Development

Backend:

```bash
cd backend
python -m pip install -e ".[test]"
pytest
uvicorn app.main:app --host 0.0.0.0 --port 4888
```

Frontend:

```bash
cd frontend
npm install
npm run dev
npm run build
```

During frontend development, Vite proxies `/api` and `/health` to `http://localhost:4888`.
