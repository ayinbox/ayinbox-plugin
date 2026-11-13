---
description: Check AY Inbox mailbox health, warmup standing and domain authentication
argument-hint: "[mailbox address or empty for all]"
---

Check my AY Inbox sender mailboxes using the `ayinbox-deliverability-check` skill and the `ayinbox` MCP tools. Read only; change nothing.

Mailbox: $ARGUMENTS (when empty, every mailbox).

1. `get_advisor_summary`, then `list_recommendations` with `surface: "deliverability"`.
2. `list_mailboxes` for status, health, usage, warmup and errors.
3. For each mailbox with a warning or an error: `get_mailbox` and `get_warmup_ban_status`.
4. If any finding is about SPF, DKIM or DMARC, tell me the record to add and how to re-check it.

Answer with a short table (mailbox, band, warmup standing, what is wrong), the fixes in order, and 2 or 3 numbered next steps. Never promise inbox placement.
