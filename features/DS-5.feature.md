Feature: DS-5 - Program list filtering and display

  As an admin user, I want to see all programs in a clear list so that I can
  quickly find and manage them.

  # Happy paths

  Scenario: Display program list with key details
    Given I am logged in as admin
    And programs "Web Development 2026" and "Data Science 2026" exist in the system
    When I navigate to the Programs page
    Then I see a list showing each program's name and description
    And the list shows "Web Development 2026" with its description
    And the list shows "Data Science 2026" with its description

  Scenario: Empty state when no programs exist
    Given I am logged in as admin
    And no programs exist
    When I navigate to the Programs page
    Then I see a message indicating no programs have been created
    And I see a prompt to create the first program

  Scenario: Newly created program appears in the program list
    Given I am logged in as admin
    And I am on the Programs page
    When I click "+ New Program"
    And I fill in Program Name with "Web Development 2026"
    And I fill in Description with "Full-stack web development program"
    And I click Create
    Then the program list shows "Web Development 2026"
    And the program list shows Description "Full-stack web development program"

  # Negative

  Scenario: Programs page does not show stale data after a failed create attempt
    Given I am logged in as admin
    And no programs exist
    And I am on the program creation form
    When I leave the Program Name field empty
    And I attempt to click Create
    Then no program appears in the program list
    And I still see the empty state message

  Scenario: Deleted program no longer appears in the program list
    Given I am logged in as admin
    And a program "Test Program" exists
    And I am on the Programs page
    When I delete "Test Program" with confirmation
    Then the program list does not show "Test Program"

  # Edge cases

  Scenario: Program list displays program with special characters in name and description
    Given I am logged in as admin
    And a program "Informatique & IA - Niveau 2" exists with description "Programme bilingue — niveau avancé"
    When I navigate to the Programs page
    Then the list shows "Informatique & IA - Niveau 2"
    And the list shows description "Programme bilingue — niveau avancé"

  Scenario: Program list displays long description without breaking layout
    Given I am logged in as admin
    And a program "Web Development 2026" exists with a description at the documented maximum length
    When I navigate to the Programs page
    Then the list shows "Web Development 2026"
    And the description is displayed without breaking the list layout

  Scenario: Program list reflects an edited program immediately
    Given I am logged in as admin
    And a program "Web Development 2026" exists
    And I am on the Programs page
    When I edit "Web Development 2026" and change the Name to "Web Development 2026 - Updated"
    And I click Save
    Then the program list shows "Web Development 2026 - Updated"
    And the program list does not show "Web Development 2026"

  Scenario: Program list shows multiple programs without duplicates
    Given I am logged in as admin
    And programs "Web Development 2026", "Data Science 2026", and "Cybersecurity 2026" exist
    When I navigate to the Programs page
    Then the program list shows exactly three programs
    And each program name appears exactly once

  Scenario: Empty state prompt navigates to program creation
    Given I am logged in as admin
    And no programs exist
    And I am on the Programs page
    When I follow the prompt to create the first program
    Then I see the program creation form with fields: Program Name, Description

  Scenario: Program with empty description displays according to business rules
    Given I am logged in as admin
    And a program "Minimal Program 2026" exists with an empty description
    When I navigate to the Programs page
    Then the list shows "Minimal Program 2026"
    And the description area follows the defined empty-description display rule

#
# Ambiguities / Gaps in Acceptance Criteria
#
# - Ticket title mentions filtering, but no filtering behavior is defined (filter fields, criteria, sort, search, reset).
# - Empty-state exact copy is unspecified; acceptance should define exact text or localization key.
# - "Prompt to create the first program" is not precise on UI type (button, link, card), label, or navigation target.
# - No explicit rules for null, empty, or whitespace name or description display behavior.
# - No display constraints for max lengths (truncate vs wrap vs tooltip) are defined.
# - No requirement for ordering (alphabetical, created date, last updated) of programs in the list.
# - No guidance on duplicate names (whether allowed and how to disambiguate in the list).
# - No error or loading states are defined (API failure, slow network, partial data).
