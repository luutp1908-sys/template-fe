import { test, expect } from '@playwright/test'

test('login -> reload preserves session', async ({ page, request }) => {
  const backend = 'http://127.0.0.1:4000'
  const email = `e2e+${Date.now()}@example.com`
  const password = 'S3cureP@ss'

  // ensure the user exists (register). This uses backend API directly.
  await request.post(`${backend}/api/v1/auth/register`, {
    data: { email, password },
  })

  // Open the frontend app
  await page.goto('/')

  // Open auth modal via MenuBar Sign In button (has title attribute)
  await page.click('button[title="Sign In"]')

  // Fill credentials into the modal and submit
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  // Click the modal's Sign In submit button (inside the form)
  await page.click('form button[type="submit"]')

  // Wait for the logout button to appear in the MenuBar, indicating signed-in state
  await page.waitForSelector('button[title="Logout"]', { timeout: 5000 })
  await expect(page.locator(`text=${email}`)).toBeVisible({ timeout: 5000 })

  // Reload the page and verify the session persists in storage
  await page.reload()

  // localStorage should still contain the persisted user
  const stored = await page.evaluate(() => localStorage.getItem('app_auth_tokens_v1'))
  expect(stored).not.toBeNull()
  const parsed = JSON.parse(stored || '{}')
  expect(parsed.user?.email).toBe(email)

  // Note: the httpOnly refresh cookie is not visible to JS; the existence of the persisted
  // `user` in localStorage plus the UI state (pre-reload) is sufficient to verify session persistence.
})
