# RevelApp - 統合設計システム

福祉施設向けゲーミフィケーション支援サービス RevelApp の統合システムです。

## 📁 プロジェクト構成

```
RevelApp_App/
├── customer-portal/    # 顧客ポータル (施設向け)
├── admin-app/         # 運営管理アプリ (社内向け)
├── wordpress-plugin/  # WordPress REST APIプラグイン
└── docs/             # ドキュメント
```

## 🎯 システム概要

### 顧客ポータル（施設向け）
- **ホーム**: 利用状況と統計情報の表示
- **利用者管理**: 契約中の利用者情報管理
- **体調グラフ**: 利用者の体調変化を可視化
- **工賃管理**: 月次工賃の確認と履歴
- **契約情報**: 契約内容の確認
- **変更申請**: 契約内容変更の申請フォーム
- **サポート**: FAQ とお問い合わせ

### 運営管理アプリ（社内向け）
- **変更申請管理**: 施設からの申請対応
- **施設管理**: 契約施設の詳細情報
- **環境構築カレンダー**: メンテナンス予定管理

### WordPress プラグイン
- **REST API**: 顧客ポータルと管理アプリ向けのAPI
- **データベース管理**: 施設、利用者、工賃、申請情報の管理

## 🚀 セットアップ

### 顧客ポータル

```bash
cd customer-portal
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

### 運営管理アプリ

```bash
cd admin-app
npm install
npm run dev
```

ブラウザで http://localhost:3001 を開きます。

### WordPress プラグイン

1. `wordpress-plugin` フォルダを WordPress の `wp-content/plugins/` にコピー
2. WordPress 管理画面からプラグインを有効化
3. データベーステーブルが自動的に作成されます

## 🎨 デザインシステム

### カラーパレット
- **Primary (Purple)**: メインアクション、重要な要素
- **Blue**: 情報、セッション関連
- **Green**: 成功、工賃、ポジティブな指標
- **Orange**: 警告、エネルギー
- **Red**: エラー、削除
- **Cyan**: 補助的な情報

### コンポーネント
- カード型レイアウト
- 統計カード (StatCard)
- グラフ (Recharts)
- フォーム要素

## 📊 データ構造

### 主要テーブル
- `revel_facilities`: 施設情報
- `revel_members`: 利用者情報
- `revel_rewards`: 工賃情報
- `revel_change_requests`: 変更申請
- `revel_contracts`: 契約情報

## 🔐 認証

WordPress 標準ログインを使用:
- 顧客ポータル: Cookie ベース認証
- 管理アプリ: 管理者権限チェック

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 14**: React フレームワーク
- **TypeScript**: 型安全性
- **Tailwind CSS**: スタイリング
- **Recharts**: データ可視化
- **Lucide React**: アイコン

### バックエンド
- **WordPress**: CMS & 認証
- **MySQL**: データベース
- **REST API**: データ通信

### インフラ
- **Vercel**: フロントエンドホスティング
- **Xserver**: WordPress ホスティング

## 📝 実装ロードマップ

### Phase 1: 顧客ポータル MVP ✅
- [x] プロジェクト構造セットアップ
- [x] UIコンポーネント作成
- [x] ダッシュボード実装
- [x] 利用者管理ページ
- [x] 体調グラフページ
- [x] 工賃ページ
- [x] 契約情報ページ
- [x] 変更申請フォーム

### Phase 2: DB本構築
- [ ] テーブル設計の最終調整
- [ ] サンプルデータ投入
- [ ] API 実装完了

### Phase 3: 運営管理アプリ v1
- [ ] 変更申請対応UI
- [ ] 施設管理UI
- [ ] メンテナンスカレンダー

## 🌐 API エンドポイント

### 顧客ポータルAPI (`/wp-json/revel/v1/`)
- `GET /home` - ホーム画面データ
- `GET /members` - 利用者一覧
- `GET /rewards` - 工賃情報
- `GET /contract` - 契約情報
- `GET /change-requests` - 申請履歴
- `POST /change-requests` - 申請作成

### 運営管理API (`/wp-json/revel-admin/v1/`)
- `GET /change-requests` - 全申請一覧
- `PUT /change-requests/:id` - 申請ステータス更新
- `GET /facilities` - 施設一覧
- `GET /facilities/:id` - 施設詳細

## 📖 使い方

### 変更申請の流れ

1. **施設側**: 顧客ポータルから変更申請
2. **システム**: 申請データを保存、ステータス「確認中」
3. **運営側**: 管理アプリで申請を確認・承認
4. **システム**: 反映日に自動適用
5. **施設側**: ポータルで変更内容を確認

## 🤝 コントリビューション

このプロジェクトは RevelApp 運営チーム専用です。

## 📄 ライセンス

Proprietary - RevelApp Team

## 🆘 サポート

技術的な質問や問題がある場合:
- Email: dev@revelapp.example.com
- Slack: #revelapp-dev

---

**Version**: 1.0.0
**Last Updated**: 2024-12-24
**Author**: RevelApp Development Team
