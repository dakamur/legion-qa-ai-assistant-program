## Test Plan: Program List Filtering and Display

### Scope
Validate the Programs page behavior for:
- Rendering program list entries with key details
- Empty state when no programs exist
- Basic robustness for data quality and display safety

### Assumptions
- Programs page route is `/programs`
- Program object fields displayed are `name` and `description`
- "Create first program" prompt is a visible CTA/button labeled `Create Program`

---

## Positive Flows

### TC-001
- **Title:** Programs page displays each program with `name` and `description`
- **Preconditions:**
  - At least 3 programs exist:
    - `name: "Onboarding 2026"`, `description: "Initial training for new hires"`
    - `name: "Leadership Track"`, `description: "Management development program"`
    - `name: "Compliance Basics"`, `description: "Annual compliance refresher"`
- **Steps:**
  1. Sign in as a user with access to Programs.
  2. Navigate to `/programs`.
  3. Observe the program list.
- **Expected Result:**
  - The list is visible.
  - Each listed program shows its `name` and `description`.
  - All three seeded programs are visible with correct text values.
- **Priority:** High

### TC-002
- **Title:** Programs page shows empty-state message and first-program prompt when no programs exist
- **Preconditions:**
  - System contains 0 programs.
- **Steps:**
  1. Sign in as a user with access to Programs.
  2. Navigate to `/programs`.
  3. Observe empty-state content.
- **Expected Result:**
  - Message indicating no programs exist is shown (e.g., "No programs have been created").
  - CTA/prompt to create the first program is visible (e.g., `Create Program`).
  - No program rows/cards are displayed.
- **Priority:** High

### TC-003
- **Title:** Program details remain readable and correctly mapped per row/card
- **Preconditions:**
  - Programs exist with distinct data:
    - `name: "Security Essentials"`, `description: "Security policy and awareness"`
    - `name: "Data Literacy"`, `description: "Intro to metrics and dashboards"`
- **Steps:**
  1. Navigate to `/programs`.
  2. Compare displayed `name` and `description` for each entry against seeded data.
- **Expected Result:**
  - `name` values are shown under program title area.
  - `description` values are shown under corresponding program name.
  - No cross-row mismatch (description from one program shown under another).
- **Priority:** Medium

---

## Negative Flows

### TC-004
- **Title:** Empty-state UI does not appear when at least one program exists
- **Preconditions:**
  - Exactly 1 program exists:
    - `name: "Onboarding 2026"`, `description: "Initial training for new hires"`
- **Steps:**
  1. Navigate to `/programs`.
  2. Check for empty-state message and first-program CTA.
- **Expected Result:**
  - Empty-state message is **not** shown.
  - "Create first program" prompt is **not** shown as empty-state content.
  - Program list displays the existing program.
- **Priority:** High

### TC-005
- **Title:** Program list does not show undefined/null raw values to end users
- **Preconditions:**
  - Data setup includes one malformed record:
    - `name: "Data Governance"`, `description: null`
- **Steps:**
  1. Navigate to `/programs`.
  2. Locate `Data Governance`.
- **Expected Result:**
  - UI does not display raw tokens such as `null`, `undefined`, or `[object Object]`.
  - Fallback behavior is applied consistently (blank description or controlled fallback text).
- **Priority:** Medium

### TC-006
- **Title:** Program list does not execute HTML/JS from `name` or `description`
- **Preconditions:**
  - Program exists:
    - `name: "<script>alert('x')</script> Security"`
    - `description: "<b>Bold text</b> and <img src=x onerror=alert(1)>"`
- **Steps:**
  1. Navigate to `/programs`.
  2. Observe rendering for malicious/special content.
  3. Monitor for script execution/popups.
- **Expected Result:**
  - No script executes.
  - Content is safely escaped/sanitized.
  - Page remains stable; no alert or injected behavior appears.
- **Priority:** High

### TC-007
- **Title:** Program list does not duplicate entries due to render/state issues
- **Preconditions:**
  - 2 programs exist with unique names:
    - `name: "Leadership Track"`
    - `name: "Compliance Basics"`
- **Steps:**
  1. Navigate to `/programs`.
  2. Refresh browser.
  3. Navigate away and back to `/programs`.
- **Expected Result:**
  - Each program appears exactly once per actual record.
  - No duplicate visual entries caused by repeated fetch/render.
- **Priority:** Medium

---

## Edge Cases

### TC-008
- **Title:** Program with empty-string description displays gracefully
- **Preconditions:**
  - Program exists:
    - `name: "New Program Draft"`
    - `description: ""` (empty string)
- **Steps:**
  1. Navigate to `/programs`.
  2. Locate `New Program Draft`.
- **Expected Result:**
  - Program appears in list.
  - Description area handles empty string without layout break.
  - No raw placeholder artifacts are shown unless explicitly designed.
- **Priority:** Medium

### TC-009
- **Title:** Program name and description support special characters and Unicode
- **Preconditions:**
  - Program exists:
    - `name: "R&D / QA - Cafe #1"`
    - `description: "Supports symbols: % & / ? + = and non-Latin: Nihongo, al-arabiyya"`
- **Steps:**
  1. Navigate to `/programs`.
  2. Verify display of special characters and Unicode text.
- **Expected Result:**
  - Characters render correctly without mojibake or truncation anomalies.
  - No encoding errors visible in UI.
- **Priority:** Medium

### TC-010
- **Title:** Programs with maximum-length `name` and `description` remain readable
- **Preconditions:**
  - Program exists with boundary-length text:
    - `name`: 255 characters (e.g., repeated "A" pattern ending with `-255`)
    - `description`: 2000 characters of mixed words and punctuation
- **Steps:**
  1. Navigate to `/programs`.
  2. Inspect row/card layout and text rendering.
- **Expected Result:**
  - Entry renders without page crash or severe overlap.
  - Long text is wrapped/truncated per design, preserving usability.
  - Other rows/cards are not visually corrupted.
- **Priority:** Medium

### TC-011
- **Title:** Duplicate program names are distinguishable via description
- **Preconditions:**
  - Two programs exist:
    - `name: "Onboarding 2026"`, `description: "North America cohort"`
    - `name: "Onboarding 2026"`, `description: "EMEA cohort"`
- **Steps:**
  1. Navigate to `/programs`.
  2. Locate both `Onboarding 2026` entries.
- **Expected Result:**
  - Both records are displayed.
  - Distinguishing descriptions are visible and correctly matched.
  - UI does not collapse them into one item.
- **Priority:** High

### TC-012
- **Title:** Whitespace-only values do not produce broken or misleading display
- **Preconditions:**
  - Program exists:
    - `name: "   "` (spaces only) or trimmed-to-empty after backend processing
    - `description: "   "`
- **Steps:**
  1. Navigate to `/programs`.
  2. Observe rendered output for whitespace-only fields.
- **Expected Result:**
  - UI handles invalid/blank-looking values gracefully.
  - No broken cards/rows or invisible clickable areas.
  - Fallback behavior follows product rules (to be defined).
- **Priority:** Low

### TC-013
- **Title:** Empty-state text persists consistently across refresh with zero programs
- **Preconditions:**
  - 0 programs in system.
- **Steps:**
  1. Navigate to `/programs`.
  2. Confirm empty-state message and `Create Program` CTA.
  3. Refresh browser.
- **Expected Result:**
  - Same empty-state message and CTA are displayed after refresh.
  - No transient stale list items appear.
- **Priority:** Medium

---

## Coverage Mapping to AC

- **AC: "Display program list with key details"** covered by `TC-001`, `TC-003`
- **AC: "Empty state when no programs exist"** covered by `TC-002`, `TC-013`

---

## Ambiguities / Gaps in ACs

- AC says "Program list filtering and display," but no filtering behavior is defined (no filter fields, criteria, sort order, search behavior, or reset behavior).
- Empty-state exact copy is unspecified ("no programs have been created" could vary); acceptance should define exact text or localization key.
- "Prompt to create the first program" is not precise on UI type (button/link/card), label, and expected navigation target.
- No explicit rules for null/empty/whitespace `name` or `description` display behavior.
- No display constraints for max lengths (truncate vs wrap vs tooltip) are defined.
- No requirement for ordering (alphabetical, created date, last updated) of programs in the list.
- No guidance on duplicate names (whether allowed and how to disambiguate).
- No error/loading states are defined (API failure, slow network, partial data).
