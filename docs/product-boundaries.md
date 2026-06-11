# Product Boundaries

Localdeck is a zero-config local web app discovery dashboard.

## Core Promise

Localdeck answers one question:

> What applications do I have running locally right now?

## In Scope

- Detect running local web apps.
- Show name, URL, port, source, framework hints, and status.
- Run as a Dockerized app on a fixed local port, initially `4888`.
- Support Docker, Docker Compose, Python web servers, JavaScript dev servers, ML app servers, and common localhost services.
- Work with minimal or no user configuration.

## Out of Scope

- Managing containers or processes.
- Starting, stopping, restarting, or deleting services.
- Long-term monitoring, alerting, uptime history, or SLA tracking.
- Arbitrary widgets, bookmarks, favorites, or manually curated dashboards.
- Remote host monitoring.
- Team dashboards or hosted cloud service management.

## Product Guardrail

If a feature does not improve automatic discovery or visual understanding of currently running local web apps, it probably does not belong in Localdeck.
