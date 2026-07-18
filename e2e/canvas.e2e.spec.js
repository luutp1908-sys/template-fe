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

  test('edits text on double click and commits on blur', async ({ page }) => {
    await page.goto('/')

    const textObject = page.getByText('Your design')
    await textObject.dblclick()

    const editor = page.getByLabel('Text Editor')
    await expect(editor).toBeVisible()
    await editor.fill('Edited title')

    const canvasArea = page.getByTestId('canvas-area')
    await canvasArea.click({ position: { x: 20, y: 20 } })

    await expect(page.getByText('Edited title')).toBeVisible()
  })

  test('cancels text edit on Escape', async ({ page }) => {
    await page.goto('/')

    const textObject = page.getByText('Your design')
    await textObject.dblclick()

    const editor = page.getByLabel('Text Editor')
    await editor.fill('Temporary value')
    await editor.press('Escape')

    await expect(page.getByText('Your design')).toBeVisible()
    await expect(page.getByText('Temporary value')).toHaveCount(0)
  })

  test('auto-grows text layer height while editing', async ({ page }) => {
    await page.goto('/')

    const textLayer = page.getByTestId('canvas-object-2')
    const before = await textLayer.boundingBox()
    if (!before) throw new Error('Text layer bounding box unavailable before edit')

    await page.getByText('Your design').dblclick()
    const editor = page.getByLabel('Text Editor')
    await editor.fill('Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6')

    const canvasArea = page.getByTestId('canvas-area')
    await canvasArea.click({ position: { x: 20, y: 20 } })

    const after = await textLayer.boundingBox()
    if (!after) throw new Error('Text layer bounding box unavailable after edit')

    expect(after.height).toBeGreaterThan(before.height)
  })

  test('opens stock list in left sidebar from add image action', async ({ page }) => {
    await page.goto('/')

    await page.getByTitle('Add Image').click()

    await expect(page.getByLabel('Left Stock Panel')).toBeVisible()
  })

  test('selects a stock image for image layer', async ({ page }) => {
    await page.goto('/')

    await page.getByTitle('Add Image').click()
    await page.getByLabel('Stock Mountain Lake').click()

    await expect(page.locator('img[data-testid^="canvas-image-"]').first()).toHaveAttribute('src', /picsum.photos/)
  })

  test('shows retry when image source fails and can retry render', async ({ page }) => {
    await page.goto('/')

    await page.getByTitle('Add Image').click()
    await page.getByLabel('Stock Mountain Lake').click()

    await page.evaluate(() => {
      const image = document.querySelector('img[data-testid^="canvas-image-"]')
      if (image) {
        image.dispatchEvent(new Event('error'))
      }
    })

    await expect(page.getByText('Failed to load image')).toBeVisible()
    await page.getByRole('button', { name: 'Retry' }).click()
    await expect(page.getByText('Failed to load image')).toHaveCount(0)
  })
})
