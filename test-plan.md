# Test Plan - TODO MVC Application

**Application URL:** https://demo.playwright.dev/todomvc/#/  
**Framework:** Playwright + TypeScript  

---

## Positive Flows

### TC-001 — Page loads with correct title and empty todo list

- **Preconditions:** None
- **Steps:**
  1. Navigate to `https://demo.playwright.dev/todomvc/#/`
- **Expected Result:** Page title contains "TodoMVC". The input field with placeholder "What needs to be done?" is visible. No todo items are displayed.
- **Priority:** High

### TC-002 — Add a single todo item

- **Preconditions:** Page is loaded, todo list is empty
- **Steps:**
  1. Click the input field
  2. Type "Buy groceries"
  3. Press Enter
- **Expected Result:** "Buy groceries" appears in the todo list. Item count shows "1 item left".
- **Priority:** High

### TC-003 — Add four todo items

- **Preconditions:** Page is loaded, todo list is empty
- **Steps:**
  1. Type "Buy groceries" and press Enter
  2. Type "Clean the house" and press Enter
  3. Type "Walk the dog" and press Enter
  4. Type "Read a book" and press Enter
- **Expected Result:** All four items appear in the list in order. Item count shows "4 items left".
- **Priority:** High

### TC-004 — Mark a todo item as completed

- **Preconditions:** Four todo items exist in the list
- **Steps:**
  1. Click the toggle checkbox next to "Buy groceries"
- **Expected Result:** "Buy groceries" has a strikethrough style (class `completed`). Item count shows "3 items left".
- **Priority:** High

### TC-005 — Remove a todo item from the list

- **Preconditions:** Four todo items exist in the list
- **Steps:**
  1. Hover over "Walk the dog"
  2. Click the destroy (×) button
- **Expected Result:** "Walk the dog" is no longer in the list. The remaining items are still present. Item count decreases by one.
- **Priority:** High

### TC-006 — Filter active items

- **Preconditions:** At least one completed and one active item exist
- **Steps:**
  1. Click the "Active" filter link in the footer
- **Expected Result:** Only uncompleted items are shown.
- **Priority:** Medium

### TC-007 — Filter completed items

- **Preconditions:** At least one completed item exists
- **Steps:**
  1. Click the "Completed" filter link in the footer
- **Expected Result:** Only completed items are shown.
- **Priority:** Medium

### TC-008 — Clear completed items

- **Preconditions:** At least one item is marked as completed
- **Steps:**
  1. Click "Clear completed" button
- **Expected Result:** All completed items are removed. Only active items remain.
- **Priority:** Medium

### TC-009 — Toggle all items as completed

- **Preconditions:** Multiple active items exist
- **Steps:**
  1. Click the "toggle all" checkbox (chevron icon)
- **Expected Result:** All items are marked as completed. Item count shows "0 items left".
- **Priority:** Medium

### TC-010 — Edit a todo item by double-clicking

- **Preconditions:** At least one item exists
- **Steps:**
  1. Double-click on the label of "Buy groceries"
  2. Clear the text and type "Buy organic groceries"
  3. Press Enter
- **Expected Result:** The item text updates to "Buy organic groceries".
- **Priority:** Medium

---

## Negative Flows

### TC-011 — Empty input should not create a todo

- **Preconditions:** Page is loaded
- **Steps:**
  1. Click the input field
  2. Press Enter without typing anything
- **Expected Result:** No todo item is created. The list remains empty.
- **Priority:** High

### TC-012 — Whitespace-only input should not create a todo

- **Preconditions:** Page is loaded
- **Steps:**
  1. Type "   " (only spaces) in the input field
  2. Press Enter
- **Expected Result:** No todo item is created. The list remains empty.
- **Priority:** High

### TC-013 — Editing a todo to empty text removes it

- **Preconditions:** At least one item exists
- **Steps:**
  1. Double-click on the item label
  2. Clear all text
  3. Press Enter
- **Expected Result:** The item is removed from the list.
- **Priority:** Medium

---

## Edge Cases

### TC-014 — Add a todo with special characters

- **Preconditions:** Page is loaded
- **Steps:**
  1. Type `<script>alert('xss')</script>` in the input field
  2. Press Enter
- **Expected Result:** The item is created with the literal text displayed (no script execution). No XSS vulnerability.
- **Priority:** Medium

### TC-015 — Add a duplicate todo item

- **Preconditions:** "Buy groceries" already exists in the list
- **Steps:**
  1. Type "Buy groceries" in the input field
  2. Press Enter
- **Expected Result:** A second "Buy groceries" item is added. Duplicates are allowed.
- **Priority:** Low

### TC-016 — Add a todo with a very long text

- **Preconditions:** Page is loaded
- **Steps:**
  1. Type a string of 500 characters in the input field
  2. Press Enter
- **Expected Result:** The item is created and displayed (may be truncated visually but the full text is stored).
- **Priority:** Low

### TC-017 — Persist todos after page reload

- **Preconditions:** At least one todo item exists
- **Steps:**
  1. Add "Persistent item"
  2. Reload the page
- **Expected Result:** "Persistent item" still appears in the list after reload.
- **Priority:** Medium

### TC-018 — Item count grammar — singular vs plural

- **Preconditions:** Page is loaded
- **Steps:**
  1. Add one item → check count text
  2. Add a second item → check count text
- **Expected Result:** With 1 item: "1 item left". With 2 items: "2 items left".
- **Priority:** Low

---

## Ambiguities and Gaps in the Acceptance Criteria

1. **"Create a todo list"** — The AC does not specify whether this means simply navigating to the page (the list exists by default) or performing an explicit creation action. Interpreted as: the list is present on page load.
2. **"Add items (4)"** — The AC says to add 4 items but does not specify the content of those items. Test uses representative item names.
3. **"Finish item"** — It is unclear whether "finish" means toggling the checkbox (marking as complete) or some other action. Interpreted as: clicking the toggle checkbox.
4. **"Remove item from the list"** — The AC does not specify which item to remove. Test removes one of the four added items.
5. **Persistence** — The AC does not mention whether todos should survive a page reload. The app uses localStorage, so this is tested as an edge case.
6. **Editing** — The AC does not mention editing existing items. Covered as an additional positive flow since the app supports it.
7. **Filtering** — The AC does not mention the Active/Completed/All filter tabs. Covered as additional positive flows.
8. **Maximum number of items** — No upper bound is specified for the number of todos.
