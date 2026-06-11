---
name: localdeck-discovery
description: Use when designing or implementing Localdeck detection for Docker, Compose, local ports, Python, JS dev servers, FastAPI, Flask, Django, Vite, Next.js, Streamlit, Gradio, Ollama, or Langflow.
---

# Localdeck Discovery Skill

Use this skill when working on service discovery and classification.

## Detection Model

Treat discovery as signal fusion, not a single source of truth.

Useful signals:

- open localhost ports
- Docker port mappings
- Docker Compose labels
- HTTP status and headers
- HTML title
- known framework default pages
- container image and name hints

## Discovery Output

Normalize every finding into an app candidate with:

- URL
- port
- source
- name hint
- framework hint
- confidence
- evidence

## Classification Rules

- Prefer high-confidence evidence over port guesses.
- Merge duplicate Docker and HTTP probe findings.
- Do not show raw TCP services as web apps unless HTTP probing succeeds.
- Keep confidence visible in code even if not shown in UI initially.

## Probe Rules

- Use short timeouts.
- Probe root first.
- Avoid crawling.
- Avoid authenticated or mutating endpoints.
- Never scan public IP ranges.

## Test Cases To Prioritize

- Docker container exposing a web app.
- Compose service with labels and port mapping.
- Vite on `5173`.
- Next.js on `3000`.
- FastAPI/uvicorn with OpenAPI endpoint.
- Flask/Django development server.
- Streamlit on `8501`.
- Ollama on `11434`.
- Non-web database port should be ignored.
