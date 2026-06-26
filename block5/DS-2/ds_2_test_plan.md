# Test Plan: Edit Existing Program Details

## Scope
This test plan validates the "Edit existing program details" feature, including opening the edit form with pre-populated data, successfully saving changes, and verifying that unchanged fields are preserved.

## Positive Flows

### TC-001
- **ID:** TC-001
- **Title:** Edit form opens pre-populated with current program data
- **Preconditions:**  
  - Admin user is logged in  
  - User is on the Programs page  
  - Program "Web Development 2026" exists
- **Steps:**  
  1. Click the edit icon on "Web Development 2026".
- **Expected Result:**  
  - Edit form/modal is displayed.  
  - `Program Name` field is pre-populated with "Web Development 2026".  
  - `Description` field is pre-populated with the program's current description.
- **Priority:** High

### TC-002
- **ID:** TC-002
- **Title:** Program name is updated successfully
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for "Web Development 2026"
- **Steps:**  
  1. Clear the `Program Name` field.  
  2. Enter `Web Development 2026 - Updated` in `Program Name`.  
  3. Click `Save`.
- **Expected Result:**  
  - Edit modal closes.  
  - Programs list immediately shows "Web Development 2026 - Updated".  
  - The old name "Web Development 2026" no longer appears.
- **Priority:** High

### TC-003
- **ID:** TC-003
- **Title:** Program description is updated successfully
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for an existing program
- **Steps:**  
  1. Clear the `Description` field.  
  2. Enter `Updated description for testing` in `Description`.  
  3. Click `Save`.
- **Expected Result:**  
  - Edit modal closes.  
  - The program's description is updated to "Updated description for testing".  
  - The `Program Name` remains unchanged.
- **Priority:** High

### TC-004
- **ID:** TC-004
- **Title:** Editing only Description preserves the Name and other fields
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for a program with known Name and Description
- **Steps:**  
  1. Note the current `Program Name` value.  
  2. Change only the `Description` to `Preservation test description`.  
  3. Click `Save`.  
  4. Re-open the edit form for the same program.
- **Expected Result:**  
  - `Program Name` is identical to the value noted in step 1.  
  - `Description` reflects the new value from step 2.  
  - No other fields are altered.
- **Priority:** High

### TC-005
- **ID:** TC-005
- **Title:** Editing only Name preserves the Description and other fields
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for a program with known Name and Description
- **Steps:**  
  1. Note the current `Description` value.  
  2. Change only the `Program Name` to `Preservation Test Program`.  
  3. Click `Save`.  
  4. Re-open the edit form for the same program.
- **Expected Result:**  
  - `Description` is identical to the value noted in step 1.  
  - `Program Name` reflects the new value from step 2.
- **Priority:** High

## Negative Flows

### TC-006
- **ID:** TC-006
- **Title:** Save is blocked when Program Name is cleared to empty
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for an existing program
- **Steps:**  
  1. Clear the `Program Name` field entirely.  
  2. Observe the `Save` button state.
- **Expected Result:**  
  - `Save` button is disabled or submission is rejected with validation feedback.  
  - Program is not updated with an empty name.
- **Priority:** High

### TC-007
- **ID:** TC-007
- **Title:** Whitespace-only Program Name is treated as empty and cannot be saved
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for an existing program
- **Steps:**  
  1. Clear the `Program Name` field.  
  2. Enter three spaces (`   `) in `Program Name`.  
  3. Observe the `Save` button state.  
  4. Attempt to click `Save` (if enabled).
- **Expected Result:**  
  - `Program Name` is treated as invalid/empty after trim.  
  - `Save` remains disabled or submission is rejected with validation feedback.  
  - Program name is not overwritten with whitespace.
- **Priority:** High

### TC-008
- **ID:** TC-008
- **Title:** Editing to a duplicate Program Name is rejected
- **Preconditions:**  
  - Admin user is logged in  
  - Two programs exist: "Program A" and "Program B"  
  - Edit form/modal is open for "Program B"
- **Steps:**  
  1. Clear the `Program Name` field.  
  2. Enter `Program A` in `Program Name`.  
  3. Click `Save`.
- **Expected Result:**  
  - Duplicate name is blocked (or explicitly handled per business rule).  
  - User sees clear error messaging if duplicates are not allowed.  
  - "Program A" is not overwritten or corrupted.
- **Priority:** High

### TC-009
- **ID:** TC-009
- **Title:** Cancelling the edit form discards all changes
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for an existing program
- **Steps:**  
  1. Change `Program Name` to `Should Not Save`.  
  2. Change `Description` to `Discarded description`.  
  3. Click `Cancel` (or close the modal via X button).  
  4. Verify the program in the list.
- **Expected Result:**  
  - Modal closes without saving.  
  - Program retains its original Name and Description.
- **Priority:** High

### TC-010
- **ID:** TC-010
- **Title:** Unauthorized users cannot edit programs
- **Preconditions:**  
  - User is logged in as non-admin
- **Steps:**  
  1. Navigate to Programs page.  
  2. Check for the edit icon on any program.  
  3. Attempt direct URL/API access to the edit action (if applicable).
- **Expected Result:**  
  - Edit icon is hidden or disabled for non-admin users.  
  - Direct access is denied (redirect/403).  
  - No program can be modified.
- **Priority:** Medium

## Edge Cases

### TC-011
- **ID:** TC-011
- **Title:** Saving with no changes does not cause errors
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for an existing program
- **Steps:**  
  1. Do not modify any field.  
  2. Click `Save`.
- **Expected Result:**  
  - Modal closes without error.  
  - Program data remains unchanged.  
  - No duplicate record is created.
- **Priority:** Medium

### TC-012
- **ID:** TC-012
- **Title:** Edited Program Name with special characters is handled safely
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for an existing program
- **Steps:**  
  1. Change `Program Name` to `Web Dev & AI / 2026 - Cohort #1`.  
  2. Click `Save`.
- **Expected Result:**  
  - Program is saved with the special-character name.  
  - Name renders correctly in list without encoding issues.
- **Priority:** Medium

### TC-013
- **ID:** TC-013
- **Title:** Edited Program Name with script-like input is stored as text and not executed
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for an existing program
- **Steps:**  
  1. Change `Program Name` to `<script>alert('x')</script>`.  
  2. Click `Save` (if allowed by validation).  
  3. View resulting program entry in list.
- **Expected Result:**  
  - No script execution occurs.  
  - Input is escaped/sanitized or rejected safely.  
  - Application remains stable and secure.
- **Priority:** High

### TC-014
- **ID:** TC-014
- **Title:** Program Name maximum length boundary is enforced on edit
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for an existing program
- **Steps:**  
  1. Enter a Program Name at the documented maximum length (example: 255 characters).  
  2. Click `Save`.
- **Expected Result:**  
  - Value at max allowed length is accepted.  
  - Program is saved and displayed correctly without truncation issues.
- **Priority:** High

### TC-015
- **ID:** TC-015
- **Title:** Program Name beyond maximum length is rejected on edit
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for an existing program
- **Steps:**  
  1. Enter a Program Name exceeding max length by 1 character (example: 256 characters if max is 255).  
  2. Attempt to click `Save`.
- **Expected Result:**  
  - Input is prevented or validation error is shown.  
  - Submission is blocked.  
  - Program name is not updated.
- **Priority:** High

### TC-016
- **ID:** TC-016
- **Title:** Double-clicking Save does not create duplicate updates or records
- **Preconditions:**  
  - Admin user is logged in  
  - Edit form/modal is open for an existing program
- **Steps:**  
  1. Change `Program Name` to `Double Save Test`.  
  2. Double-click `Save` quickly.
- **Expected Result:**  
  - Only one update is applied.  
  - UI prevents duplicate submission (button disables/spinner/idempotent handling).  
  - No duplicate program record is created.
- **Priority:** High

### TC-017
- **ID:** TC-017
- **Title:** Edit form reflects latest data after a previous edit
- **Preconditions:**  
  - Admin user is logged in  
  - Program was recently edited and saved
- **Steps:**  
  1. Click the edit icon on the recently edited program.
- **Expected Result:**  
  - Edit form shows the most recently saved values, not stale/cached data.
- **Priority:** Medium

## Traceability to Acceptance Criteria
- **AC: Open program for editing** -> Covered by `TC-001`
- **AC: Successfully edit a program name** -> Covered by `TC-002`
- **AC: Edit preserves unchanged fields** -> Covered by `TC-003`, `TC-004`, `TC-005`

## Ambiguities / Gaps in Acceptance Criteria
- Whether a `Cancel` or close-modal action exists and what it does is not specified.
- Maximum and minimum length limits for `Program Name` and `Description` on edit are not defined.
- Duplicate handling rule when editing a name to match an existing program is unspecified.
- Allowed character set for `Program Name` and `Description` is not defined.
- Expected validation message text/placement for empty name on edit is not specified.
- Authorization behavior for non-admin users editing programs is implied but not explicitly accepted criteria.
- Behavior on slow network/server error during save is not defined.
- Whether saving with no changes is expected to succeed silently or show feedback is not defined.
- How the edit icon/action is accessed (inline icon, context menu, row click) is not precisely defined beyond "edit icon."
