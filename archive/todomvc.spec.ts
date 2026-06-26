import { test, expect, type Page } from '@playwright/test';

const APP_URL = 'https://demo.playwright.dev/todomvc/#/';
const TODO_ITEMS = ['Buy groceries', 'Clean the house', 'Walk the dog', 'Read a book'];

function newTodoInput(page: Page) {
  return page.getByPlaceholder('What needs to be done?');
}

function todoItems(page: Page) {
  return page.getByRole('listitem').filter({
    has: page.getByRole('checkbox', { name: 'Toggle Todo' }),
  });
}

function todo(page: Page, text: string) {
  return todoItems(page).filter({ hasText: text });
}

function itemsLeft(page: Page) {
  return page.getByText(/\d+ items? left/);
}

async function addTodos(page: Page, items: string[]) {
  const input = newTodoInput(page);
  for (const item of items) {
    await input.fill(item);
    await input.press('Enter');
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
});

test.describe('Positive Flows', () => {
  test('TC-001: Page loads with correct title and empty todo list', async ({ page }) => {
    await expect(page).toHaveTitle(/TodoMVC/);
    await expect(newTodoInput(page)).toBeVisible();
    await expect(todoItems(page)).toHaveCount(0);
  });

  test('TC-002: Add a single todo item', async ({ page }) => {
    await newTodoInput(page).fill('Buy groceries');
    await newTodoInput(page).press('Enter');

    await expect(todoItems(page)).toHaveCount(1);
    await expect(todo(page, 'Buy groceries')).toHaveText('Buy groceries');
    await expect(itemsLeft(page)).toContainText('1 item left');
  });

  test('TC-003: Add four todo items', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await expect(todoItems(page)).toHaveCount(4);
    for (const item of TODO_ITEMS) {
      await expect(todo(page, item)).toHaveText(item);
    }
    await expect(itemsLeft(page)).toContainText('4 items left');
  });

  test('TC-004: Mark a todo item as completed', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await todo(page, TODO_ITEMS[0]).getByRole('checkbox', { name: 'Toggle Todo' }).check();

    await expect(todo(page, TODO_ITEMS[0])).toHaveClass(/completed/);
    await expect(itemsLeft(page)).toContainText('3 items left');
  });

  test('TC-005: Remove a todo item from the list', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    const walkDog = todo(page, 'Walk the dog');
    await walkDog.hover();
    await walkDog.getByRole('button', { name: 'Delete' }).click();

    await expect(todoItems(page)).toHaveCount(3);
    await expect(todo(page, 'Walk the dog')).toHaveCount(0);
    await expect(itemsLeft(page)).toContainText('3 items left');
  });

  test('TC-006: Filter active items', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await todo(page, TODO_ITEMS[0]).getByRole('checkbox', { name: 'Toggle Todo' }).check();
    await page.getByRole('link', { name: 'Active' }).click();

    await expect(todoItems(page)).toHaveCount(3);
    for (const li of await todoItems(page).all()) {
      await expect(li).not.toHaveClass(/completed/);
    }
  });

  test('TC-007: Filter completed items', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await todo(page, TODO_ITEMS[0]).getByRole('checkbox', { name: 'Toggle Todo' }).check();
    await page.getByRole('link', { name: 'Completed' }).click();

    await expect(todoItems(page)).toHaveCount(1);
    await expect(todo(page, 'Buy groceries')).toHaveText('Buy groceries');
  });

  test('TC-008: Clear completed items', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await todo(page, TODO_ITEMS[0]).getByRole('checkbox', { name: 'Toggle Todo' }).check();
    await todo(page, TODO_ITEMS[1]).getByRole('checkbox', { name: 'Toggle Todo' }).check();
    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(todoItems(page)).toHaveCount(2);
    await expect(itemsLeft(page)).toContainText('2 items left');
  });

  test('TC-009: Toggle all items as completed', async ({ page }) => {
    await addTodos(page, TODO_ITEMS);

    await page.getByRole('checkbox', { name: /mark all as complete/i }).check();

    for (const li of await todoItems(page).all()) {
      await expect(li).toHaveClass(/completed/);
    }
    await expect(itemsLeft(page)).toContainText('0 items left');
  });

  test('TC-010: Edit a todo item by double-clicking', async ({ page }) => {
    await newTodoInput(page).fill('Buy groceries');
    await newTodoInput(page).press('Enter');

    const item = todo(page, 'Buy groceries');
    await item.getByText('Buy groceries', { exact: true }).dblclick();
    const editInput = page.getByRole('textbox', { name: 'Edit' });
    await expect(editInput).toBeVisible();
    await editInput.fill('Buy organic groceries');
    await editInput.press('Enter');

    await expect(todo(page, 'Buy organic groceries')).toHaveText('Buy organic groceries');
  });
});

test.describe('Negative Flows', () => {
  test('TC-011: Empty input should not create a todo', async ({ page }) => {
    await newTodoInput(page).press('Enter');

    await expect(todoItems(page)).toHaveCount(0);
  });

  test('TC-012: Whitespace-only input should not create a todo', async ({ page }) => {
    await newTodoInput(page).fill('   ');
    await newTodoInput(page).press('Enter');

    await expect(todoItems(page)).toHaveCount(0);
  });

  test('TC-013: Editing a todo to empty text removes it', async ({ page }) => {
    await newTodoInput(page).fill('Buy groceries');
    await newTodoInput(page).press('Enter');

    const item = todo(page, 'Buy groceries');
    await item.getByText('Buy groceries', { exact: true }).dblclick();
    const editInput = page.getByRole('textbox', { name: 'Edit' });
    await expect(editInput).toBeVisible();
    await editInput.fill('');
    await editInput.press('Enter');

    await expect(todoItems(page)).toHaveCount(0);
  });
});

test.describe('Edge Cases', () => {
  test('TC-014: Add a todo with special characters', async ({ page }) => {
    const specialText = "<script>alert('xss')</script>";
    await newTodoInput(page).fill(specialText);
    await newTodoInput(page).press('Enter');

    await expect(todoItems(page)).toHaveCount(1);
    await expect(todo(page, specialText)).toHaveText(specialText);
  });

  test('TC-015: Add duplicate todo items', async ({ page }) => {
    await newTodoInput(page).fill('Buy groceries');
    await newTodoInput(page).press('Enter');
    await newTodoInput(page).fill('Buy groceries');
    await newTodoInput(page).press('Enter');

    await expect(todoItems(page)).toHaveCount(2);
    await expect(todo(page, 'Buy groceries')).toHaveCount(2);
  });

  test('TC-016: Add a todo with very long text', async ({ page }) => {
    const longText = 'A'.repeat(500);
    await newTodoInput(page).fill(longText);
    await newTodoInput(page).press('Enter');

    await expect(todoItems(page)).toHaveCount(1);
    await expect(todo(page, longText)).toHaveText(longText);
  });

  test('TC-017: Persist todos after page reload', async ({ page }) => {
    await newTodoInput(page).fill('Persistent item');
    await newTodoInput(page).press('Enter');

    await expect(todoItems(page)).toHaveCount(1);
    await page.reload();

    await expect(todoItems(page)).toHaveCount(1);
    await expect(todo(page, 'Persistent item')).toHaveText('Persistent item');
  });

  test('TC-018: Item count grammar — singular vs plural', async ({ page }) => {
    await newTodoInput(page).fill('First item');
    await newTodoInput(page).press('Enter');

    await expect(itemsLeft(page)).toContainText('1 item left');

    await newTodoInput(page).fill('Second item');
    await newTodoInput(page).press('Enter');

    await expect(itemsLeft(page)).toContainText('2 items left');
  });
});
