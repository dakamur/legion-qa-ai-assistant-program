Feature: DS-2 - Edit existing program details

  As an admin user, I want to edit an existing program's details so that I can
  correct or update program information after creation.

  # Happy paths

  Scenario: Open program for editing
    Given I am logged in as admin
    And I am on the Programs page
    And a program "Web Development 2026" exists
    When I click the edit icon on "Web Development 2026"
    Then I see the edit form pre-populated with the program's current data

  Scenario: Successfully edit a program name
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes
    And the program list immediately shows "Web Development 2026 - Updated"

  Scenario: Edit preserves unchanged fields when only Description is changed
    Given I am logged in as admin
    And I am editing a program with Name "Web Development 2026"
    And the Description is "Full-stack web development program"
    When I change only the Description to "Updated curriculum overview for 2026"
    And I click Save
    Then the modal closes
    And the program list shows Name "Web Development 2026"
    And the program Description is "Updated curriculum overview for 2026"

  Scenario: Edit preserves Description when only Name is changed
    Given I am logged in as admin
    And I am editing a program with Name "Web Development 2026"
    And the Description is "Full-stack web development program"
    When I change only the Name to "Web Development 2026 - Updated"
    And I click Save
    Then the modal closes
    And the program list shows Name "Web Development 2026 - Updated"
    And the program Description is "Full-stack web development program"

  # Negative

  Scenario: Save is blocked when Program Name is cleared to empty
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I clear the Program Name field entirely
    Then the Save button is disabled
    And the program list still shows "Web Development 2026"

  Scenario: Whitespace-only Program Name cannot be saved
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I clear the Program Name field
    And I enter "   " as the Program Name
    Then the Save button is disabled
    And the program list still shows "Web Development 2026"

  Scenario: Cancel discards unsaved edits
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I change the Name to "Unsaved Change Program"
    And I click Cancel
    Then the modal closes
    And the program list still shows "Web Development 2026"
    And the program list does not show "Unsaved Change Program"

  Scenario: Editing name to a duplicate existing program name is rejected
    Given I am logged in as admin
    And programs "Web Development 2026" and "Data Science 2026" exist
    And I am editing "Data Science 2026"
    When I change the Name to "Web Development 2026"
    And I click Save
    Then I see a validation error indicating the name already exists
    And the program list still shows "Data Science 2026"

  # Edge cases

  Scenario: Program Name accepts special characters on edit
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I change the Name to "Web Dev & Design (2026) — Cohort #1"
    And I click Save
    Then the modal closes
    And the program list shows "Web Dev & Design (2026) — Cohort #1"

  Scenario: Description accepts special characters on edit
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I change the Description to "Covers HTML/CSS, JS/TS & React — 100% hands-on!"
    And I click Save
    Then the modal closes
    And the program Description is "Covers HTML/CSS, JS/TS & React — 100% hands-on!"

  Scenario: Saving with no changes succeeds without altering data
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I click Save without changing any fields
    Then the modal closes
    And the program list still shows "Web Development 2026"

  Scenario: Double-clicking Save does not corrupt the program record
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I change the Name to "Web Development 2026 - Updated"
    And I double-click Save quickly
    Then the modal closes
    And the program list shows exactly one entry for "Web Development 2026 - Updated"

  Scenario: Program Name at maximum allowed length is accepted on edit
    Given I am logged in as admin
    And I am editing "Web Development 2026"
    When I change the Name to a value at the documented maximum length
    And I click Save
    Then the modal closes
    And the program list shows the program with the full updated Name preserved

#
# Ambiguities / Gaps in Acceptance Criteria
#
# - Whether a Cancel or close-modal action exists and what it does is not specified.
# - Maximum and minimum length limits for Program Name and Description on edit are not defined.
# - Duplicate handling rule when editing a name to match an existing program is unspecified.
# - Allowed character set for Program Name and Description is not defined.
# - Expected validation message text and placement for empty name on edit is not specified.
# - Authorization behavior for non-admin users editing programs is implied but not explicit.
# - Behavior on slow network or server error during save is not defined.
# - Whether saving with no changes is expected to succeed silently or show feedback is not defined.
# - How the edit icon or action is accessed (inline icon, context menu, row click) is not precisely defined.
