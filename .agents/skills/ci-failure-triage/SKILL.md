---
name: ci-failure-triage
description: When a CI run is red, pull the run's logs and the
  playwright-report artifact via GitHub MCP or GH CLI, read the Playwright error
  and trace, cross-reference the spec, POM, and app source in the repo,
  classify real app bug vs test issue, and post a structured diagnosis
  to the PR. Use whenever a build fails — even if triage isn't asked for.
---

# CI Failure Triage

## Steps
1. Pull the failed run's logs + playwright-report artifact (GitHub MCP / gh CLI).
2. Read the Playwright error: failing test, expected vs received, trace path.
3. Cross-reference: the spec, the POM, and the Didaxis source in the repo.
4. Classify:
   - **real app bug** → route to `bug-reporter` / jira-bug-reporter
   - **test issue (drift)** — locator/selector drift, stale POM → route to `self-heal`
   - **test issue (other)** — timing, test data, missing POM → route to `test-writer`
5. Report: post root cause, affected file, expected/actual, suggested fix,
   classification (including drift vs other when test issue), and evidence
   (trace/screenshot + run id) as a PR comment. For drift, include failing
   spec, assertion line, affected POM file/property, and old locator.

## Rules
- Never merge a fix automatically — propose, a human approves.
- For a real defect, reuse the jira-bug-reporter skill and link the story.
- The diagnosis must name the source location and cause, not just the symptom.
