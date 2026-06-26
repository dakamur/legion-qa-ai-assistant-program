Feature: DS-3 - Program name validation and duplicate prevention

  As an admin user, I want the system to prevent invalid or duplicate program
  names so that data integrity is maintained.

  # Happy paths

  Scenario: Accept program name with special characters
    Given I am logged in as admin
    And I am on the program creation form
    When I enter "Informatique & IA - Niveau 2" as the program name
    And I fill in Description with "Programme bilingue en informatique et intelligence artificielle"
    And I click Create
    Then the program is created successfully
    And the program list shows "Informatique & IA - Niveau 2"

  Scenario: Existing program name can be reused when editing the same program
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am editing "Web Development 2026"
    When I leave the Name as "Web Development 2026"
    And I change the Description to "Updated description without name change"
    And I click Save
    Then the modal closes
    And the program list shows "Web Development 2026"

  # Negative

  Scenario: Reject program name with only whitespace
    Given I am logged in as admin
    And I am on the program creation form
    When I enter "   " as the program name
    And I fill in Description with "Whitespace name validation test"
    And I click Create
    Then the form is not submitted
    And the program name is trimmed and treated as empty
    And no new program is added to the program list

  Scenario: Reject duplicate program name on create
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I enter "Web Development 2026" as the program name
    And I fill in Description with "Duplicate name validation test"
    And I click Create
    Then I see an error indicating the name already exists
    And no duplicate program is added to the program list

  Scenario: Reject empty program name on create
    Given I am logged in as admin
    And I am on the program creation form
    When I leave the program name empty
    And I fill in Description with "Empty name validation test"
    Then the Create button is disabled
    And no new program is added to the program list

  Scenario: Reject duplicate program name on edit
    Given I am logged in as admin
    And programs "Web Development 2026" and "Data Science 2026" exist
    And I am editing "Data Science 2026"
    When I change the Name to "Web Development 2026"
    And I click Save
    Then I see an error indicating the name already exists
    And the program list still shows "Data Science 2026"

  # Edge cases

  Scenario: Duplicate check is case-sensitive or case-insensitive per business rules
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I enter "web development 2026" as the program name
    And I fill in Description with "Case sensitivity duplicate test"
    And I click Create
    Then the system either rejects the duplicate with a clear error
    Or creates the program if case-insensitive duplicates are allowed

  Scenario: Leading and trailing whitespace is trimmed before duplicate check
    Given I am logged in as admin
    And a program "Web Development 2026" already exists
    And I am on the program creation form
    When I enter "  Web Development 2026  " as the program name
    And I fill in Description with "Trimmed duplicate name test"
    And I click Create
    Then I see an error indicating the name already exists
    And no duplicate program is added to the program list

  Scenario: Program name at maximum allowed length is accepted
    Given I am logged in as admin
    And I am on the program creation form
    When I enter a program name at the documented maximum length
    And I fill in Description with "Maximum length boundary test"
    And I click Create
    Then the program is created successfully

  Scenario: Program name exceeding maximum allowed length is rejected
    Given I am logged in as admin
    And I am on the program creation form
    When I enter a program name one character over the documented maximum length
    And I fill in Description with "Over max length validation test"
    And I click Create
    Then I see a validation error for the program name
    And no new program is added to the program list

  Scenario: Program name with accented characters is handled consistently
    Given I am logged in as admin
    And a program "Informatique & IA - Niveau 2" already exists
    And I am on the program creation form
    When I enter a name that differs only by accent from "Informatique & IA - Niveau 2"
    And I fill in Description with "Accent sensitivity duplicate test"
    And I click Create
    Then the system applies a consistent duplicate-matching rule and shows clear feedback

#
# Ambiguities / Gaps in Acceptance Criteria
#
# - Exact Program Name max length is not specified.
# - Allowed or disallowed character set is not explicitly defined (slash, underscore, emoji, quotes).
# - Duplicate matching rule is unclear for case sensitivity, accent sensitivity, and whitespace normalization.
# - Validation timing is unspecified (on blur, on submit, or real-time).
# - Error message text and placement are not specified (inline vs toast vs banner).
# - Behavior after failed submit is not specified (field focus, retention of other field values).
# - ACs do not state whether uniqueness is global or scoped (organization, tenant, archived programs).
# - Duplicate rejection on edit is implied but not an explicit acceptance criterion.
