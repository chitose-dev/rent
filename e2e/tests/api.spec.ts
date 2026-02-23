import { test, expect } from '@playwright/test';

const API_BASE = 'https://rentcar-backend-dgyxfpofua-an.a.run.app';

test.describe('API疎通確認', () => {
  test('ヘルスチェックAPI', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.status).toBe('ok');
  });

  test('車両クラス一覧API', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/shop/car-classes`);
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBeTruthy();
  });

  test('オプション一覧API', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/shop/options`);
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBeTruthy();
  });

  test('保険プラン一覧API', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/shop/insurance-plans`);
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBeTruthy();
  });

  test('店舗設定API', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/shop/settings`);
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.openTime).toBeDefined();
    expect(json.closeTime).toBeDefined();
  });

  test('時間帯空き状況API', async ({ request }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    const response = await request.get(`${API_BASE}/v1/shop/time-slots?date=${dateStr}`);
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBeTruthy();
  });

  test('認証なしで予約一覧APIにアクセスすると401', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/reservations`);
    expect(response.status()).toBe(401);
  });

  test('認証なしで管理者ダッシュボードAPIにアクセスすると401', async ({ request }) => {
    const response = await request.get(`${API_BASE}/v1/admin/dashboard`);
    expect(response.status()).toBe(401);
  });
});

test.describe('API認証テスト', () => {
  // 管理者認証テストは手動実行推奨（レートリミットがあるため）
  test.skip('管理者ログインAPI', async ({ request }) => {
    const response = await request.post(`${API_BASE}/v1/admin/auth/login`, {
      data: {
        email: 'admin@demo.tokunori.com',
        password: 'demo1234',
      },
    });
    // レートリミットでない場合は成功
    if (response.status() !== 429) {
      expect(response.ok()).toBeTruthy();
      const json = await response.json();
      expect(json.data?.token).toBeDefined();
    }
  });

  test.skip('管理者ログイン後ダッシュボードAPIにアクセスできる', async ({ request }) => {
    // ログイン
    const loginResponse = await request.post(`${API_BASE}/v1/admin/auth/login`, {
      data: {
        email: 'admin@demo.tokunori.com',
        password: 'demo1234',
      },
    });
    
    if (loginResponse.status() === 429) {
      test.skip(); // レートリミットの場合はスキップ
      return;
    }
    
    const loginJson = await loginResponse.json();
    const token = loginJson.data?.token;
    expect(token).toBeDefined();

    // ダッシュボードAPI
    const dashboardResponse = await request.get(`${API_BASE}/v1/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    expect(dashboardResponse.ok()).toBeTruthy();
    const dashboardJson = await dashboardResponse.json();
    expect(dashboardJson.todayReservations).toBeDefined();
  });
});
