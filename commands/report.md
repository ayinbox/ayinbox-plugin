---
description: Write an AY Inbox campaign report for the last 7 days or a period you name
argument-hint: "[7d | 30d | 90d | YYYY-MM-DD..YYYY-MM-DD]"
---

Write my AY Inbox campaign report using the `ayinbox-campaign-report` skill and the `ayinbox` MCP tools. Read only; change nothing.

Period: $ARGUMENTS (when empty, the last 7 full days in UTC).

1. `get_dashboard_analytics` for the headline numbers.
2. `list_campaigns` with `status: "active"`, then `get_campaign_stats` for each with `from` and `to` for the period.
3. `list_campaign_leads` with `status: "completed"` to count leads who went cold.
4. `get_advisor_summary` and `list_recommendations` for what is wrong.

Write one sentence on how the period went, a table per campaign (sent, replies, positive replies, bounce rate, meetings), the best and worst step with sample sizes, the open Advisor findings, and 2 or 3 numbered next steps. Every number comes from a tool result. No claims about inbox placement.
