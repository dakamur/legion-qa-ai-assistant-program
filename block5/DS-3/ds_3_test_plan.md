# Test Plan: Program Name Validation and Duplicate Prevention

## Scope
This test plan validates program name validation rules, including rejection of whitespace-only names, acceptance of special characters, and duplicate name prevention during program creation.

## Positive Flows

### TC-001
- **ID:** TC-001
- **Title:** Program name with special characters is accepted and created successfully
- **Preconditions:**  
  - Admin user is logged in  
  - User is on the Programs page  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `Informatique & IA - Niveau 2` in `Program Name`.  
  2. Fill in `Description` with a valid value.  
  3. Click `Create`.
- **Expected Result:**  
  - Program is created successfully.  
  - Modal closes.  
  - Programs list displays `Informatique & IA - Niveau 2` rendered correctly without encoding issues.
- **Priority:** High

### TC-002
- **ID:** TC-002
- **Title:** Program name with accented and unicode characters is accepted
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `Éducation Spécialisée — Côte d'Ivoire` in `Program Name`.  
  2. Fill in `Description`.  
  3. Click `Create`.
- **Expected Result:**  
  - Program is created successfully.  
  - Name renders correctly in the list with all accented characters intact.
- **Priority:** Medium

### TC-003
- **ID:** TC-003
- **Title:** Program name with ampersand, dash, and numeric characters is accepted
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `CS & Math - Level 2 (2026)` in `Program Name`.  
  2. Fill in `Description`.  
  3. Click `Create`.
- **Expected Result:**  
  - Program is created successfully.  
  - Name displays correctly with all special characters preserved.
- **Priority:** Medium

## Negative Flows

### TC-004
- **ID:** TC-004
- **Title:** Whitespace-only program name is rejected (trimmed to empty)
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `   ` (three spaces) in `Program Name`.  
  2. Fill in `Description`.  
  3. Observe the `Create` button state.  
  4. Attempt to click `Create` (if enabled).
- **Expected Result:**  
  - The name is trimmed and treated as empty.  
  - Form is not submitted.  
  - `Create` button is disabled or validation error is shown.  
  - No program is created.
- **Priority:** High

### TC-005
- **ID:** TC-005
- **Title:** Tab-only program name is rejected
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter a tab character in `Program Name`.  
  2. Fill in `Description`.  
  3. Observe the `Create` button state.
- **Expected Result:**  
  - The name is trimmed and treated as empty.  
  - Form is not submitted.  
  - No program is created.
- **Priority:** Medium

### TC-006
- **ID:** TC-006
- **Title:** Duplicate program name is rejected with error message
- **Preconditions:**  
  - Admin user is logged in  
  - Program `Web Development 2026` already exists  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `Web Development 2026` in `Program Name`.  
  2. Fill in `Description`.  
  3. Click `Create`.
- **Expected Result:**  
  - An error is displayed indicating the name already exists.  
  - The modal remains open.  
  - No duplicate program is created.  
  - The existing program is not affected.
- **Priority:** High

### TC-007
- **ID:** TC-007
- **Title:** Duplicate name with different casing is handled per business rules
- **Preconditions:**  
  - Admin user is logged in  
  - Program `Web Development 2026` already exists  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `web development 2026` (all lowercase) in `Program Name`.  
  2. Fill in `Description`.  
  3. Click `Create`.
- **Expected Result:**  
  - If case-insensitive uniqueness is enforced, an error is displayed.  
  - If case-sensitive, the program is created successfully.  
  - Behavior is consistent with the business rule for name uniqueness.
- **Priority:** High

### TC-008
- **ID:** TC-008
- **Title:** Duplicate name with leading/trailing whitespace is rejected
- **Preconditions:**  
  - Admin user is logged in  
  - Program `Web Development 2026` already exists  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `  Web Development 2026  ` (with leading/trailing spaces) in `Program Name`.  
  2. Fill in `Description`.  
  3. Click `Create`.
- **Expected Result:**  
  - The name is trimmed before duplicate check.  
  - An error is displayed indicating the name already exists.  
  - No duplicate program is created.
- **Priority:** Medium

### TC-009
- **ID:** TC-009
- **Title:** Empty program name is rejected
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Leave `Program Name` empty.  
  2. Fill in `Description`.  
  3. Observe the `Create` button state.
- **Expected Result:**  
  - `Create` button is disabled.  
  - No program is created.
- **Priority:** High

## Edge Cases

### TC-010
- **ID:** TC-010
- **Title:** Program name with HTML/script tags is sanitized and not executed
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `<script>alert('xss')</script>` in `Program Name`.  
  2. Fill in `Description`.  
  3. Click `Create` (if allowed by validation).  
  4. View the program entry in the list.
- **Expected Result:**  
  - No script execution occurs.  
  - Input is escaped/sanitized or rejected safely.  
  - Application remains stable.
- **Priority:** High

### TC-011
- **ID:** TC-011
- **Title:** Program name with only punctuation is accepted or rejected per rules
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `---` in `Program Name`.  
  2. Fill in `Description`.  
  3. Click `Create`.
- **Expected Result:**  
  - If punctuation-only names are allowed, program is created and displayed correctly.  
  - If not allowed, clear validation message is shown.
- **Priority:** Low

### TC-012
- **ID:** TC-012
- **Title:** Duplicate check applies during edit as well as create
- **Preconditions:**  
  - Admin user is logged in  
  - Two programs exist: "Program A" and "Program B"
- **Steps:**  
  1. Click the edit icon on "Program B".  
  2. Change `Program Name` to `Program A`.  
  3. Click `Save`.
- **Expected Result:**  
  - Duplicate name is blocked on edit.  
  - Error message is displayed.  
  - "Program B" retains its original name.
- **Priority:** High

### TC-013
- **ID:** TC-013
- **Title:** Name with mixed whitespace and valid characters is trimmed correctly
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `  Web Development 2026  ` (leading/trailing spaces) in `Program Name`.  
  2. Fill in `Description`.  
  3. Click `Create`.
- **Expected Result:**  
  - Program is created with the trimmed name "Web Development 2026".  
  - No leading or trailing spaces are stored.
- **Priority:** Medium

### TC-014
- **ID:** TC-014
- **Title:** Attempting to create a program after a previously deleted program with the same name succeeds
- **Preconditions:**  
  - Admin user is logged in  
  - Program "Deleted Program" was previously created and then deleted
- **Steps:**  
  1. Open the program creation form.  
  2. Enter `Deleted Program` in `Program Name`.  
  3. Fill in `Description`.  
  4. Click `Create`.
- **Expected Result:**  
  - Program is created successfully since the original no longer exists.  
  - No false duplicate error is raised.
- **Priority:** Medium

## Traceability to Acceptance Criteria
- **AC: Reject program name with only whitespace** -> Covered by `TC-004`, `TC-005`
- **AC: Accept program name with special characters** -> Covered by `TC-001`, `TC-002`, `TC-003`
- **AC: Reject duplicate program name** -> Covered by `TC-006`, `TC-007`, `TC-008`

## Ambiguities / Gaps in Acceptance Criteria
- Whether duplicate check is case-sensitive or case-insensitive is not specified.
- Whether leading/trailing whitespace is trimmed before duplicate comparison is not defined.
- The exact error message text for duplicate names is not specified.
- Whether the duplicate check applies on edit (not just create) is not stated.
- Maximum and minimum length limits for `Program Name` are not defined.
- Whether names consisting of only punctuation or special characters are allowed is unspecified.
- Whether a previously deleted program's name can be reused is not stated.
- How the system handles concurrent creation of programs with the same name is not defined.
