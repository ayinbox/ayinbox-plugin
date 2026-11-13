---
description: Triage new AY Inbox replies and prepare drafts for you to send
argument-hint: "[since date or campaign name]"
---

Triage my AY Inbox replies using the `ayinbox-triage-replies` skill and the `ayinbox` MCP tools.

Scope: $ARGUMENTS (when empty, every unread thread).

1. `get_inbox_overview`, then `list_threads` with `unseen_only: true` (add `since` or `campaign_id` if the scope names one).
2. Read each thread with `get_thread` and sort it: wants a call, question or pricing, not now, wrong person, not interested or opt-out, auto-reply, needs me.
3. For the threads that need an answer, prepare a draft with `draft_reply` (text you write from the brain) or, after telling me how many, `generate_reply_draft` with a new `idempotency_key` each. Show every flag.
4. Do not send anything, mark anything seen, or change labels unless I ask.

Answer with one line per thread (who, campaign, what they want, your draft or why none) and end with 2 or 3 numbered next steps.
