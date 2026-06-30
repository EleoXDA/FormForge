import { test, expect } from '@playwright/test'
import { contactForm, seedEditorForm, fillFieldByLabel } from './helpers'

/**
 * Runtime renderer flows. The Preview page uses the same SchemaRenderer that
 * powers the public runner, so these cover rendering, client-side validation,
 * and submission deterministically without a backend.
 *
 * Backend-dependent flows (publishing, public /f/:slug submission, dashboard
 * listing and embed) require a configured Supabase project and are intentionally
 * not asserted here so the suite stays green without secrets.
 */
test.describe('Runtime renderer', () => {
  test.beforeEach(async ({ page }) => {
    await seedEditorForm(page, contactForm())
  })

  test('renders the seeded form fields', async ({ page }) => {
    await page.goto('/preview/demo')

    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible()
    await expect(page.getByText('Full Name')).toBeVisible()
    await expect(page.getByText('Email Address')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send' })).toBeVisible()
  })

  test('blocks submission when required fields are empty', async ({ page }) => {
    await page.goto('/preview/demo')

    await page.getByRole('button', { name: 'Send' }).click()

    // Validation messages appear and the success screen is not shown.
    await expect(page.getByText('This field is required').first()).toBeVisible()
    // The accessible error summary lists what needs fixing.
    await expect(page.getByRole('alert').first()).toContainText('Please fix')
    await expect(page.getByText('Thanks for reaching out!')).toBeHidden()
  })

  test('submits successfully when required fields are filled', async ({ page }) => {
    await page.goto('/preview/demo')

    await fillFieldByLabel(page, 'Full Name', 'Ada Lovelace')
    await fillFieldByLabel(page, 'Email Address', 'ada@example.com')

    await page.getByRole('button', { name: 'Send' }).click()

    await expect(page.getByText('Thanks for reaching out!')).toBeVisible()
  })
})
