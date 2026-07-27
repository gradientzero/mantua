# Source record

- **Item**: `claude-code-goal-docs.md`
- **Title**: Keep Claude working toward a goal
- **Origin**: Claude Code documentation (Anthropic), captured as markdown
- **URL**: https://code.claude.com/docs/en/goal
- **Captured**: 2026-07-27
- **Ingested**: 2026-07-27

Reference documentation for the `/goal` command, dropped alongside the Department of
Product article (`sources/2026-07/beyond-prompts-loops-goals-slash-commands/`) as the
primary-source counterpart to that article's fragmentary account. Complete, unlike the
article.

Inline documentation links were flattened to plain text in the capture (the surrounding
docs pages — `/loop`, hooks, auth mode, headless, scheduled tasks — were not clipped). The
prose is otherwise intact.

## Wiki pages touched

- `content/notes/keeping-an-agent-running.mdx` (new — `origin: agent`, the four
  continuation mechanisms and how `/goal` evaluates)
- `content/notes/generator-evaluator-loops.mdx` (the "make it use the thing" section now
  contrasts `/goal`'s tool-free evaluator — independent verdict, dependent evidence)
- `content/notes/building-a-generator-evaluator-harness-plan.mdx` (Stage 2 qualified:
  `/goal` is disqualified for the frontend case because its evaluator can't drive the page)
- `content/notes/agentic-engineering.mdx` (new "mechanics, one level down" section; the
  "where do these agents run" open question partly answered)
- `content/notes/harness-design-reading-list.mdx` (the Ralph Wiggum entry now notes the
  pattern has been absorbed into the tools)
