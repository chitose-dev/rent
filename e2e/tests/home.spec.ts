import { test, expect } from '@playwright/test';

test.describe('ホームページ', () => {
  test('トップページが表示される', async ({ page }) => {
    await page.goto('./');
    // 何らかのページにリダイレクトされることを確認
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toContain('chitose-dev.github.io/rent');
  });

  test('予約ページが表示される', async ({ page }) => {
    await page.goto('./reserve.html');
    await page.waitForLoadState('networkidle');
    // ページが読み込まれることを確認
    const title = await page.title();
    expect(title).toContain('トクノリレンタカー');
  });

  test('ログインページが表示される', async ({ page }) => {
    await page.goto('./login.html');
    await expect(page).toHaveTitle(/ログイン|トクノリレンタカー/);
    await expect(page.locator('#loginEmail')).toBeVisible();
  });
});
