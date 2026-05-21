# Test Plan: Program List Filtering and Display

## Scope
This test plan validates the "Program list filtering and display" feature, including the display of programs with key details and the empty state behavior when no programs exist.

## Positive Flows

### TC-001
- **ID:** TC-001
- **Title:** Programs page displays a list showing each program's name and description
- **Preconditions:**  
  - Admin user is logged in  
  - At least one program exists in the system
- **Steps:**  
  1. Navigate to the Programs page.
- **Expected Result:**  
  - A list/table of programs is displayed.  
  - Each program entry shows the program's name.  
  - Each program entry shows the program's description.
- **Priority:** High

### TC-002
- **ID:** TC-002
- **Title:** Multiple programs are all displayed in the list
- **Preconditions:**  
  - Admin user is logged in  
  - At least three programs exist in the system
- **Steps:**  
  1. Navigate to the Programs page.  
  2. Scan the list for all known programs.
- **Expected Result:**  
  - All existing programs are visible in the list.  
  - No programs are missing or hidden.
- **Priority:** High

### TC-003
- **ID:** TC-003
- **Title:** Newly created program appears in the list immediately
- **Preconditions:**  
  - Admin user is logged in  
  - User is on the Programs page
- **Steps:**  
  1. Create a new program with a unique name.  
  2. Observe the programs list after creation.
- **Expected Result:**  
  - The newly created program appears in the list with correct name and description.  
  - No page refresh is required.
- **Priority:** High

### TC-004
- **ID:** TC-004
- **Title:** Program list shows correct data after an edit
- **Preconditions:**  
  - Admin user is logged in  
  - A program exists with known name and description
- **Steps:**  
  1. Edit the program's name and/or description.  
  2. Observe the programs list after saving.
- **Expected Result:**  
  - The list reflects the updated name and/or description immediately.  
  - No stale data is shown.
- **Priority:** Medium

### TC-005
- **ID:** TC-005
- **Title:** Program list updates correctly after a deletion
- **Preconditions:**  
  - Admin user is logged in  
  - Multiple programs exist
- **Steps:**  
  1. Delete a program via the confirmation flow.  
  2. Observe the programs list.
- **Expected Result:**  
  - The deleted program is no longer in the list.  
  - All remaining programs are still displayed correctly.
- **Priority:** Medium

## Negative Flows

### TC-006
- **ID:** TC-006
- **Title:** Empty state is displayed when no programs exist
- **Preconditions:**  
  - Admin user is logged in  
  - No programs exist in the system (or all programs have been deleted)
- **Steps:**  
  1. Navigate to the Programs page.
- **Expected Result:**  
  - A message is displayed indicating no programs have been created.  
  - A prompt or call-to-action to create the first program is visible.  
  - No empty table/list skeleton is shown without context.
- **Priority:** High

### TC-007
- **ID:** TC-007
- **Title:** Empty state prompt leads to program creation
- **Preconditions:**  
  - Admin user is logged in  
  - No programs exist (empty state is displayed)
- **Steps:**  
  1. Click the prompt/button to create the first program (if present).
- **Expected Result:**  
  - The program creation form/modal opens.  
  - User can proceed with creating a new program.
- **Priority:** Medium

### TC-008
- **ID:** TC-008
- **Title:** Unauthorized users can view but not modify the program list
- **Preconditions:**  
  - User is logged in as non-admin
- **Steps:**  
  1. Navigate to the Programs page.
- **Expected Result:**  
  - Program list is displayed with names and descriptions.  
  - Edit and delete icons are hidden or disabled.  
  - `+ New Program` button is hidden or disabled.
- **Priority:** Medium

## Edge Cases

### TC-009
- **ID:** TC-009
- **Title:** Program with a very long name displays without breaking the layout
- **Preconditions:**  
  - Admin user is logged in  
  - A program with a name of 200+ characters exists
- **Steps:**  
  1. Navigate to the Programs page.
- **Expected Result:**  
  - The long program name is displayed (may be truncated visually with ellipsis or wrapped).  
  - The table/list layout is not broken.  
  - Other programs still display correctly.
- **Priority:** Medium

### TC-010
- **ID:** TC-010
- **Title:** Program with a very long description displays without breaking the layout
- **Preconditions:**  
  - Admin user is logged in  
  - A program with a description of 500+ characters exists
- **Steps:**  
  1. Navigate to the Programs page.
- **Expected Result:**  
  - The long description is displayed (may be truncated visually or wrapped).  
  - The table/list layout is not broken.
- **Priority:** Low

### TC-011
- **ID:** TC-011
- **Title:** Program with empty description displays correctly
- **Preconditions:**  
  - Admin user is logged in  
  - A program with an empty description exists
- **Steps:**  
  1. Navigate to the Programs page.
- **Expected Result:**  
  - The program is displayed with its name.  
  - The description area is empty or shows a placeholder.  
  - The layout is not broken by the missing description.
- **Priority:** Medium

### TC-012
- **ID:** TC-012
- **Title:** Program with special characters in name and description displays correctly
- **Preconditions:**  
  - Admin user is logged in  
  - A program with special characters exists (e.g., `Informatique & IA - Niveau 2`)
- **Steps:**  
  1. Navigate to the Programs page.
- **Expected Result:**  
  - Special characters are rendered correctly without encoding artifacts.  
  - No HTML entities (e.g., `&amp;`) are shown in place of actual characters.
- **Priority:** Medium

### TC-013
- **ID:** TC-013
- **Title:** Programs page loads within acceptable time with many programs
- **Preconditions:**  
  - Admin user is logged in  
  - A large number of programs exist (50+)
- **Steps:**  
  1. Navigate to the Programs page.  
  2. Observe loading time and list rendering.
- **Expected Result:**  
  - The page loads within a reasonable time.  
  - All programs are accessible (via scrolling or pagination).  
  - No performance degradation or browser freeze.
- **Priority:** Low

### TC-014
- **ID:** TC-014
- **Title:** Programs page is accessible via navigation after login
- **Preconditions:**  
  - Admin user is logged in  
  - User is on the Dashboard
- **Steps:**  
  1. Click the `🎓 Programs` button in the navigation sidebar.
- **Expected Result:**  
  - The Programs page loads.  
  - The programs list is displayed.  
  - The `🎓 Programs` nav item is shown as active/selected.
- **Priority:** High

### TC-015
- **ID:** TC-015
- **Title:** Each program row shows edit and delete action icons
- **Preconditions:**  
  - Admin user is logged in  
  - At least one program exists
- **Steps:**  
  1. Navigate to the Programs page.  
  2. Inspect a program row.
- **Expected Result:**  
  - Each program row has an edit icon (✏️) and a delete icon (🗑).  
  - Both icons are clickable.
- **Priority:** High

## Traceability to Acceptance Criteria
- **AC: Display program list with key details** -> Covered by `TC-001`, `TC-002`, `TC-003`, `TC-014`, `TC-015`
- **AC: Empty state when no programs exist** -> Covered by `TC-006`, `TC-007`

## Ambiguities / Gaps in Acceptance Criteria
- What constitutes "key details" beyond name and description is not specified (e.g., creation date, number of courses, status).
- Whether programs are displayed in a specific order (alphabetical, creation date, etc.) is not defined.
- Whether pagination or infinite scroll is expected for large lists is not specified.
- The exact empty state message text is not defined.
- Whether the empty state prompt is a button or a text link is not specified.
- Whether filtering or search functionality is expected on the list is not stated despite the story title mentioning "filtering."
- Whether sorting by column headers is supported is not defined.
- How programs with missing or empty descriptions should display in the list is not addressed.
- Authorization behavior for non-admin users viewing the list is not explicitly stated.
