import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check page title
    await expect(page.locator('h1, h2')).toContainText(/connexion|login/i);

    // Check login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Check for validation messages
    await expect(page.locator('text=/requis|required/i')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Submit
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator('text=/erreur|invalid|incorrect/i')).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe('Landing Page', () => {
  test('should display landing page for unauthenticated users', async ({ page }) => {
    await page.goto('/');

    // Check for main elements
    await expect(page.locator('h1')).toBeVisible();

    // Check for CTA buttons
    const loginButton = page.locator('a[href="/login"], button:has-text("Connexion")');
    const registerButton = page.locator('a[href="/register"], button:has-text("Inscription")');

    // At least one auth action should be visible
    await expect(loginButton.or(registerButton)).toBeVisible();
  });
});

test.describe('Dashboard Access', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/settings');

    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure on login page', async ({ page }) => {
    await page.goto('/login');

    // Check heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/login');

    // Check that inputs have associated labels
    const emailInput = page.locator('input[type="email"]');
    const emailLabel = await emailInput.getAttribute('aria-label')
      || await emailInput.getAttribute('placeholder')
      || await page.locator('label[for="' + await emailInput.getAttribute('id') + '"]').textContent();

    expect(emailLabel).toBeTruthy();
  });
});
