import { test, expect } from '@playwright/test';

test.describe('管理者画面', () => {
  test('ログインページが表示される', async ({ page }) => {
    await page.goto('./admin/login.html');
    await expect(page.locator('#adminId')).toBeVisible();
    await expect(page.locator('#adminPassword')).toBeVisible();
  });

  test('未認証でダッシュボードにアクセスするとログインにリダイレクト', async ({ page }) => {
    await page.goto('./admin/index.html');
    await page.waitForLoadState('networkidle');
    // ログインページにリダイレクトされる
    expect(page.url()).toContain('login');
  });

  test('各管理ページのHTMLファイルが存在する', async ({ request }) => {
    const pages = [
      'vehicles.html',
      'reservations.html',
      'members.html',
      'classes.html',
      'options.html',
      'insurance.html',
      'pricing.html',
      'settings.html',
    ];
    
    for (const pageName of pages) {
      const response = await request.get(`https://chitose-dev.github.io/rent/admin/${pageName}`);
      expect(response.status()).toBe(200);
    }
  });
});
