Feature: DS-1 - Create new academic program

  As an admin user, I want to create a new academic program so that I can begin
  designing its curriculum structure.

  # Happy paths

  Scenario: Navigate to program creation form
    Given I am logged in as admin
    When I navigate to the Programs page
    And I click "+ New Program"
    Then I see the program creation form with fields: Program Name, Description

  Scenario: Successfully create a program
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows "Web Development 2026"

  Scenario: Newly created program appears exactly once in the program list
    Given I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the modal closes
    And the program list shows exactly one entry for "Web Development 2026"

  # Negative

  Scenario: Validation prevents empty program name
    Given I am on the program creation form
    When I leave the Program Name field empty
    Then the Create button is disabled

  Scenario: Create is blocked when Program Name is empty but Description is filled
    Given I am on the program creation form
    When I leave the Program Name field empty
    And I fill in Description with "Full-stack web development program"
    Then the Create button is disabled
    And no new program is added to the program list

  Scenario: Whitespace-only Program Name is treated as empty
    Given I am on the program creation form
    When I fill in Program Name with "   "
    And I fill in Description with "Full-stack web development program"
    Then the Create button is disabled
    And no new program is added to the program list

  Scenario: Program is not created when Create button is disabled
    Given I am on the program creation form
    And I leave the Program Name field empty
    And the Create button is disabled
    When I attempt to click Create
    Then the modal remains open
    And no new program is added to the program list

  # Edge cases

  Scenario: Program Name accepts special characters
    Given I am on the program creation form
    When I fill in Program Name with "Web Dev & Design (2026) — Cohort #1"
    And I fill in Description with "Program with special characters in the name"
    And I click Create
    Then the modal closes
    And the program list shows "Web Dev & Design (2026) — Cohort #1"

  Scenario: Description accepts special characters
    Given I am on the program creation form
    When I fill in Program Name with "Data Science 2026"
    And I fill in Description with "Covers SQL, Python, ML/AI & stats — 100% hands-on!"
    And I click Create
    Then the modal closes
    And the program list shows "Data Science 2026"

  Scenario: Duplicate program name submission behavior
    Given a program named "Web Development 2026" already exists in the program list
    And I am on the program creation form
    When I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Duplicate name test program"
    And I click Create
    Then the system either blocks creation with a clear validation message
    Or allows creation and both programs are distinguishable in the program list

  Scenario: Empty Description behavior follows business rules
    Given I am on the program creation form
    When I fill in Program Name with "Cybersecurity 2026"
    And I leave the Description field empty
    And I click Create
    Then the system either creates the program successfully
    Or blocks creation with a clear validation message for the Description field

  Scenario: Double-clicking Create does not create duplicate records
    Given I am on the program creation form
    When I fill in Program Name with "Cloud Computing 2026"
    And I fill in Description with "Double submit test"
    And I double-click Create quickly
    Then only one program named "Cloud Computing 2026" appears in the program list

  Scenario: Program Name at maximum allowed length is accepted
    Given I am on the program creation form
    When I fill in Program Name with a value at the documented maximum length
    And I fill in Description with "Maximum length boundary test"
    And I click Create
    Then the modal closes
    And the program list shows the program with the full Program Name preserved

  Scenario: Description at maximum allowed length is accepted
    Given I am on the program creation form
    When I fill in Program Name with "UX Design 2026"
    And I fill in Description with a value at the documented maximum length
    And I click Create
    Then the modal closes
    And the program list shows "UX Design 2026" with the full Description preserved

#
# Ambiguities / Gaps in Acceptance Criteria
#
# - Maximum and minimum length limits for Program Name and Description are not defined.
# - Whether Description is required or optional is not explicitly stated.
# - Duplicate handling rule for Program Name (allowed vs blocked, case sensitivity) is unspecified.
# - Allowed character set for Program Name and Description is not defined.
# - Expected validation message text and placement are not specified.
# - Authorization behavior for non-admin users is implied but not an explicit acceptance criterion.
# - Behavior on slow network or server error during create is not defined.
# - Sorting or positioning of the newly created program in the list is not specified.
