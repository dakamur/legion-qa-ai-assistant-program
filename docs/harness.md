# QA Harness Architecture

How the QA orchestrator drives a task to done by delegating to specialist sub-agents,
including the skills, tools, and guardrails wired around each.

![QA harness architecture](harness.png)

```mermaid
flowchart TB
    TRIG["ENTRY POINTS<br/>Ticket key (DS-3) - Failed run id / red build<br/>Backlog trigger - Ticket-less coverage request"]

    ORCH["<b>QA ORCHESTRATOR</b><br/>(.cursor/rules/qa-orchestrator.mdc)<br/>Reads Jira + CI - runs suite - delegates<br/>Only does it itself: analyze + test plan<br/><br/>skills: jira-ticket-analyzer - explore-and-generate<br/>tools: Atlassian MCP - GitHub MCP / gh"]

    PLAN["TEST PLAN<br/>features/{ticket}.feature.md"]

    TW["<b>test-writer</b> (sub-agent)<br/>plan -> spec under tests/<br/>skills: pom-conventions - api-cleanup"]

    RUN{"npx playwright test"}

    DONE(["DONE - spec committed / green"])

    TR["<b>triage</b> (sub-agent)<br/>diagnose red run + classify<br/>skill: ci-failure-triage - read-only<br/>tools: GitHub MCP / gh"]

    SH["<b>self-heal</b> (sub-agent)<br/>POM-only locator repair<br/>skills: self-heal - pom-conventions<br/>tool: Playwright MCP (a11y)"]

    BR["<b>bug-reporter</b> (sub-agent)<br/>file + link Jira bug<br/>skill: jira-bug-reporter<br/>tool: Atlassian MCP"]

    ESC(["STOP + escalate"])
    PR1(["Repair PR heal/* - human merges"])
    BUG(["Jira bug filed + linked"])

    GUARD["GUARDRAILS (enforced)<br/>afterFileEdit hook blocks weakened assertions in tests/**<br/>budgets: <=3 delegations - <=5 heals/run - <=2 identical fails<br/>human approves every merge + bug"]

    TRIG --> ORCH
    ORCH --> PLAN
    PLAN --> TW
    TW --> RUN
    ORCH --> RUN

    RUN -->|green| DONE
    RUN -->|red| TR

    TR -->|"test issue (drift)"| SH
    TR -->|"test issue (other)"| TW
    TR -->|"real app bug"| BR
    TR -->|"cannot classify"| ESC

    SH --> PR1
    BR --> BUG

    PR1 -.-> GUARD
    BUG -.-> GUARD
    SH -.governed by.-> GUARD
    ORCH -.enforces.-> GUARD

    classDef orch fill:#dbe9ff,stroke:#3b6fb0,stroke-width:2px;
    classDef agent fill:#eafaf1,stroke:#2e9e6b,stroke-width:1.5px;
    classDef term fill:#fff4e6,stroke:#d9822b,stroke-width:1.5px;
    classDef guard fill:#fdecea,stroke:#c0392b,stroke-width:1.5px;

    class ORCH orch;
    class TW,TR,SH,BR agent;
    class DONE,ESC,PR1,BUG term;
    class GUARD guard;
```

## How it reads

- **Orchestrator** is the only coordinator — it reads the ticket/CI, produces the plan,
  runs the suite, and **delegates everything else**. It writes no test code and files no
  bugs itself.
- **Four sub-agents**, each single-purpose:
  - `test-writer` — plan → spec (POM + cleanup skills, `tests/` only)
  - `triage` — read-only diagnosis + classification of red runs
  - `self-heal` — POM-only locator repair after a **drift** classification → repair PR
  - `bug-reporter` — files a Jira bug only on a confirmed **real app bug**
- **Routing on red** is triage-first, then branch by classification (drift → self-heal,
  real bug → bug-reporter, other → test-writer).
- **Guardrails** wrap the loop: the `afterFileEdit` hook hard-blocks weakened assertions,
  budgets cap delegations/heals, and humans gate every merge and bug.
