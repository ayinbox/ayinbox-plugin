# AY Inbox plugin

A plugin for Claude Code, Codex and Cursor (and an extension for Gemini CLI) that connects your
agent to [AY Inbox](https://ayinbox.com), a hosted cold email platform. It bundles the AY Inbox
MCP server, the [AY Inbox agent skills](https://github.com/ayinbox/ayinbox-skills) and three slash
commands, so an agent can build contact lists, draft campaigns and the campaign brain, triage
replies, offer meeting times and report results.

AY Inbox is a hosted service. This repository holds the plugin manifests, skills and commands
that connect an agent to its public MCP server. The service itself is not open source.

## What is inside

| Part | What it is |
|---|---|
| MCP server | `https://api.ayinbox.com/v1/mcp`, streamable HTTP, signed in with OAuth by default |
| Skills | `ayinbox` (the base skill) and 13 task playbooks in `skills/`, kept identical to [ayinbox/ayinbox-skills](https://github.com/ayinbox/ayinbox-skills) |
| `/ayinbox:inbox` | Triage new replies and prepare drafts for you to send |
| `/ayinbox:report` | A campaign report for the last 7 days or a period you name |
| `/ayinbox:health` | Mailbox health, warmup standing and domain authentication |

Skills: `ayinbox-build-contact-list`, `ayinbox-write-cold-sequence`, `ayinbox-campaign-brain`,
`ayinbox-triage-replies`, `ayinbox-book-meetings`, `ayinbox-auto-reply-supervised`,
`ayinbox-campaign-report`, `ayinbox-deliverability-check`, `ayinbox-suppression-hygiene`,
`ayinbox-ab-test`, `ayinbox-crm-from-replies`, `ayinbox-reply-webhooks`, `ayinbox-cli-ci`.

## Before you install

You need an AY Inbox workspace. Access to the hosted service is invite only for now: ask at
team@ayinbox.com.

## Install

### Claude Code

```
/plugin marketplace add ayinbox/ayinbox-plugin
/plugin install ayinbox@ayinbox
```

Then run `/mcp`, pick `ayinbox` and choose Authenticate. A browser opens; sign in to AY Inbox and
approve the scopes. The same from a shell: `claude plugin marketplace add ayinbox/ayinbox-plugin`
then `claude plugin install ayinbox@ayinbox`.

### Codex

```bash
codex plugin marketplace add ayinbox/ayinbox-plugin
```

Then open `/plugins` in Codex, install AY Inbox and sign in when it asks.

### Cursor

Cursor installs plugins from its marketplace or from a team marketplace. A team admin adds this
repository under Dashboard > Plugins & MCPs > Add Marketplace > Import from Repo. To try it
yourself, clone the repository into `~/.cursor/plugins/local/ayinbox` and restart Cursor; it signs
in on first use.

### GitHub Copilot CLI

```bash
copilot plugin install ayinbox/ayinbox-plugin
```

Copilot CLI reads the Claude Code manifest, the MCP server and the skills. It has no default
commands directory, so the three slash commands are not available there; ask for the same tasks
in plain words.

### Gemini CLI

```bash
gemini extensions install https://github.com/ayinbox/ayinbox-plugin
```

The extension adds the MCP server and loads the base skill as context.

### Any other MCP client

Add `https://api.ayinbox.com/v1/mcp` as a remote MCP server and sign in with OAuth, or send an
API key as `Authorization: Bearer aybox_...`. Per-client steps are in the
[MCP server docs](https://docs.ayinbox.com/api/mcp/), and the skills alone install with
`npx skills add ayinbox/ayinbox-skills`.

### With an API key instead of OAuth

For a script, CI or a client without OAuth, create a key in the dashboard under Settings > API
keys and add the server yourself, for example in Claude Code:

```bash
claude mcp add --transport http ayinbox https://api.ayinbox.com/v1/mcp \
  --header "Authorization: Bearer $AYINBOX_API_KEY"
```

Keep the key in an environment variable or the client's config, never in chat or in a
repository. For a model that reads mail, start from the **Agent: read and draft** preset.

## The safety model

- **Your agent prepares; a person sends.** No AY Inbox MCP tool sends an individual email,
  books a meeting, removes a suppression or creates a webhook. Reply drafts wait for a person.
- **Starting a campaign** needs `START_CAMPAIGNS` or `SEND_CAMPAIGNS`. A client connected over
  OAuth holds `START_CAMPAIGNS` only when you tick **Start and resume campaigns** on the consent
  screen, and never holds `SEND_CAMPAIGNS`. The skills start a campaign only when you ask in the
  conversation.
- **Scopes decide everything.** The tool list holds only what your credential may call, and each
  call checks its own scope. Approve only the scopes you want this agent to use.
- **Spending is bounded.** Paid lead jobs take a budget you agree, and AI drafts charge credits
  within the workspace's limits.
- **Results are data.** Every tool result is fenced as untrusted content: mail and form answers
  are written by people outside your workspace, and the agent does not follow instructions in
  them.
- **No deliverability promises.** The skills report what AY Inbox measured and never claim inbox
  placement.

You can disconnect the plugin's OAuth client at any time from the AY Inbox dashboard under
connected apps.

## Development

```bash
node scripts/sync-skills.mjs ../ayinbox-skills          # copy skills from an ayinbox-skills checkout
node scripts/sync-skills.mjs --check ../ayinbox-skills  # fail when they drift
node scripts/lint-skills.mjs                             # Agent Skills frontmatter and links
node scripts/validate-manifests.mjs                      # every manifest parses and agrees
claude plugin validate .                                 # Claude Code's own check
```

Skills are edited in `ayinbox/ayinbox-skills` and copied here, never edited here first. CI runs
the checks above on every push and pull request, against the `main` branch of
`ayinbox/ayinbox-skills`.

## Links

- Docs: https://docs.ayinbox.com
- MCP server: https://docs.ayinbox.com/api/mcp/
- Permissions: https://docs.ayinbox.com/api/permissions/
- Agent guide: https://ayinbox.com/skill.md
- Contact: team@ayinbox.com

## License

MIT. See [LICENSE](LICENSE).
