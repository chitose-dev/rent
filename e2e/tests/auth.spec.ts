import { test, expect } from '@playwright/test';

test.describe('認証', () => {
  test('ログインページが表示される', async ({ page }) => {
    await page.goto('./login.html');
    await expect(page).toHaveTitle(/ログイン|トクノリレンタカー/);
    await expect(page.locator('#loginEmail')).toBeVisible();
    await expect(page.locator('#loginPassword')).toBeVisible();
  });

  test('新規登録フォームに切り替えできる', async ({ page }) => {
    await page.goto('./login.html');
    // 新規登録タブをクリック
    await page.click('text=新規登録');
    // 登録フォームが表示される
    await expect(page.locator('#registerName')).toBeVisible();
    await expect(page.locator('#registerEmail')).toBeVisible();
  });

  test('管理者ログインページが表示される', async ({ page }) => {
    await page.goto('./admin/login.html');
    await expect(page.locator('#adminId')).toBeVisible();
    await expect(page.locator('#adminPassword')).toBeVisible();
  });
});
