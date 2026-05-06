## Test Plan: Edit Existing Program Details

### Scope
Validate editing an existing program from the Programs page, including pre-populated edit form behavior, successful updates, and preservation of unchanged data.

### Assumptions for this plan
- Editable fields are `Name` and `Description` (as stated in the ACs).
- Existing record: `Name = Web Development 2026`, `Description = Full-stack web development program`.
- Save action button is `Save` in the edit modal/form.

---

## Positive Flows

### TC-001
- **ID:** TC-001
- **Title:** Edit form opens with current program data pre-populated
- **Preconditions:**  
  - User is on the `Programs` page  
  - Program `Web Development 2026` exists with description `Full-stack web development program`
- **Steps:**  
  1. Locate row `Web Development 2026`.  
  2. Click the edit icon for that row.
- **Expected result:**  
  - Edit modal/form opens.  
  - `Name` shows `Web Development 2026`.  
  - `Description` shows `Full-stack web development program`.
- **Priority:** High

### TC-002
- **ID:** TC-002
- **Title:** Program name update is saved and reflected immediately in list
- **Preconditions:**  
  - Edit modal for `Web Development 2026` is open
- **Steps:**  
  1. In `Name`, replace value with `Web Development 2026 - Updated`.  
  2. Leave `Description` unchanged.  
  3. Click `Save`.
- **Expected result:**  
  - Modal closes after successful save.  
  - Programs list immediately shows `Web Development 2026 - Updated`.  
  - Old name `Web Development 2026` is no longer shown for that record.
- **Priority:** High

### TC-003
- **ID:** TC-003
- **Title:** Editing only description preserves unchanged name and other fields
- **Preconditions:**  
  - Program exists with `Name = Web Development 2026`, `Description = Full-stack web development program`  
  - Edit modal is open for this program
- **Steps:**  
  1. Keep `Name` unchanged as `Web Development 2026`.  
  2. Update `Description` to `Updated curriculum with AI-assisted testing modules`.  
  3. Click `Save`.  
  4. Re-open edit form for the same program.
- **Expected result:**  
  - Save succeeds and modal closes.  
  - `Name` remains `Web Development 2026`.  
  - `Description` is updated to new text.  
  - Any non-edited fields remain unchanged.
- **Priority:** High

### TC-004
- **ID:** TC-004
- **Title:** Trimmed valid name is saved correctly
- **Preconditions:**  
  - Edit modal is open for `Web Development 2026`
- **Steps:**  
  1. Set `Name` to `  Web Development 2026 - Updated  ` (leading/trailing spaces).  
  2. Click `Save`.
- **Expected result:**  
  - Save succeeds.  
  - Displayed name is normalized (trimmed) to `Web Development 2026 - Updated` if trimming is implemented.
- **Priority:** Medium

---

## Negative Flows

### TC-005
- **ID:** TC-005
- **Title:** Save is blocked when name is empty
- **Preconditions:**  
  - Edit modal is open for an existing program
- **Steps:**  
  1. Clear the `Name` field so it is empty.  
  2. Click `Save` (or observe button state).
- **Expected result:**  
  - Save is blocked (`Save` disabled or validation error shown).  
  - Modal does not close.  
  - Program list remains unchanged.
- **Priority:** High

### TC-006
- **ID:** TC-006
- **Title:** Whitespace-only name is rejected
- **Preconditions:**  
  - Edit modal is open for an existing program
- **Steps:**  
  1. Set `Name` to `   `.  
  2. Click `Save`.
- **Expected result:**  
  - Validation rejects input as invalid/empty.  
  - No update is saved.  
  - Existing program name remains unchanged.
- **Priority:** High

### TC-007
- **ID:** TC-007
- **Title:** Duplicate program name update is prevented per uniqueness rules
- **Preconditions:**  
  - Program `Web Development 2026` exists  
  - Separate program `Data Science 2026` also exists  
  - Edit modal is open for `Web Development 2026`
- **Steps:**  
  1. Change `Name` to `Data Science 2026`.  
  2. Click `Save`.
- **Expected result:**  
  - Duplicate name is rejected if uniqueness is required.  
  - Clear error message is shown.  
  - Original program remains unchanged.
- **Priority:** High

### TC-008
- **ID:** TC-008
- **Title:** Failed save does not close modal or show stale success state
- **Preconditions:**  
  - Edit modal is open for an existing program  
  - Backend/API save failure can be simulated (e.g., 500 or network failure)
- **Steps:**  
  1. Change `Description` to `Failure handling test`.  
  2. Click `Save` while API failure is simulated.
- **Expected result:**  
  - Modal remains open (or returns to editable state).  
  - User sees error feedback.  
  - Program list does not show unsaved changes.
- **Priority:** High

### TC-009
- **ID:** TC-009
- **Title:** Double-clicking Save does not create duplicate updates or inconsistent state
- **Preconditions:**  
  - Edit modal is open for an existing program
- **Steps:**  
  1. Change `Name` to `Web Development 2026 - Updated`.  
  2. Double-click `Save` quickly.
- **Expected result:**  
  - Only one successful update is applied.  
  - No duplicate UI refresh artifacts or repeated toasts/errors.
- **Priority:** Medium

---

## Edge Cases

### TC-010
- **ID:** TC-010
- **Title:** Name supports minimum valid boundary length
- **Preconditions:**  
  - Edit modal is open
- **Steps:**  
  1. Set `Name` to `A` (minimum plausible non-empty value).  
  2. Click `Save`.
- **Expected result:**  
  - Save behavior aligns with configured minimum length rule.  
  - If allowed, list shows `A`; if not, validation message appears and save is blocked.
- **Priority:** Medium

### TC-011
- **ID:** TC-011
- **Title:** Name accepts value at maximum allowed length
- **Preconditions:**  
  - Edit modal is open  
  - Known maximum length for `Name` (example: 255 chars)
- **Steps:**  
  1. Enter a `Name` exactly at max length.  
  2. Click `Save`.
- **Expected result:**  
  - Value at max boundary is accepted and persisted without truncation issues.
- **Priority:** High

### TC-012
- **ID:** TC-012
- **Title:** Name exceeding maximum length is rejected
- **Preconditions:**  
  - Edit modal is open  
  - Known maximum length for `Name` (example: 255 chars)
- **Steps:**  
  1. Enter a `Name` one character above max length.  
  2. Click `Save`.
- **Expected result:**  
  - Validation blocks save or prevents extra input.  
  - Existing saved value remains unchanged.
- **Priority:** High

### TC-013
- **ID:** TC-013
- **Title:** Special characters in name are stored and displayed correctly
- **Preconditions:**  
  - Edit modal is open
- **Steps:**  
  1. Set `Name` to `Web Dev & AI / 2026 - Cohort #1`.  
  2. Click `Save`.
- **Expected result:**  
  - Save succeeds if characters are allowed.  
  - List displays exact characters without encoding corruption.
- **Priority:** Medium

### TC-014
- **ID:** TC-014
- **Title:** Script-like input is treated as plain text and not executed
- **Preconditions:**  
  - Edit modal is open
- **Steps:**  
  1. Set `Description` to `<script>alert('x')</script>`.  
  2. Click `Save`.  
  3. View program in list and reopen edit modal.
- **Expected result:**  
  - No script execution occurs anywhere in UI.  
  - Input is safely escaped/sanitized or rejected with validation.
- **Priority:** High

### TC-015
- **ID:** TC-015
- **Title:** Empty description behavior follows business rules while preserving other fields
- **Preconditions:**  
  - Edit modal is open for a program with non-empty description
- **Steps:**  
  1. Clear `Description`.  
  2. Keep `Name` unchanged.  
  3. Click `Save`.
- **Expected result:**  
  - If `Description` is optional: save succeeds and name remains unchanged.  
  - If required: save blocked with validation; no fields are altered.
- **Priority:** Medium

### TC-016
- **ID:** TC-016
- **Title:** Description maximum-length boundary is enforced on edit
- **Preconditions:**  
  - Edit modal is open  
  - Known max length for `Description` (example: 1000 chars)
- **Steps:**  
  1. Enter description exactly at max length; click `Save`.  
  2. Enter description exceeding max length by 1; click `Save`.
- **Expected result:**  
  - Max-length value is accepted and saved.  
  - Over-limit value is blocked or rejected with validation feedback.
- **Priority:** Medium

---

## AC Coverage Matrix

- **Open program for editing** -> `TC-001`
- **Successfully edit a program name** -> `TC-002`
- **Edit preserves unchanged fields** -> `TC-003`
- Additional robustness/quality coverage -> `TC-004` to `TC-016`

---

## Ambiguities / Gaps in the ACs

- Exact editable field labels are inconsistent (`Name` in AC vs possible `Program Name` usage elsewhere).
- Validation rules are missing: min/max length for `Name` and `Description`.
- Duplicate-name policy is unspecified (allowed or blocked, case-sensitive or case-insensitive).
- Character rules are unspecified (allowed punctuation, Unicode, emojis).
- `Description` required vs optional is not defined.
- No explicit expected error message behavior (text, placement, timing).
- No requirement for save failure behavior (network/server errors, retry UX).
- No definition of immediate list update mechanism (optimistic update vs refetch timing).
- No access-control requirements for who can edit programs.
