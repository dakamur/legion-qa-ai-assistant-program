---
name: self-heal
description: >-
  Repairs drifted Playwright locators after a UI change — patch the POM,
  re-run unchanged assertions, open a PR. Use when the build is red because a
  locator broke, fix the drifted selector, the test broke after a UI change,
  or heal the suite. Use ONLY after triage classifies the red run as a test
  issue (drift/locator drift); NEVER for a real app bug — route those to
  bug-reporter instead.
---

# Self-Heal (Locator Drift Repair)

Fix **one** broken locator per run. Every heal ends in a PR. Assertions in
specs stay untouched — a green run achieved by weakening an assertion is a
failure; escalate instead.

## Prerequisites

**Require triage's drift classification.** Before any edit:

1. Confirm a completed triage diagnosis exists with classification
   **test issue** (locator drift / selector drift / stale POM).
2. If classification is **real app bug**, missing, or ambiguous → **stop**.
   Route to `jira-bug-reporter` via the `bug-reporter` agent. Do not heal.

Inputs: triage diagnosis (root cause, failing test, trace path, affected POM
file) + failed run id or URL.

## Steps

### 1. Extract the failing locator from the trace

From the Playwright error and trace (pulled during triage):

- Identify the **failing test** and **assertion line** (read-only — do not edit).
- Find which **POM property or method** supplied the locator.
- Record the **old locator** exactly as written (`getByRole`, `getByLabel`, etc.).

Cross-reference `pages/` per [pom-conventions](.agents/skills/pom-conventions/SKILL.md). The
patch target is always the POM, never the spec.

### 2. Re-discover the element (browser MCP a11y tree)

Use **cursor-ide-browser** against the live app (`DIDAXIS_URL` from `.env`):

1. `browser_navigate` to the page/state where the test failed (reuse
   `playwright/.auth/user.json` or sign in first).
2. `browser_snapshot` — source of truth. Find the control by **role** and
   **current accessible name**, not screenshot pixels.
3. If the element is hidden, interact only enough to reveal it (open modal,
   select row, scroll), then snapshot again.
4. Derive the **new locator** using the same hierarchy as the project:
   `getByRole` → `getByLabel` → `getByText` → `getByTestId`. Never CSS/XPath.

The new locator must match the **same semantic intent** as the old one (same
role; name updated to what the UI shows now).

### 3. Patch the POM (minimal diff)

Edit **only** the drifted locator in the POM file triage named:

- Keep role-based locators; change `name`, `exact`, or scoping (`dialog.getByRole`)
  as needed.
- Do **not** edit spec files, assertions, waits, or test logic.
- Do **not** broaden locators to "make it pass" (e.g. dropping `exact: true`,
  switching to CSS, or matching a less specific ancestor).

If multiple locators broke, fix **one** per run — pick the root cause triage
identified; leave the rest for a follow-up heal.

### 4. Re-run and prove green (assertions unchanged)

```bash
npx playwright test <failing-spec-or-project>
```

Verify:

- [ ] The previously failing test passes.
- [ ] **Zero** changes to `tests/**/*.spec.ts` (assertions identical).
- [ ] No assertion was weakened, removed, or replaced with a vaguer check.

If the run is still red:

- **Same locator error** → reconsider the a11y discovery; do not weaken assertions.
- **Different failure / app behavior wrong** → stop healing; re-triage. Likely
  real app bug → `bug-reporter`.
- **Green only after touching assertions** → **escalate**; revert assertion edits.

### 5. Open a PR (every heal)

One repair → one branch → one PR:

1. Branch name: `heal/<short-description>` (e.g. `heal/programs-new-program-button`).
2. Commit: POM change only.
3. PR body must include:
   - Failed run id / URL
   - Triage classification: test issue (drift)
   - **Locator diff** (old → new), with file path
   - Re-run command and result (green)
   - Explicit note: **assertions unchanged**

Do not merge — human approves.

## Report template

Post this summary (PR description or parent handoff):

```markdown
## Self-heal: locator drift

**Run:** <run id or URL>
**Classification:** test issue (drift) — triage complete
**Test:** `<spec>` — assertion unchanged
**POM:** `pages/...`

### Locator diff
| | Locator |
|---|---------|
| **Old** | `page.getByRole('button', { name: '+ New Program' })` |
| **New** | `page.getByRole('button', { name: 'New Program' })` |

### Verification
- `npx playwright test <command>` → **green**
- Spec files: **no changes**
```

## Rules

| Do | Don't |
|----|-------|
| Heal only after triage says **test issue (drift)** | Heal a real app bug |
| Patch POM locators only | Edit spec assertions or expectations |
| Re-discover via a11y snapshot (role + name) | Guess from screenshots or DOM dumps |
| One locator fix per run | Batch multiple unrelated heals |
| Open a PR for every heal | Merge without human approval |
| Escalate if green requires assertion changes | Weaken assertions to get green |

## Related skills

- [ci-failure-triage](.agents/skills/ci-failure-triage/SKILL.md) — must run first; supplies classification
- [pom-conventions](.agents/skills/pom-conventions/SKILL.md) — locator hierarchy and file layout
- [jira-bug-reporter](.agents/skills/jira-bug-reporter/SKILL.md) — when triage says real app bug
