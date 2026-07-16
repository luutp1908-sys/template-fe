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

  test('does not jump on drag start at 200% zoom', async ({ page }) => {
    await page.goto('/')

    const zoomSlider = page.getByLabel('Zoom')
    await zoomSlider.evaluate((el) => {
      el.value = '200'
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
    })

    const object = page.getByTestId('canvas-object-1')
    await expect(object).toBeVisible()

    const before = await object.boundingBox()
    if (!before) throw new Error('Object bounding box not available before drag')

    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2)
    await page.mouse.down()
    await page.mouse.move(before.x + before.width / 2 + 16, before.y + before.height / 2 + 12)
    await page.mouse.up()

    const after = await object.boundingBox()
    if (!after) throw new Error('Object bounding box not available after drag')

    const deltaX = Math.abs(after.x - before.x)
    const deltaY = Math.abs(after.y - before.y)

    expect(deltaX).toBeGreaterThan(1)
    expect(deltaY).toBeGreaterThan(1)
    expect(deltaX).toBeLessThan(80)
    expect(deltaY).toBeLessThan(80)
  })
})
