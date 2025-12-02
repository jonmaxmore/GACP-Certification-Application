# Repository Maintenance Checklist

This guide outlines the safe way to remove build artefacts and archive outdated markdown notes without risking core documentation.

## Build Output Cleanup

Use the provided scripts to remove transient build directories. They default to dry-run mode so you can review the impact first.

```powershell
# Windows PowerShell
pnpm exec node -v  # optional sanity check
./scripts/cleanup-build-artifacts.ps1
# After review
./scripts/cleanup-build-artifacts.ps1 -Execute
```

```bash
# macOS / Linux
bash scripts/cleanup-build-artifacts.sh
# After review
bash scripts/cleanup-build-artifacts.sh --execute
```

You can pass extra directories to the scripts when needed:

```powershell
./scripts/cleanup-build-artifacts.ps1 -Execute -AdditionalDirs 'apps/farmer-portal/.storybook'
```

```bash
bash scripts/cleanup-build-artifacts.sh --dir apps/backend/.turbo --execute
```

## Archiving Legacy Markdown

Run the archival helper to preview markdown candidates (files that start with `draft`, `test`, `note`, or end with `_old.md`). The helper only scans up to three levels deep from the repository root by default.

```bash
node scripts/archive-markdown.js
node scripts/archive-markdown.js --pattern 'minutes'  # optional additional regex filter
```

When you are satisfied with the list, move the files into `archive/_holding`.

```bash
node scripts/archive-markdown.js --execute
```

The script asks for confirmation before moving anything and preserves relative folder structure inside `_holding`.

## Operational Tips

- Always run the scripts from the repository root.
- Use version control to review the diff before committing deletions or moves.
- Keep `docs/` and other system documentation directories under version control; do not delete or relocate them wholesale without stakeholder approval.
- If you need a more aggressive cleanup, start from these scripts and whitelist critical paths explicitly.
