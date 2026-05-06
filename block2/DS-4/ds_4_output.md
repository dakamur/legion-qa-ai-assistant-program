# Delete Program With Confirmation - Test Plan

## Scope
Validates deleting programs from the program list using the delete icon and confirmation dialog, including confirm and cancel behavior, plus robustness around naming edge cases, duplicates, and failure conditions.

## Assumptions
- Program list displays a `Program Name` column and a delete icon per row.
- Confirmation dialog includes `Delete` (confirm) and `Cancel` actions.
- Deletion is persisted after successful confirmation.
- Existing program examples used below: `Test Program`, `QA Regression Program`, etc.

## Positive Flows

### TC-001
- **ID:** TC-001
- **Title:** Program is removed from the list after deletion is confirmed
- **Preconditions:**
  - Program `Test Program` exists in the program list.
- **Steps:**
  1. Open the Programs list page.
  2. Locate row with `Program Name = Test Program`.
  3. Click the delete icon in that row.
  4. In confirmation dialog, click `Delete`.
- **Expected result:**
  - Confirmation dialog appears after step 3.
  - After step 4, `Test Program` no longer appears in the list.
- **Priority:** High

### TC-002
- **ID:** TC-002
- **Title:** Program remains in the list when deletion is canceled
- **Preconditions:**
  - Program `QA Regression Program` exists in the program list.
- **Steps:**
  1. Open the Programs list page.
  2. Click delete icon for `QA Regression Program`.
  3. In confirmation dialog, click `Cancel`.
- **Expected result:**
  - Confirmation dialog closes.
  - `QA Regression Program` remains visible in the list unchanged.
- **Priority:** High

### TC-003
- **ID:** TC-003
- **Title:** Correct program context is shown before user confirms deletion
- **Preconditions:**
  - Programs `Test Program` and `Automation Pilot` both exist.
- **Steps:**
  1. Click delete icon for `Automation Pilot`.
  2. Observe confirmation dialog text/context.
- **Expected result:**
  - Dialog clearly indicates deletion applies to `Automation Pilot` (not another program).
- **Priority:** Medium

## Negative Flows

### TC-004
- **ID:** TC-004
- **Title:** No program is deleted before explicit confirmation
- **Preconditions:**
  - Program `Test Program` exists.
- **Steps:**
  1. Click delete icon for `Test Program`.
  2. Do not click `Delete`; keep dialog open for several seconds.
  3. Verify list behind dialog (or after closing with `Cancel`).
- **Expected result:**
  - `Test Program` is not removed unless `Delete` is clicked.
- **Priority:** High

### TC-005
- **ID:** TC-005
- **Title:** Dismissal via dialog close control does not delete program
- **Preconditions:**
  - Program `Release Readiness` exists.
- **Steps:**
  1. Click delete icon for `Release Readiness`.
  2. Close dialog using `X` (or outside-click/Esc if supported).
- **Expected result:**
  - Dialog closes with no deletion.
  - `Release Readiness` remains in list.
- **Priority:** Medium

### TC-006
- **ID:** TC-006
- **Title:** Deletion failure does not remove program from list
- **Preconditions:**
  - Program `Backend Validation` exists.
  - Network/API failure can be simulated (e.g., server returns 500).
- **Steps:**
  1. Click delete icon for `Backend Validation`.
  2. Click `Delete`.
  3. Force delete API call to fail.
- **Expected result:**
  - Error feedback is shown to user.
  - `Backend Validation` remains in the list.
  - No silent removal occurs.
- **Priority:** High

### TC-007
- **ID:** TC-007
- **Title:** Multiple rapid clicks on Delete do not cause duplicate or unstable behavior
- **Preconditions:**
  - Program `Load Test Program` exists.
- **Steps:**
  1. Click delete icon for `Load Test Program`.
  2. Rapidly click `Delete` multiple times.
- **Expected result:**
  - One delete request is processed (button disabled or idempotent behavior).
  - Program is removed once; no errors, no UI corruption.
- **Priority:** Medium

## Edge Cases

### TC-008
- **ID:** TC-008
- **Title:** Program with maximum allowed name length can be deleted successfully
- **Preconditions:**
  - Program exists with `Program Name` at max length (e.g., 255 chars).
- **Steps:**
  1. Locate max-length program in list.
  2. Click its delete icon.
  3. Confirm with `Delete`.
- **Expected result:**
  - Dialog renders correctly (no truncation-related mis-targeting).
  - Correct program is deleted from list.
- **Priority:** Medium

### TC-009
- **ID:** TC-009
- **Title:** Program with special characters in name can be deleted correctly
- **Preconditions:**
  - Program `Test_Program-01 (QA) & UAT / v2` exists.
- **Steps:**
  1. Click delete icon for `Test_Program-01 (QA) & UAT / v2`.
  2. Confirm deletion.
- **Expected result:**
  - Program with special characters is targeted and removed correctly.
  - No encoding/display issues in confirmation dialog.
- **Priority:** Medium

### TC-010
- **ID:** TC-010
- **Title:** Only selected row is deleted when duplicate program names exist
- **Preconditions:**
  - Two rows exist with identical `Program Name = Test Program` (different IDs/created dates).
- **Steps:**
  1. Identify both duplicate rows (Row A and Row B).
  2. Click delete icon for Row A.
  3. Confirm deletion.
- **Expected result:**
  - Only Row A is removed.
  - Row B remains in list.
- **Priority:** High

### TC-011
- **ID:** TC-011
- **Title:** Deletion works for first and last visible rows in the list
- **Preconditions:**
  - Program list has at least 3 rows.
- **Steps:**
  1. Delete the first row program and confirm.
  2. Delete the last row program and confirm.
- **Expected result:**
  - Both targeted programs are removed correctly.
  - No row-index shifting bug causes wrong deletions.
- **Priority:** Medium

### TC-012
- **ID:** TC-012
- **Title:** Deletion from paginated list removes correct program and updates pagination state
- **Preconditions:**
  - Pagination enabled; target program `Paged Program 25` is on page 2.
- **Steps:**
  1. Navigate to page 2.
  2. Delete `Paged Program 25` and confirm.
  3. Refresh page or return to page 2.
- **Expected result:**
  - `Paged Program 25` is absent after delete and after refresh.
  - Pagination count/page state updates correctly.
- **Priority:** Medium

### TC-013
- **ID:** TC-013
- **Title:** Attempting to delete an already-deleted program does not break UI
- **Preconditions:**
  - Program `Transient Program` exists and is deleted in another session/user.
- **Steps:**
  1. In current session, open delete dialog for `Transient Program` (stale data).
  2. Click `Delete`.
- **Expected result:**
  - Graceful handling (e.g., "program not found" message or list refresh).
  - No crash; list ends in consistent state with program absent.
- **Priority:** Low

### TC-014
- **ID:** TC-014
- **Title:** Empty-state behavior is correct after deleting the last remaining program
- **Preconditions:**
  - Only one program exists: `Final Program`.
- **Steps:**
  1. Delete `Final Program` and confirm.
- **Expected result:**
  - List shows valid empty state (e.g., "No programs found").
  - No stale row or broken controls displayed.
- **Priority:** Medium

## Acceptance Criteria Coverage Map
- **AC: "Delete program with confirmation"** -> Covered by `TC-001` (primary), plus `TC-003`, `TC-011`.
- **AC: "Cancel program deletion"** -> Covered by `TC-002` (primary), plus `TC-005`.

## Ambiguities / Gaps in the ACs
- Confirmation dialog content is not specified (title/body/button labels, whether program name must appear).
- Dismissal behavior is undefined for `X`, `Esc`, and outside-click.
- No requirement for success/error toast/messages after delete action.
- No guidance on API failure handling (retry, error text, list refresh behavior).
- Duplicate name behavior is not defined (delete by row vs by name).
- No explicit data constraints for `Program Name` (max length, allowed special characters), though these impact correctness.
- No statement about pagination/sorting/filter interactions during deletion.
- No concurrency expectation (what happens if another user deletes the same program first).
- No requirement for accessibility/keyboard behavior (focus trap in dialog, Enter/Esc handling).
- No performance expectation (time to remove row, loader/spinner behavior).
