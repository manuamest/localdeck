# Security Model

Localdeck inspects local developer environments. That is security-sensitive.

## Assumptions

- Localdeck runs locally for one developer.
- It is not intended to be exposed publicly.
- It may receive read access to Docker metadata.
- It should not require secrets to operate.

## Default Restrictions

- No external network scanning.
- `LOCALDECK_HOST` must be `localhost`, `host.docker.internal`, or a loopback/private/link-local IP address.
- No container exec by default.
- No secret collection.
- No environment variable display unless explicitly designed and redacted.
- No request body capture.
- No authenticated endpoint probing.

## Docker Socket Risk

Mounting the Docker socket can effectively grant host-level power.

If Localdeck uses the Docker socket:

- document the risk clearly
- use read-only metadata operations
- avoid write operations entirely
- isolate Docker access in a small module
- test that unsupported write operations are not present

Current Docker metadata inspection is optional and limited to `GET /containers/json` against a mounted socket. Localdeck does not call Docker write endpoints and does not exec into containers.

## Favicon Proxy

Localdeck proxies favicons only for local/private targets. It rejects external hosts, uses short timeouts, follows no redirects, requires image content types, and caps response size.

## Data Exposure

Displayed metadata should be safe by default:

- app name
- local URL
- port
- source type
- framework/runtime hint
- basic status

Avoid displaying:

- tokens
- cookies
- Authorization headers
- full environment variables
- database connection strings
- private file paths unless needed and safe
