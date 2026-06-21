# AIOX and IDE artifact boundary

## Inventory and classification

| Path | Classification | Decision |
| --- | --- | --- |
| `.aiox-core/` | Required project artifact | Keep visible for intentional tracking. Ignore only generated/local subpaths such as `.aiox-core/node_modules/` and `.aiox-core/local/`. |
| `.codex/` | Required agent/skill sync artifact | Keep visible for intentional tracking. |
| `.agent/` | Required workflow artifact | Keep visible for intentional tracking; ignore `.agent/.DS_Store`. |
| `.github/agents/` | Required IDE/GitHub agent artifact | Keep visible for intentional tracking. |
| `.aiox/` | Local runtime/session artifact | Ignore volatile state files: `project-status.yaml`, `environment-report.yaml`, `handoffs/*.yaml`, and `install-log.txt`. |
| `.claude/` | IDE integration artifact | Keep visible for intentional tracking except `.claude/settings.local.json`. |
| `.antigravity/` | IDE integration artifact | Keep visible for intentional tracking until the team decides whether this IDE target is part of the repo contract. |
| `.cursor/` | IDE integration artifact | Keep visible for intentional tracking. |
| `.gemini/` | IDE integration artifact | Keep visible for intentional tracking. |
| `.kimi/` | IDE integration artifact | Keep visible for intentional tracking. |

## Boundary rules

- Do not delete generated agent directories as part of app feature work.
- Do not hide required AIOX framework files with broad ignores such as `.aiox-core/`.
- Ignore only local state, caches, dependency folders, secrets, and OS noise.
- App lint/test tooling should exclude agent framework folders; this is configured
  in `eslint.config.mjs` and `vitest.config.ts` so app gates do not scan external
  agent framework code.
- Remote operations remain owned by @devops under the project Constitution.

## Follow-up decision

The repository still needs a maintainer decision on which IDE target directories
should be committed as team-supported artifacts versus regenerated on demand by
`npm run sync:ide`. Until that decision is made, they remain visible in
`git status` rather than being broadly ignored.
