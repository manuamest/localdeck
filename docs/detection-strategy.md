# Detection Strategy

Localdeck should combine multiple weak signals into confident app cards.

## Detection Sources

Use read-only signals where possible:

- listening TCP ports on localhost
- Docker container port bindings
- Docker Compose labels and project names
- HTTP probing of local URLs
- response headers and titles
- known framework default ports and response patterns
- process metadata only when safely available from the execution environment

## Initial Detection Pipeline

1. Discover candidate ports.
2. Probe likely HTTP endpoints on localhost.
3. Read Docker and Compose metadata when available.
4. Classify framework/runtime hints.
5. Merge duplicate signals into app cards.
6. Rank cards by confidence and usefulness.

## Candidate Signals

Framework hints may come from:

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

## Safety Rules

- Probe only localhost or explicitly local/private addresses.
- Use short timeouts.
- Do not send credentials.
- Do not crawl beyond the root and a tiny allowlist of metadata endpoints.
- Do not execute code inside containers as part of default detection.
