---
name: localdeck-product
description: Use when planning or evaluating Localdeck product scope, feature fit, non-goals, or zero-config dashboard behavior.
---

# Localdeck Product Skill

Use this skill to keep Localdeck narrow.

## Product Test

Every feature must pass this question:

> Does this help a developer see what web apps are currently running on localhost?

If the answer is no, reject or defer it.

## Default Answer To Scope Creep

Reject features that turn Localdeck into:

- a Docker manager
- a generic dashboard builder
- a monitoring platform
- a bookmark manager
- a service catalog
- a remote infrastructure tool

## Good Features

- Better automatic discovery.
- Better framework identification.
- Clearer app cards.
- Safer Docker/local probing.
- Useful grouping by source or project.
- Fast refresh of current local state.

## Risky Features

- User-defined widgets.
- Manual app catalogs.
- Start/stop/restart actions.
- Persistent uptime graphs.
- Alerting.
- Remote agents.
- User accounts.

## Decision Rule

When in doubt, choose the smaller feature that preserves zero-config behavior.
