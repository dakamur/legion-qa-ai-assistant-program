Feature: DS-4 - Delete program with confirmation

  As an admin user, I want to delete a program I no longer need, with a
  confirmation step to prevent accidental deletion.

  # Happy paths

  Scenario: Delete program with confirmation
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    When I confirm deletion
    Then "Test Program" is removed from the program list

  Scenario: Cancel program deletion
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I see the confirmation dialog
    And I click Cancel
    Then the confirmation dialog closes
    And "Test Program" still exists in the program list

  # Negative

  Scenario: Program is not deleted when confirmation is dismissed without confirming
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I see the confirmation dialog
    And I dismiss the dialog without confirming
    Then "Test Program" still exists in the program list

  Scenario: Deleting one program does not remove other programs
    Given I am logged in as admin
    And I am on the Programs page
    And programs "Test Program" and "Web Development 2026" exist
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then "Test Program" is removed from the program list
    And "Web Development 2026" still exists in the program list

  Scenario: Double-clicking confirm does not cause unexpected errors
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I see the confirmation dialog
    And I double-click confirm quickly
    Then "Test Program" is removed from the program list
    And no duplicate delete errors are shown

  # Edge cases

  Scenario: Confirmation dialog references the program being deleted
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    Then I see a confirmation dialog
    And the dialog identifies "Test Program" as the program to be deleted

  Scenario: Delete program with special characters in the name
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Dev & Design (2026) — Cohort #1" exists
    When I click the delete icon for "Web Dev & Design (2026) — Cohort #1"
    And I confirm deletion
    Then "Web Dev & Design (2026) — Cohort #1" is removed from the program list

  Scenario: Delete last remaining program updates the list state
    Given I am logged in as admin
    And I am on the Programs page
    And only the program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I confirm deletion
    Then "Test Program" is removed from the program list
    And the Programs page reflects that no programs remain

  Scenario: Cancel after opening delete dialog for one program preserves all programs
    Given I am logged in as admin
    And I am on the Programs page
    And programs "Test Program" and "Web Development 2026" exist
    When I click the delete icon for "Test Program"
    And I see the confirmation dialog
    And I click Cancel
    Then both "Test Program" and "Web Development 2026" still exist in the program list

  Scenario: Keyboard Escape dismisses confirmation without deleting
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Test Program" exists
    When I click the delete icon for "Test Program"
    And I see the confirmation dialog
    And I press Escape
    Then "Test Program" still exists in the program list

#
# Ambiguities / Gaps in Acceptance Criteria
#
# - Confirmation dialog content is not specified (title, body, button labels, whether program name must appear).
# - Dismissal behavior is undefined for close button, Escape, and outside-click.
# - No requirement for success or error toast or messages after delete action.
# - No guidance on API failure handling (retry, error text, list refresh behavior).
# - Duplicate name behavior is not defined (delete by row vs by name).
# - No statement about pagination, sorting, or filter interactions during deletion.
# - No concurrency expectation (what happens if another user deletes the same program first).
# - No requirement for accessibility or keyboard behavior (focus trap, Enter or Escape handling).
# - No performance expectation (time to remove row, loader or spinner behavior).
