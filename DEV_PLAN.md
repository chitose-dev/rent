# トクノリレンタカー 開発プラン

最終更新: 2026-02-21 01:25 JST

## 現状サマリー
- **バックエンド**: ✅ 完成（Cloud Run稼働中）
- **管理画面**: ✅ 完成（API連携済み）
- **ユーザー向けフロント**: ⚠️ API繋ぎ込み必要

---

## TODO（優先順）

### P1: ユーザー認証フロー
- [x] `login.html` - `/v1/auth/login` API連携
- [x] `login.html` - `/v1/auth/register` API連携（新規登録）
- [x] `verify-email.html` - `/v1/auth/verify-email` API連携
- [x] `reset-password.html` - パスワードリセットAPI連携

### P2: 予約フロー
- [x] `reserve-confirm.html` - `/v1/reservations` API連携（予約作成）
- [x] `reserve-payment.html` - Stripe決済連携
- [x] 予約完了後のリダイレクト処理

### P3: マイページ
- [x] `mypage-rental.html` - `/v1/user/reservations` API連携
- [x] `mypage-history.html` - 予約履歴表示
- [x] `mypage-profile.html` - `/v1/user/profile` API連携
- [x] `cancel-request.html` - キャンセル申請API連携

### P4: その他
- [x] エラーハンドリング統一
- [x] ローディング表示
- [x] トークンリフレッシュ処理

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
