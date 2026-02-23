# E2E テスト

## セットアップ

```bash
cd e2e
npm install
npx playwright install
```

## テスト実行

```bash
# 全テスト実行
npm test

# UI付きで実行
npm run test:ui

# ブラウザを表示して実行
npm run test:headed

# Chromiumのみ
npm run test:chromium

# モバイル（iPhone 13）のみ
npm run test:mobile

# APIテストのみ
npm run test:api

# レポート表示
npm run report
```

## テスト内容

### home.spec.ts
- トップページ表示
- 予約ページ表示

### auth.spec.ts
- ログインページ表示
- 新規登録フォーム切り替え
- バリデーション
- 管理者ログインページ

### reservation.spec.ts
- 日付選択
- 時間選択
- 車両クラス一覧読み込み
- 各予約ページの表示

### admin.spec.ts
- 各管理画面の存在確認
- 未認証時のリダイレクト

### responsive.spec.ts
- モバイル表示
- タブレット表示
- デスクトップ表示

### api.spec.ts
- ヘルスチェック
- 各種API疎通確認
- 認証必須APIの確認
- 管理者認証フロー

## 環境変数

```bash
# 本番以外でテストする場合
BASE_URL=http://localhost:8080 npm test
```
