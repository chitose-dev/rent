# トクノリレンタカー 開発プラン

最終更新: 2026-02-21 11:10 JST

## 現状サマリー
- **バックエンド**: ✅ 完成（Cloud Run稼働中）
- **管理画面**: ✅ 完成（API連携済み）
- **ユーザー向けフロント**: ✅ 基本機能完成（API連携済み）

---

## TODO（優先順）

### P1: ユーザー認証フロー ✅完了
- [x] `login.html` - `/v1/auth/login` API連携
- [x] `login.html` - `/v1/auth/register` API連携（新規登録）
- [x] `verify-email.html` - `/v1/auth/verify-email` API連携
- [x] `reset-password.html` - パスワードリセットAPI連携

### P2: 予約フロー ✅完了
- [x] `reserve-confirm.html` - `/v1/reservations` API連携（予約作成）
- [x] `reserve-payment.html` - Stripe決済連携
- [x] 予約完了後のリダイレクト処理

### P3: マイページ ✅完了
- [x] `mypage-rental.html` - `/v1/user/reservations` API連携
- [x] `mypage-history.html` - 予約履歴表示
- [x] `mypage-profile.html` - `/v1/user/profile` API連携
- [x] `cancel-request.html` - キャンセル申請API連携

### P4: その他 ✅完了
- [x] エラーハンドリング統一
- [x] ローディング表示
- [x] トークンリフレッシュ処理

### P5: 改善タスク（発見された問題）✅完了
- [x] `reserve.html` - 車両クラス・オプション・保険プランをAPIから動的取得
  - 車両クラス: `/v1/car-classes` から取得
  - 料金プラン: `/v1/car-classes/:id/pricing` から取得
  - オプション: `/v1/options` から取得
  - 保険プラン: `/v1/insurance-plans` から取得
  - コミット: ac3739f (2026-02-21)

### P6: 発見された問題（2026-02-21 14:00）
- [ ] デモ管理者アカウント（admin@demo.tokunori.com）がFirestoreに存在しない
  - seed-demo-data.tsの実行が必要
  - ローカルからFirestoreアクセスするGoogle Cloud認証設定がない
  - **対応案**: Cloud Shellから実行 or Firebase Consoleから手動作成

---

## 完了タスク
- [x] Stripe連携（アカウント、APIキー、Webhook）
- [x] Firestoreインデックス全部作成
- [x] 管理画面API連携
- [x] config.js AppConfig後方互換性修正

---

## 自動開発サイクル

毎時00分に以下を実行：
1. このファイルのTODO確認
2. 未完了タスクがあれば実装
3. 自己レビュー（コード品質チェック）
4. テスト実行
5. 問題なければコミット＆プッシュ
6. TODOがなければ全体テスト→問題発見→修正

---

## テスト項目

### ユーザーフロー
1. 新規登録 → メール認証 → ログイン
2. 車両クラス選択 → オプション選択 → 予約確認 → 決済
3. マイページで予約確認
4. キャンセル申請

### 管理者フロー
1. ログイン
2. ダッシュボード表示
3. 予約一覧・受取・返却処理
4. 会員管理
5. 車両・クラス・オプション管理

---

## 本番URL
- フロント: https://chitose-dev.github.io/rent/
- API: https://rentcar-backend-dgyxfpofua-an.a.run.app
