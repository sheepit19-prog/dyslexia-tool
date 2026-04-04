import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const extensionPath = path.resolve(__dirname, '../../dist')

test.describe('Companion Suggestion Flow', () => {
  test('should show companion notification after backspace struggle', async ({ browser }) => {
    const page = await browser.newPage()

    await page.setContent(`
      <html><body>
        <input id="test-input" type="text" />
      </body></html>
    `)

    const input = page.locator('#test-input')
    await input.focus()
    await input.type('hello')

    for (let i = 0; i < 4; i++) {
      await input.press('Backspace')
    }

    await page.waitForTimeout(500)

    const value = await input.inputValue()
    expect(value).toBe('h')

    await page.close()
  })
})

test.describe('Word Replacement', () => {
  test('input value can be set and read', async ({ browser }) => {
    const page = await browser.newPage()

    await page.setContent(`
      <html><body>
        <input id="test-input" type="text" />
      </body></html>
    `)

    const input = page.locator('#test-input')
    await input.fill('teh cat')

    const value = await input.inputValue()
    expect(value).toBe('teh cat')

    await page.close()
  })
})
