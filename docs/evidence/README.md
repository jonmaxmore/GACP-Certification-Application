# Evidence Repository Guidelines

Use this directory to store artifacts proving compliance for each backlog item (screenshots, exports, test results, sign-off notes).

## Structure

```
docs/
  evidence/
    COMPL-001/
      README.md          # Summary of evidence attached
      qr-flow.png        # Example artifact
      test-report.pdf
    COMPL-004/
      checklist.xlsx
      screenshots/
        farmer-dropdown.png
        admin-dashboard.png
```

## Rules

- Name subdirectories after the backlog ID (e.g., `COMPL-010/`).
- Include a `README.md` inside each folder describing:
  - What was validated
  - Date of validation
  - Data set/environment used
  - Link to related PR or ticket
- Use the template in `template/README.md` when creating new evidence folders.
- Avoid committing sensitive data (personal info, secrets); redact when necessary.
- Archive outdated evidence by moving to `archive/evidence_YYYY-MM-DD/` if replaced.

## Submission Checklist

Before marking a COMPL ticket as done:

- [ ] Evidence folder created with updated README.
- [ ] Screenshots or reports attached per checklist requirement.
- [ ] Execution summary/backlog references the evidence path.
- [ ] Stakeholder approval, if required, documented in the folder.
