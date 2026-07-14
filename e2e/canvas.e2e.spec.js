import { expect, test } from '@playwright/test'

test.describe('Canvas E2E interactions', () => {
  test('shows Moveable controls when an object is selected', async ({ page }) => {
    await page.goto('/')

    const object = page.getByTestId('canvas-object-1')
    await expect(object).toBeVisible()

    await object.click()

    await expect(page.locator('.moveable-control-box')).toHaveCount(1)
  })

  test('clears selection and hides Moveable when clicking backdrop', async ({ page }) => {
    await page.goto('/')

    const object = page.getByTestId('canvas-object-1')
    await object.click()

    await expect(page.locator('.moveable-control-box')).toHaveCount(1)

    const canvasArea = page.getByTestId('canvas-area')
    await canvasArea.click({ position: { x: 20, y: 20 } })

    await expect(page.locator('.moveable-control-box')).toHaveCount(0)
  })
})
