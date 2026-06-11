# Localdeck Agent Instructions

Localdeck is an open source, zero-config local dashboard for developers.

Its only job is to answer:

> What web applications are currently running on my localhost?

Default dashboard URL:

```text
http://localhost:4888
```

## Product Definition

Localdeck detects local web applications and shows them visually in a focused dashboard.

It should detect apps started through:

- Docker
- Docker Compose
- Python
- uv
- uvicorn
- FastAPI
- Flask
- Django
- Vite
- React
- Next.js
- http.server
- Streamlit
- Gradio
- Ollama
- Langflow
- other local web servers

## Non-Goals

Localdeck is not:

- a configurable dashboard like Homepage or Dashy
- a Docker manager like Portainer
- an observability tool like Grafana or Uptime Kuma
- a bookmark manager
- a favorites system
- a process supervisor
- a deployment tool

Do not add configuration-heavy features unless they directly improve zero-config discovery.

## Development Principles

1. Zero-config first.
2. Detection over manual entry.
3. Show current local reality, not desired state.
4. Prefer safe read-only inspection.
5. Keep scope narrow and developer-focused.
6. Make Docker execution predictable.
7. Treat Docker socket and host inspection as security-sensitive.

## Architecture Bias

Prefer a small system with clear seams:

- detector runtime: finds local web apps
- normalizer: turns signals into app cards
- API: exposes detected apps to the UI
- UI: visual dashboard at port 4888
- Docker packaging: runs consistently on developer machines

## Testing Bias

Prioritize tests for detection logic:

- parse Docker and Compose metadata
- classify common framework servers
- probe localhost ports safely
- avoid false positives for non-web ports
- handle inaccessible services gracefully

## Security Bias

Never assume access to host internals is harmless.

- Prefer read-only Docker access.
- Do not execute commands inside detected containers by default.
- Do not expose secrets, environment variables, headers, or request bodies.
- Do not scan external networks.
- Keep probing limited to localhost/private local targets.
