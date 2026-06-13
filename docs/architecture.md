# Architecture

This document tracks the current Localdeck architecture.

Localdeck is a Dockerized FastAPI + React app. It keeps only the latest valid scan snapshot in memory and serves both the REST API and the dashboard from port `4888`.

## Current Components

- Scanner: probes configured HTTP/HTTPS ports on `LOCALDECK_HOST`.
- HTML parser: extracts titles and common favicon URLs.
- Registry: stores the latest service snapshot in memory.
- API: exposes health, services, and manual rescan endpoints.
- Dashboard UI: displays live service cards, endpoint grouping, filters, sorting, and empty/loading/error states.
- Docker runtime: builds the React app and runs FastAPI/Uvicorn on port `4888`.

## Runtime Flow

1. FastAPI starts and creates an in-memory `ServiceRegistry`.
2. A background scan loop runs every `LOCALDECK_SCAN_INTERVAL` seconds.
3. The scanner parses comma-separated ports and ranges from `LOCALDECK_SCAN_PORTS`, then skips `LOCALDECK_PORT`.
4. Each port is probed through HTTP, then HTTPS if HTTP does not respond, on `LOCALDECK_HOST`.
5. Safe same-protocol same-host redirects are followed.
6. Successful HTTP responses become `ServiceRecord` objects.
7. The registry replaces the previous snapshot after successful scans and keeps the previous snapshot if a scan fails unexpectedly.
8. The frontend polls `GET /api/services` and can trigger `POST /api/scan`.

## App Record Shape

A detected service includes:

- id
- title
- URL used by the scanner
- display URL shown to the user
- host
- port
- protocol
- HTTP status code
- approximate response time
- favicon URL when found
- last seen timestamp
- last checked timestamp
- error field, currently unused for successful services

## Design Constraints

- Localdeck should work without a config file.
- Docker socket access is not required.
- Detection should be fast enough for interactive local use.
- Backend and UI should stay decoupled through a small API contract.
- No database, persistence, authentication, users, or favorites.

## Current API

- `GET /health`
- `GET /api/services`
- `POST /api/scan`

## Open Decisions For Later Versions

- Docker socket discovery as an optional read-only module.
- Framework/runtime classification heuristics.
