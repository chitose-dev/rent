import { test, expect } from '@playwright/test';

test.describe('レスポンシブ対応', () => {
  test('モバイルでも予約ページが正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('./reserve.html');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title).toContain('トクノリレンタカー');
  });

  test('タブレットでも予約ページが正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('./reserve.html');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title).toContain('トクノリレンタカー');
  });

  test('デスクトップで予約ページが正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('./reserve.html');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title).toContain('トクノリレンタカー');
  });

  test('モバイルでログインページが正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('./login.html');
    await expect(page.locator('#loginEmail')).toBeVisible();
    await expect(page.locator('#loginPassword')).toBeVisible();
  });

  test('モバイルで管理者ログインページが正しく表示される', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('./admin/login.html');
    await expect(page.locator('#adminId')).toBeVisible();
    await expect(page.locator('#adminPassword')).toBeVisible();
  });
});
