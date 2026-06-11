# Architecture

This document is intentionally provisional. Keep it updated when the plan is created.

## Expected Components

- Detector: collects local service signals.
- Classifier: turns signals into framework/runtime hints.
- Normalizer: merges signals into stable app records.
- API: serves detected app records to the dashboard.
- Dashboard UI: displays cards and discovery status.
- Docker runtime: packages the app and exposes port `4888`.

## App Record Shape

A detected app should eventually include:

- id
- display name
- primary URL
- port
- source: docker, compose, process, probe, or unknown
- framework/runtime hint
- confidence
- status
- last seen timestamp
- metadata safe for display

## Design Constraints

- Localdeck should work without a config file.
- The dashboard should degrade gracefully when Docker access is unavailable.
- Detection should be fast enough for interactive local use.
- Backend and UI should stay decoupled through a small API contract.

## Open Decisions

- Backend language and framework.
- Frontend framework.
- Whether detection runs by polling, on demand, or both.
- How Docker socket access is mounted and documented.
- How to support Linux, macOS, and Docker Desktop differences.
