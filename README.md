# レンタカー予約システム フロントエンド

株式会社ビップオート様向けレンタカー予約サイト

## 📁 ファイル一覧

### HTMLファイル
- `index.html` - トップページ
- `reservation.html` - 予約フォーム
- `mypage.html` - マイページ

### CSSファイル
- `all.css` - 参考サイトのベースCSS
- `all_min.css` - 参考サイトのベースCSS（圧縮版）
- `style.css` - 参考サイトのスタイル
- `style_min.css` - 参考サイトのスタイル（圧縮版）
- `style_1__min.css` - 参考サイトの追加スタイル
- `add.css` - 参考サイトの追加スタイル
- `custom.css` - 黄色テーマのカスタムスタイル
- `reservation.css` - 予約フォーム専用スタイル
- `mypage.css` - マイページ専用スタイル

### JavaScriptファイル
- `jquery-3_4_1_min.js` - jQuery
- `app_min.js` - 参考サイトのスクリプト
- `gtm.js` - Google Tag Manager
- `add.js` - 参考サイトの追加スクリプト
- `custom.js` - カスタムスクリプト（ハンバーガーメニュー等）
- `reservation.js` - 予約フォームのロジック
- `mypage.js` - マイページのロジック

## 🚀 使い方

1. すべてのファイルを同じディレクトリに配置
2. ブラウザで `index.html` を開く
3. 動作確認

## 📝 画像について

以下の画像パスを使用していますが、実際の画像ファイルは別途ご用意ください：

```
images/logo.png                # ロゴ
images/main-visual.jpg         # メインビジュアル
images/car-kei.jpg            # 軽自動車画像
images/car-van.jpg            # 商用車画像
images/price-title.png        # 料金表タイトル
images/insurance-title.png    # 保険タイトル
images/flow-title.png         # 流れタイトル
images/faq-title.png          # FAQタイトル
images/shop-title.png         # 店舗情報タイトル
images/check-icon.png         # 完了アイコン
images/reserve-btn.png        # 予約ボタン
images/tel-btn.png            # 電話ボタン
```

### 画像の準備方法

#### オプション1: imagesフォルダを作成して配置
```
rental-car-site/
├── index.html
├── ...
└── images/
    ├── logo.png
    ├── car-kei.jpg
    └── ...
```

#### オプション2: 同じディレクトリに配置して、HTMLを修正
```html
<!-- 例: images/logo.png → logo.png に変更 -->
<img src="logo.png" alt="ロゴ">
```

## ✨ 実装済み機能

### トップページ（index.html）
- ヘッダーナビゲーション（ログイン・マイページ）
- 黄色ベースのデザイン
- 車両クラス・料金表
- 免責保証プラン
- FAQ、店舗情報
- レスポンシブ対応

### 予約フォーム（reservation.html）
- 5ステップの予約フロー
- 車両選択
- 日程・期間選択
- 免責保証選択
- お客様情報入力
- 予約内容確認
- 料金自動計算

### マイページ（mypage.html）
- 予約履歴一覧
- 予約詳細表示
- キャンセル機能
- 登録情報編集
- パスワード変更
- アカウント削除

## 🎨 カスタマイズ

### 色の変更
`custom.css` の `:root` セクションを編集：
```css
:root {
    --primary-color: #FFD700;    /* 黄色 */
    --primary-dark: #FFA500;     /* オレンジ */
}
```

### 料金の変更
`reservation.js` の `vehiclePrices` を編集：
```javascript
const vehiclePrices = {
    'kei': {
        '10': 25000,  // 10日間料金
        '20': 45000,
        '30': 60000
    }
}
```

## 📞 店舗情報

株式会社ビップオート  
住所: 和歌山県岩出市中島804-2  
電話: 0736-62-1122  
営業時間: 9:00〜18:00（水曜定休）

---

**作成日**: 2024年12月27日  
**制作**: 千歳開発
