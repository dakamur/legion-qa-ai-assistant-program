import { test, expect } from '@playwright/test';

const APP_URL = 'https://demo.playwright.dev/todomvc/#/';
const TODO_ITEMS = ['Buy groceries', 'Clean the house', 'Walk the dog', 'Read a book'];

test.beforeEach(async ({ page }) => {
  await page.goto(APP_URL);
});

test.describe('Positive Flows', () => {
  test('TC-001: Page loads with correct title and empty todo list', async ({ page }) => {
    await expect(page).toHaveTitle(/TodoMVC/);
    await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('TC-002: Add a single todo item', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Buy groceries');
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').first()).toHaveText('Buy groceries');
    await expect(page.locator('.todo-count')).toContainText('1 item left');
  });

  test('TC-003: Add four todo items', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    for (const item of TODO_ITEMS) {
      await input.fill(item);
      await input.press('Enter');
    }

    await expect(page.locator('.todo-list li')).toHaveCount(4);
    for (let i = 0; i < TODO_ITEMS.length; i++) {
      await expect(page.locator('.todo-list li').nth(i)).toHaveText(TODO_ITEMS[i]);
    }
    await expect(page.locator('.todo-count')).toContainText('4 items left');
  });

  test('TC-004: Mark a todo item as completed', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    for (const item of TODO_ITEMS) {
      await input.fill(item);
      await input.press('Enter');
    }

    await page.locator('.todo-list li').nth(0).locator('.toggle').check();

    await expect(page.locator('.todo-list li').nth(0)).toHaveClass(/completed/);
    await expect(page.locator('.todo-count')).toContainText('3 items left');
  });

  test('TC-005: Remove a todo item from the list', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    for (const item of TODO_ITEMS) {
      await input.fill(item);
      await input.press('Enter');
    }

    const thirdItem = page.locator('.todo-list li').nth(2);
    await thirdItem.hover();
    await thirdItem.locator('.destroy').click();

    await expect(page.locator('.todo-list li')).toHaveCount(3);
    await expect(page.locator('.todo-list li')).not.toContainText(['Walk the dog']);
    await expect(page.locator('.todo-count')).toContainText('3 items left');
  });

  test('TC-006: Filter active items', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    for (const item of TODO_ITEMS) {
      await input.fill(item);
      await input.press('Enter');
    }

    await page.locator('.todo-list li').nth(0).locator('.toggle').check();
    await page.getByRole('link', { name: 'Active' }).click();

    await expect(page.locator('.todo-list li')).toHaveCount(3);
    for (const li of await page.locator('.todo-list li').all()) {
      await expect(li).not.toHaveClass(/completed/);
    }
  });

  test('TC-007: Filter completed items', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    for (const item of TODO_ITEMS) {
      await input.fill(item);
      await input.press('Enter');
    }

    await page.locator('.todo-list li').nth(0).locator('.toggle').check();
    await page.getByRole('link', { name: 'Completed' }).click();

    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').first()).toHaveText('Buy groceries');
  });

  test('TC-008: Clear completed items', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    for (const item of TODO_ITEMS) {
      await input.fill(item);
      await input.press('Enter');
    }

    await page.locator('.todo-list li').nth(0).locator('.toggle').check();
    await page.locator('.todo-list li').nth(1).locator('.toggle').check();
    await page.getByRole('button', { name: 'Clear completed' }).click();

    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(page.locator('.todo-count')).toContainText('2 items left');
  });

  test('TC-009: Toggle all items as completed', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    for (const item of TODO_ITEMS) {
      await input.fill(item);
      await input.press('Enter');
    }

    await page.locator('label[for="toggle-all"]').click();

    for (const li of await page.locator('.todo-list li').all()) {
      await expect(li).toHaveClass(/completed/);
    }
    await expect(page.locator('.todo-count')).toContainText('0 items left');
  });

  test('TC-010: Edit a todo item by double-clicking', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Buy groceries');
    await input.press('Enter');

    const todoItem = page.locator('.todo-list li').first();
    await todoItem.locator('label').dblclick();
    const editInput = todoItem.locator('.edit');
    await editInput.fill('Buy organic groceries');
    await editInput.press('Enter');

    await expect(page.locator('.todo-list li').first()).toHaveText('Buy organic grcoeries');
  });
});

test.describe('Negative Flows', () => {
  test('TC-011: Empty input should not create a todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('TC-012: Whitespace-only input should not create a todo', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('   ');
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });

  test('TC-013: Editing a todo to empty text removes it', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Buy groceries');
    await input.press('Enter');

    const todoItem = page.locator('.todo-list li').first();
    await todoItem.locator('label').dblclick();
    const editInput = todoItem.locator('.edit');
    await editInput.fill('');
    await editInput.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(0);
  });
});

test.describe('Edge Cases', () => {
  test('TC-014: Add a todo with special characters', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    const specialText = "<script>alert('xss')</script>";
    await input.fill(specialText);
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').first()).toHaveText(specialText);
  });

  test('TC-015: Add duplicate todo items', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Buy groceries');
    await input.press('Enter');
    await input.fill('Buy groceries');
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(2);
    await expect(page.locator('.todo-list li').nth(0)).toHaveText('Buy groceries');
    await expect(page.locator('.todo-list li').nth(1)).toHaveText('Buy groceries');
  });

  test('TC-016: Add a todo with very long text', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    const longText = 'A'.repeat(500);
    await input.fill(longText);
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').first()).toHaveText(longText);
  });

  test('TC-017: Persist todos after page reload', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Persistent item');
    await input.press('Enter');

    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await page.reload();

    await expect(page.locator('.todo-list li')).toHaveCount(1);
    await expect(page.locator('.todo-list li').first()).toHaveText('Persistent item');
  });

  test('TC-018: Item count grammar — singular vs plural', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('First item');
    await input.press('Enter');

    await expect(page.locator('.todo-count')).toContainText('1 item left');

    await input.fill('Second item');
    await input.press('Enter');

    await expect(page.locator('.todo-count')).toContainText('2 items left');
  });
});
