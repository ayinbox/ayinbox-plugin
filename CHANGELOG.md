# Changelog

## 0.1.0 (unreleased)

- First release for Claude Code, Codex, Cursor, GitHub Copilot CLI and Gemini CLI.
- Registers the hosted AY Inbox MCP server (`https://api.ayinbox.com/v1/mcp`, OAuth sign-in).
- Bundles the 14 skills from `ayinbox/ayinbox-skills` 0.1.0.
- Adds `/ayinbox:inbox`, `/ayinbox:report` and `/ayinbox:health`.
- CI validates every manifest and fails when the skills drift from `ayinbox/ayinbox-skills`.
