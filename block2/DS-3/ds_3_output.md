## Test Plan: Program Name Validation and Duplicate Prevention

### Scope
Validate `Program Name` behavior on the **Program creation form** for:
- whitespace-only rejection
- special character acceptance
- duplicate name prevention
- boundary and normalization edge cases

### Assumptions
- `Program Name` is a required text field.
- Duplicate checking is expected to occur on submit (`Create`).
- Error messages are displayed inline or as form-level validation feedback.

---

## Positive Flows

### TC-001
- **Title:** Program is created when Program Name contains valid letters, symbols, and accents
- **Preconditions:**  
  - User is on the Program creation form.
  - No existing program named `Informatique & IA - Niveau 2`.
- **Steps:**
  1. Enter `Informatique & IA - Niveau 2` in `Program Name`.
  2. Enter `Programme bilingue axe sur IA appliquee.` in `Description`.
  3. Complete all other required fields with valid values.
  4. Click `Create`.
- **Expected result:**  
  Program is created successfully; user sees success feedback and new program appears in Programs list with exact name `Informatique & IA - Niveau 2`.
- **Priority:** High

### TC-002
- **Title:** Program Name is accepted when leading/trailing spaces are trimmed and resulting value is valid
- **Preconditions:**  
  - User is on the Program creation form.
  - No existing program named `Data Science 101`.
- **Steps:**
  1. Enter `  Data Science 101  ` in `Program Name`.
  2. Fill `Description` and all other required fields with valid values.
  3. Click `Create`.
- **Expected result:**  
  Program is created; stored/displayed name is normalized to `Data Science 101` (no leading/trailing spaces).
- **Priority:** Medium

### TC-003
- **Title:** Program Name with mixed alphanumeric and allowed punctuation is accepted
- **Preconditions:**  
  - User is on the Program creation form.
  - No existing program named `QA/Test_Automation-2026`.
- **Steps:**
  1. Enter `QA/Test_Automation-2026` in `Program Name`.
  2. Fill all required fields with valid values.
  3. Click `Create`.
- **Expected result:**  
  Program is created successfully and displayed with same characters.
- **Priority:** Medium

---

## Negative Flows

### TC-004
- **Title:** Form submission is blocked when Program Name is whitespace only
- **Preconditions:**  
  - User is on the Program creation form.
- **Steps:**
  1. Enter `   ` in `Program Name`.
  2. Fill other required fields with valid values.
  3. Click `Create`.
- **Expected result:**  
  Form is not submitted; validation shows `Program Name is required` (or equivalent). No new program is created.
- **Priority:** High

### TC-005
- **Title:** Duplicate Program Name is rejected when exact same value already exists
- **Preconditions:**  
  - Program `Web Development 2026` already exists.
  - User is on the Program creation form.
- **Steps:**
  1. Enter `Web Development 2026` in `Program Name`.
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:**  
  Creation fails with duplicate error (e.g., `Program name already exists`); no second record is created.
- **Priority:** High

### TC-006
- **Title:** Duplicate prevention rejects same name even with leading/trailing spaces
- **Preconditions:**  
  - Program `Web Development 2026` already exists.
  - User is on the Program creation form.
- **Steps:**
  1. Enter `  Web Development 2026  ` in `Program Name`.
  2. Fill all other required fields.
  3. Click `Create`.
- **Expected result:**  
  Creation is rejected as duplicate after trim; no duplicate record appears.
- **Priority:** High

### TC-007
- **Title:** Empty Program Name is rejected and does not trigger successful submission
- **Preconditions:**  
  - User is on the Program creation form.
- **Steps:**
  1. Leave `Program Name` blank.
  2. Fill all other required fields with valid values.
  3. Click `Create`.
- **Expected result:**  
  Validation error displayed for `Program Name`; no program is created.
- **Priority:** High

### TC-008
- **Title:** UI does not close or navigate away when name validation fails
- **Preconditions:**  
  - User is on Program creation form.
- **Steps:**
  1. Enter `   ` in `Program Name`.
  2. Click `Create`.
- **Expected result:**  
  User remains on the same form; entered values in other fields are retained; no success toast/navigation occurs.
- **Priority:** Medium

---

## Edge Cases

### TC-009
- **Title:** Minimum non-whitespace length (1 character) is accepted if unique
- **Preconditions:**  
  - No existing program named `A`.
  - User is on Program creation form.
- **Steps:**
  1. Enter `A` in `Program Name`.
  2. Fill all other required fields.
  3. Click `Create`.
- **Expected result:**  
  Program is created successfully.
- **Priority:** Medium

### TC-010
- **Title:** Maximum allowed Program Name length is accepted
- **Preconditions:**  
  - Known max length configured for `Program Name` (for example 255).
  - No existing program with the same max-length value.
- **Steps:**
  1. Enter a unique program name at exact max length (e.g., 255 chars).
  2. Fill all other required fields.
  3. Click `Create`.
- **Expected result:**  
  Program is created successfully at boundary max length.
- **Priority:** Medium

### TC-011
- **Title:** Program Name exceeding maximum length is rejected
- **Preconditions:**  
  - Max length enforced for `Program Name`.
  - User is on Program creation form.
- **Steps:**
  1. Enter a name with length max+1 (e.g., 256 chars if limit is 255).
  2. Fill all other required fields.
  3. Click `Create`.
- **Expected result:**  
  Validation error shown for length; submission blocked; no program created.
- **Priority:** Medium

### TC-012
- **Title:** Duplicate detection behavior is consistent for case differences
- **Preconditions:**  
  - Program `Web Development 2026` already exists.
  - User is on Program creation form.
- **Steps:**
  1. Enter `web development 2026` in `Program Name`.
  2. Fill all other required fields.
  3. Click `Create`.
- **Expected result:**  
  Behavior matches defined uniqueness rule (preferably rejected as duplicate if comparison is case-insensitive); system does not create ambiguous near-identical duplicates.
- **Priority:** High

### TC-013
- **Title:** Duplicate detection behavior is consistent for internal whitespace normalization
- **Preconditions:**  
  - Program `Web Development 2026` already exists.
- **Steps:**
  1. Enter `Web  Development   2026` in `Program Name`.
  2. Fill all other required fields.
  3. Click `Create`.
- **Expected result:**  
  Behavior follows product rule for internal spaces (reject if normalization collapses spaces; otherwise accept intentionally). No unintended duplicates should exist.
- **Priority:** Medium

### TC-014
- **Title:** Program Name accepts international Unicode letters and symbols when unique
- **Preconditions:**  
  - No existing program named `Ingenierie des Donnees - Edition 2026`.
- **Steps:**
  1. Enter `Ingenierie des Donnees - Edition 2026` in `Program Name`.
  2. Fill all other required fields.
  3. Click `Create`.
- **Expected result:**  
  Program is created and displayed correctly without character corruption.
- **Priority:** Low

---

## Ambiguities / Gaps in the ACs

- Exact `Program Name` max length is not specified.
- Allowed/disallowed character set is not explicitly defined (e.g., slash `/`, underscore `_`, emoji, quotes).
- Duplicate matching rule is unclear for:
  - case sensitivity (`Web` vs `web`)
  - accent sensitivity (`Informatique` vs accented variants)
  - internal whitespace normalization (single vs multiple spaces)
- Validation timing is unspecified (on blur, on submit, or real-time).
- Error message text and placement are not specified (inline vs toast vs banner).
- Behavior after failed submit is not specified (field focus, retention of other field values).
- ACs do not state whether uniqueness is global or scoped (e.g., by organization, tenant, or archived/deleted programs).
