Write Playwright tests for creating a new program on Didaxis Studio.

## App context (from manual inspection)

- Login page: [https://test.didaxis.studio/login](https://test.didaxis.studio/login)
  - Email field: placeholder="you@college.edu"
  - Password field: placeholder="Your password"
  - Sign In button: getByRole('button', { name: 'Sign In' })
- Programs page: /programs
  - "New Program" button: getByRole('button', { name: '+ New Program' })
  - Modal form:
    - Program Name: placeholder="e.g. Computer Science BSc"
    - Description: placeholder="Brief description"
    - Create button: getByRole('button', { name: 'Create' })

## Credentials

Use dotenv. Read email and password from process.env:

- process.env.DIDAXIS_EMAIL
- process.env.DIDAXIS_PASSWORD
Do NOT hardcode credentials in the test file.

## Test plan

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

## Requirements

- TypeScript
- Use Playwright locators (getByRole, getByLabel, getByText)
- Login as the first step in each test (or use beforeEach)
- Each test is independent
- Use unique test data with Date.now() suffix
- Save as tests/ds1-create-program.spec.ts
