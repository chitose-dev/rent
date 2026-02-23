import { test, expect } from '@playwright/test';

test.describe('予約フロー', () => {
  test('予約ページが表示される', async ({ page }) => {
    await page.goto('./reserve.html');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title).toContain('トクノリレンタカー');
  });

  test('各予約ページのHTMLファイルが存在する', async ({ request }) => {
    const pages = [
      'reserve.html',
      'reserve-class.html',
      'reserve-options.html',
      'reserve-confirm.html',
      'reserve-complete.html',
      'reserve-payment.html',
    ];
    
    for (const pageName of pages) {
      const response = await request.get(`https://chitose-dev.github.io/rent/${pageName}`);
      expect(response.status()).toBe(200);
    }
  });

  test('利用規約ページが表示される', async ({ page }) => {
    await page.goto('./terms.html');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('プライバシーポリシーページが表示される', async ({ page }) => {
    await page.goto('./privacy.html');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
