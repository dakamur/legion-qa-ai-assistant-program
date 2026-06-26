# Test Plan: Create New Academic Program

## Scope
This test plan validates the "Create new academic program" feature, including navigation to the creation form, successful creation, and client-side validation for required fields.

## Positive Flows

### TC-001
- **ID:** TC-001
- **Title:** Program creation form is displayed with required fields
- **Preconditions:**  
  - Admin user is logged in  
  - User is on the Programs page
- **Steps:**  
  1. Click `+ New Program`.
- **Expected Result:**  
  - Program creation form/modal is displayed.  
  - Fields `Program Name` and `Description` are visible.
- **Priority:** High

### TC-002
- **ID:** TC-002
- **Title:** Program is created successfully with valid inputs
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `Web Development 2026` in `Program Name`.  
  2. Enter `Full-stack web development program` in `Description`.  
  3. Click `Create`.
- **Expected Result:**  
  - Creation modal closes.  
  - Programs list displays `Web Development 2026`.
- **Priority:** High

### TC-003
- **ID:** TC-003
- **Title:** Newly created program appears only once in program list
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `Web Development 2026` in `Program Name`.  
  2. Enter `Full-stack web development program` in `Description`.  
  3. Click `Create`.  
  4. Observe the Programs list.
- **Expected Result:**  
  - `Web Development 2026` appears exactly once in the list.  
  - No duplicate row is rendered from a single submission.
- **Priority:** Medium

## Negative Flows

### TC-004
- **ID:** TC-004
- **Title:** Create action is blocked when Program Name is empty
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Leave `Program Name` empty.  
  2. Enter `Full-stack web development program` in `Description`.  
  3. Observe the `Create` button state.
- **Expected Result:**  
  - `Create` button is disabled.  
  - Program is not created.
- **Priority:** High

### TC-005
- **ID:** TC-005
- **Title:** Whitespace-only Program Name is treated as empty and cannot be submitted
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter three spaces (`   `) in `Program Name`.  
  2. Enter `Full-stack web development program` in `Description`.  
  3. Observe the `Create` button state.  
  4. Attempt to click `Create` (if enabled).
- **Expected Result:**  
  - `Program Name` is treated as invalid/empty after trim.  
  - `Create` remains disabled or submission is rejected with validation feedback.  
  - No new program is added.
- **Priority:** High

### TC-006
- **ID:** TC-006
- **Title:** Duplicate Program Name is rejected according to uniqueness rules
- **Preconditions:**  
  - Admin user is logged in  
  - Program `Web Development 2026` already exists  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `Web Development 2026` in `Program Name`.  
  2. Enter `Duplicate name test` in `Description`.  
  3. Click `Create`.
- **Expected Result:**  
  - Duplicate creation is blocked (or explicitly handled per business rule).  
  - User sees clear error messaging if duplicates are not allowed.  
  - Existing program is not overwritten.
- **Priority:** High

### TC-007
- **ID:** TC-007
- **Title:** Unauthorized users cannot access program creation
- **Preconditions:**  
  - User is logged in as non-admin
- **Steps:**  
  1. Navigate to Programs page.  
  2. Check for `+ New Program`.  
  3. Attempt direct URL access to the creation form/modal route (if applicable).
- **Expected Result:**  
  - `+ New Program` is hidden or disabled for non-admin users.  
  - Direct access is denied (redirect/403).  
  - No program can be created.
- **Priority:** Medium

## Edge Cases

### TC-008
- **ID:** TC-008
- **Title:** Program Name supports minimum valid length
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `A` in `Program Name`.  
  2. Enter `Minimum length test` in `Description`.  
  3. Click `Create`.
- **Expected Result:**  
  - Program is created if one-character names are permitted by rules.  
  - Program appears in list exactly as entered.
- **Priority:** Medium

### TC-009
- **ID:** TC-009
- **Title:** Program Name maximum length boundary is enforced
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter a Program Name at the documented maximum length (example: 255 characters).  
  2. Enter `Max boundary test` in `Description`.  
  3. Click `Create`.
- **Expected Result:**  
  - Value at max allowed length is accepted.  
  - Program is created and displayed correctly without truncation issues.
- **Priority:** High

### TC-010
- **ID:** TC-010
- **Title:** Program Name beyond maximum length is rejected
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter a Program Name exceeding max length by 1 character (example: 256 characters if max is 255).  
  2. Enter `Overflow boundary test` in `Description`.  
  3. Attempt to click `Create`.
- **Expected Result:**  
  - Input is prevented or validation error is shown.  
  - Submission is blocked.  
  - No program is created.
- **Priority:** High

### TC-011
- **ID:** TC-011
- **Title:** Program Name with special characters is handled safely
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `Web Dev & AI / 2026 - Cohort #1` in `Program Name`.  
  2. Enter `Special characters test` in `Description`.  
  3. Click `Create`.
- **Expected Result:**  
  - Program is created if special characters are allowed.  
  - Name renders correctly in list without encoding issues.
- **Priority:** Medium

### TC-012
- **ID:** TC-012
- **Title:** Program Name with script-like input is stored as text and not executed
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `<script>alert('x')</script>` in `Program Name`.  
  2. Enter `Security encoding test` in `Description`.  
  3. Click `Create` (if allowed by validation).  
  4. View resulting program entry in list.
- **Expected Result:**  
  - No script execution occurs.  
  - Input is escaped/sanitized or rejected safely.  
  - Application remains stable and secure.
- **Priority:** High

### TC-013
- **ID:** TC-013
- **Title:** Empty Description behavior follows business rules without blocking valid create
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `Web Development 2027` in `Program Name`.  
  2. Leave `Description` empty.  
  3. Click `Create`.
- **Expected Result:**  
  - If `Description` is optional, program is created successfully.  
  - If required, clear validation message is shown and creation is blocked.
- **Priority:** Medium

### TC-014
- **ID:** TC-014
- **Title:** Description maximum length boundary is enforced
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `Web Development 2028` in `Program Name`.  
  2. Enter Description at documented max length (example: 1000 characters).  
  3. Click `Create`.
- **Expected Result:**  
  - Maximum valid description is accepted and saved accurately.  
  - No UI overflow or truncation anomalies.
- **Priority:** Medium

### TC-015
- **ID:** TC-015
- **Title:** Double-clicking Create does not create duplicate records
- **Preconditions:**  
  - Admin user is logged in  
  - Program creation form/modal is open
- **Steps:**  
  1. Enter `Web Development 2029` in `Program Name`.  
  2. Enter `Double submit test` in `Description`.  
  3. Double-click `Create` quickly.
- **Expected Result:**  
  - Only one program record is created.  
  - UI prevents duplicate submission (button disables/spinner/idempotent handling).
- **Priority:** High

## Traceability to Acceptance Criteria
- **AC: Navigate to program creation form** -> Covered by `TC-001`
- **AC: Successfully create a program** -> Covered by `TC-002`, `TC-003`
- **AC: Validation prevents empty program name** -> Covered by `TC-004`, `TC-005`

## Ambiguities / Gaps in Acceptance Criteria
- Maximum and minimum length limits for `Program Name` and `Description` are not defined.
- Whether `Description` is required or optional is not explicitly stated.
- Duplicate handling rule for `Program Name` (allowed vs blocked, case sensitivity) is unspecified.
- Allowed character set for `Program Name` and `Description` is not defined.
- Expected validation message text/placement is not specified.
- Authorization behavior for non-admin users is implied but not explicitly accepted criteria.
- Behavior on slow network/server error during create is not defined.
- Sorting/positioning of the newly created program in the list is not specified.
