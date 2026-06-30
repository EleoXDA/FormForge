import { test, expect } from '@playwright/test'
import { contactForm, seedEditorForm } from './helpers'

test.describe('Builder', () => {
  test('home page links through to the forms list', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'FormForge' })).toBeVisible()

    await page.getByRole('link', { name: 'Go to Forms' }).click()
    await expect(page).toHaveURL(/\/forms$/)
    await expect(page.getByRole('heading', { name: 'My Forms' })).toBeVisible()
  })

  test('loads the builder in demo mode', async ({ page }) => {
    // Demo mode works regardless of backend configuration.
    await page.goto('/builder/demo')

    // Field palette and the empty canvas are present.
    await expect(page.getByText('Text Inputs')).toBeVisible()
    await expect(page.getByText('Start Building Your Form')).toBeVisible()
  })

  test('renders a seeded form in the canvas and inspector', async ({ page }) => {
    await seedEditorForm(page, contactForm())
    await page.goto('/builder/demo')

    // The persisted schema is hydrated and rendered on the canvas.
    await expect(page.getByText('Full Name').first()).toBeVisible()
    await expect(page.getByText('Email Address').first()).toBeVisible()

    // No field selected yet -> inspector shows its empty hint.
    await expect(page.getByText('Select a field to edit its properties')).toBeVisible()

    // Selecting a field replaces the hint with the property editor.
    await page.getByText('Full Name').first().click()
    await expect(page.getByText('Select a field to edit its properties')).toBeHidden()
  })
})
