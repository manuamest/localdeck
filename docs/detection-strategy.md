# Detection Strategy

Localdeck should combine multiple weak signals into confident app cards. v0.1 intentionally starts with a narrow signal: HTTP responses from configured local ports.

## Detection Sources

Use read-only signals where possible:

- HTTP probing of local URLs
- HTML titles
- basic favicon links

Planned later sources:

- Docker container port bindings
- Docker Compose labels and project names
- response headers
- known framework default ports and response patterns
- process metadata only when safely available from the execution environment

## Initial Detection Pipeline

1. Parse `LOCALDECK_SCAN_PORTS` as a comma-separated list.
2. Remove `LOCALDECK_PORT` to avoid showing Localdeck itself.
3. Probe `http://{LOCALDECK_HOST}:{port}` first.
4. Probe `https://{LOCALDECK_HOST}:{port}` if HTTP does not respond.
5. Follow safe same-protocol same-host redirects, up to a small limit.
6. Ignore ports that do not produce an HTTP or HTTPS response.
7. Extract title and favicon metadata from the response body.
8. Replace the in-memory service snapshot.

## Candidate Signals

Future framework hints may come from:

- common ports: Vite `5173`, Next.js `3000`, Streamlit `8501`, Ollama `11434`, Langflow `7860` or configured ports
- response headers: server, powered-by, content-type
- HTML titles and known root pages
- Docker labels: compose project, service, image name
- container names and exposed ports

## False Positive Rules

Avoid showing services that are probably not web apps:

- database ports
- message brokers
- internal metrics ports unless they serve a usable web UI
- raw TCP services that do not respond as HTTP

Localdeck only shows services that return an HTTP or HTTPS response.

## Safety Rules

- Probe only localhost or explicitly local/private addresses.
- Use short timeouts.
- Do not send credentials.
- Do not crawl beyond the root in v0.1.
- Follow redirects only when they stay on the same protocol, host, and port.
- Do not execute code inside containers as part of default detection.
