# Test Plan: Delete Program with Confirmation

## Scope
This test plan validates the "Delete program with confirmation" feature, including the confirmation dialog flow, successful deletion, and cancellation of deletion.

## Positive Flows

### TC-001
- **ID:** TC-001
- **Title:** Clicking delete icon displays confirmation dialog
- **Preconditions:**  
  - Admin user is logged in  
  - User is on the Programs page  
  - Program "Test Program" exists
- **Steps:**  
  1. Click the delete icon (🗑) for "Test Program".
- **Expected Result:**  
  - A confirmation dialog is displayed.  
  - The dialog clearly identifies which program will be deleted.
- **Priority:** High

### TC-002
- **ID:** TC-002
- **Title:** Confirming deletion removes program from the list
- **Preconditions:**  
  - Admin user is logged in  
  - Confirmation dialog is displayed for "Test Program"
- **Steps:**  
  1. Click the confirm/delete button in the confirmation dialog.
- **Expected Result:**  
  - The confirmation dialog closes.  
  - "Test Program" is removed from the programs list.  
  - The program no longer appears anywhere in the list.
- **Priority:** High

### TC-003
- **ID:** TC-003
- **Title:** Full delete flow — from icon click through confirmation to removal
- **Preconditions:**  
  - Admin user is logged in  
  - User is on the Programs page  
  - Program "Test Program" exists
- **Steps:**  
  1. Click the delete icon (🗑) for "Test Program".  
  2. Verify confirmation dialog appears.  
  3. Confirm deletion.  
  4. Observe the programs list.
- **Expected Result:**  
  - Confirmation dialog is shown.  
  - After confirmation, dialog closes.  
  - "Test Program" is no longer in the list.
- **Priority:** High

### TC-004
- **ID:** TC-004
- **Title:** Cancelling deletion preserves the program in the list
- **Preconditions:**  
  - Admin user is logged in  
  - Confirmation dialog is displayed for a program
- **Steps:**  
  1. Click `Cancel` in the confirmation dialog.
- **Expected Result:**  
  - The confirmation dialog closes.  
  - The program still exists in the programs list.  
  - Program data is unchanged.
- **Priority:** High

### TC-005
- **ID:** TC-005
- **Title:** Deleted program count is updated in the list
- **Preconditions:**  
  - Admin user is logged in  
  - Multiple programs exist in the list
- **Steps:**  
  1. Note the number of programs in the list.  
  2. Delete one program via the full confirmation flow.  
  3. Count the programs in the list.
- **Expected Result:**  
  - The program count decreases by one.  
  - All other programs remain intact and in the same order.
- **Priority:** Medium

## Negative Flows

### TC-006
- **ID:** TC-006
- **Title:** Closing the confirmation dialog (X button) preserves the program
- **Preconditions:**  
  - Admin user is logged in  
  - Confirmation dialog is displayed for a program
- **Steps:**  
  1. Close the confirmation dialog via the X button (if present) or by pressing Escape.
- **Expected Result:**  
  - The confirmation dialog closes.  
  - The program still exists in the programs list.
- **Priority:** Medium

### TC-007
- **ID:** TC-007
- **Title:** Unauthorized users cannot delete programs
- **Preconditions:**  
  - User is logged in as non-admin
- **Steps:**  
  1. Navigate to Programs page.  
  2. Check for the delete icon (🗑) on any program.  
  3. Attempt direct API access to the delete action (if applicable).
- **Expected Result:**  
  - Delete icon is hidden or disabled for non-admin users.  
  - Direct access is denied (redirect/403).  
  - No program can be deleted.
- **Priority:** Medium

### TC-008
- **ID:** TC-008
- **Title:** Clicking Cancel and then re-opening delete confirmation works correctly
- **Preconditions:**  
  - Admin user is logged in  
  - A program exists in the list
- **Steps:**  
  1. Click the delete icon for the program.  
  2. Click `Cancel` in the confirmation dialog.  
  3. Click the delete icon for the same program again.  
  4. Confirm deletion.
- **Expected Result:**  
  - First cancellation preserves the program.  
  - Second attempt shows the confirmation dialog again.  
  - After confirmation, the program is removed.
- **Priority:** Medium

## Edge Cases

### TC-009
- **ID:** TC-009
- **Title:** Double-clicking the delete icon does not bypass confirmation
- **Preconditions:**  
  - Admin user is logged in  
  - A program exists in the list
- **Steps:**  
  1. Double-click the delete icon (🗑) for a program quickly.
- **Expected Result:**  
  - Confirmation dialog is shown (only one instance).  
  - The program is not deleted without explicit confirmation.  
  - No errors occur from the double-click.
- **Priority:** High

### TC-010
- **ID:** TC-010
- **Title:** Deleting the last remaining program shows empty state
- **Preconditions:**  
  - Admin user is logged in  
  - Only one program exists in the list
- **Steps:**  
  1. Click the delete icon for the only program.  
  2. Confirm deletion.
- **Expected Result:**  
  - The program is removed.  
  - The list displays an empty state message or prompt to create a new program.
- **Priority:** Medium

### TC-011
- **ID:** TC-011
- **Title:** Deleting a program with a long name displays correctly in the confirmation dialog
- **Preconditions:**  
  - Admin user is logged in  
  - A program with a very long name (200+ characters) exists
- **Steps:**  
  1. Click the delete icon for the long-named program.
- **Expected Result:**  
  - The confirmation dialog displays the program name without UI overflow or truncation issues.  
  - The dialog is fully functional.
- **Priority:** Low

### TC-012
- **ID:** TC-012
- **Title:** Deleting a program with special characters in the name works correctly
- **Preconditions:**  
  - Admin user is logged in  
  - A program with special characters in the name exists (e.g., `Web Dev & AI / 2026 - Cohort #1`)
- **Steps:**  
  1. Click the delete icon for the special-character program.  
  2. Confirm deletion.
- **Expected Result:**  
  - Confirmation dialog displays the name correctly without encoding issues.  
  - The program is deleted successfully.
- **Priority:** Medium

### TC-013
- **ID:** TC-013
- **Title:** Double-clicking confirm does not cause errors or duplicate deletion attempts
- **Preconditions:**  
  - Admin user is logged in  
  - Confirmation dialog is displayed for a program
- **Steps:**  
  1. Double-click the confirm/delete button quickly.
- **Expected Result:**  
  - The program is deleted exactly once.  
  - No error is thrown from a duplicate deletion attempt.  
  - UI remains stable.
- **Priority:** High

### TC-014
- **ID:** TC-014
- **Title:** Programs list refreshes correctly after multiple sequential deletions
- **Preconditions:**  
  - Admin user is logged in  
  - At least three programs exist
- **Steps:**  
  1. Delete the first program via the full confirmation flow.  
  2. Delete the second program via the full confirmation flow.  
  3. Observe the list after each deletion.
- **Expected Result:**  
  - Each deletion removes exactly one program.  
  - The remaining programs display correctly after each deletion.  
  - No stale entries remain.
- **Priority:** Medium

## Traceability to Acceptance Criteria
- **AC: Delete program with confirmation** -> Covered by `TC-001`, `TC-002`, `TC-003`
- **AC: Cancel program deletion** -> Covered by `TC-004`, `TC-006`

## Ambiguities / Gaps in Acceptance Criteria
- The exact text/content of the confirmation dialog is not specified.
- Whether the confirmation dialog identifies the program by name is not stated.
- Whether closing the dialog via X button or Escape key behaves the same as Cancel is not defined.
- What happens to related data (courses, schedules) when a program is deleted is not specified (cascade vs. block).
- Authorization behavior for non-admin users is implied but not explicitly accepted criteria.
- Whether a deleted program can be recovered (undo/soft delete) is not defined.
- Behavior on network error during deletion is not defined.
- Whether double-clicking delete or confirm could bypass the confirmation flow is not addressed.
- The empty state behavior after deleting the last program is not specified.
