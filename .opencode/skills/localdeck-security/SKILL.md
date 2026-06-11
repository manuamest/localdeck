---
name: localdeck-security
description: Use when Localdeck code touches Docker socket access, host inspection, localhost probing, process metadata, network scanning, or displayed service metadata.
---

# Localdeck Security Skill

Use this skill for any code that inspects the host, Docker, ports, or HTTP services.

## Security Principles

- Read-only inspection by default.
- No Docker write operations.
- No container exec in default detection.
- No secret collection.
- No external scanning.
- Fail closed when scope is ambiguous.

## Docker Socket Guardrails

Docker socket access can be equivalent to root on the host.

If code uses Docker APIs:

- isolate Docker access in one module
- allow list read-only operations
- test that mutating operations are not used
- document required socket mount clearly
- degrade gracefully when Docker is unavailable

## HTTP Probe Guardrails

- Probe only local targets.
- Use GET or HEAD only.
- Use short timeouts.
- Do not send credentials.
- Do not follow unbounded redirects.
- Do not persist response bodies beyond what is needed for classification.

## Display Guardrails

Do not display:

- environment variables
- tokens or credentials
- cookies
- auth headers
- request/response bodies containing user data
- sensitive local filesystem paths

## Review Checklist

Before merging host/Docker/probe code, verify:

- local-only target validation exists
- timeouts exist
- errors are handled without crashing discovery
- secrets are redacted or never collected
- Docker operations are read-only
- tests cover unsafe or out-of-scope targets
