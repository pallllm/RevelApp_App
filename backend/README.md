# RevelApp Backend API

RevelAppのバックエンドAPIサーバー

## 技術スタック

- **Node.js** - ランタイム
- **Express** - Webフレームワーク
- **TypeScript** - 型安全性
- **Prisma** - ORM
- **PostgreSQL** - データベース
- **WordPress** - 認証・お知らせ管理

## セットアップ

### 1. 依存関係のインストール

```bash
cd backend
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成:

```bash
cp .env.example .env
```

必要な環境変数を設定:
- `DATABASE_URL` - PostgreSQL接続文字列
- `WORDPRESS_URL` - WordPress サイト URL
- `WORDPRESS_JWT_SECRET` - WordPress JWT シークレット
- `JWT_SECRET` - JWT署名用シークレット

### 3. データベースのセットアップ

Prismaマイグレーション実行:

```bash
npm run prisma:migrate
```

Prisma Clientの生成:

```bash
npm run prisma:generate
```

### 4. サーバー起動

開発モード:

```bash
npm run dev
```

本番モード:

```bash
npm run build
npm start
```

## WordPress統合

### WordPress側の設定

1. **JWT Authentication プラグインのインストール**
   - プラグイン: `JWT Authentication for WP REST API`
   - インストール・有効化

2. **wp-config.php に追加**

```php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

3. **.htaccess に追加**

```apache
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
```

### 認証フロー

1. フロントエンドからWordPressにログイン
   ```
   POST https://your-wordpress.com/wp-json/jwt-auth/v1/token
   {
     "username": "user@example.com",
     "password": "password"
   }
   ```

2. JWTトークンを受け取る

3. 以降のAPIリクエストにトークンを付与
   ```
   Authorization: Bearer <token>
   ```

## API エンドポイント

詳細は `/docs/backend-architecture.md` を参照

### 主要エンドポイント

- `GET /health` - ヘルスチェック
- `/api/auth/*` - 認証関連
- `/api/facilities/*` - 事業所管理
- `/api/members/*` - 利用者管理
- `/api/games/*` - ゲーム管理
- `/api/health/*` - 体調記録
- `/api/wages/*` - 工賃管理
- `/api/change-requests/*` - 変更申請
- `/api/notifications/*` - お知らせ

## ディレクトリ構造

```
backend/
├── src/
│   ├── config/          # 設定ファイル
│   ├── middlewares/     # ミドルウェア
│   ├── routes/          # ルート定義
│   ├── controllers/     # コントローラー
│   ├── services/        # ビジネスロジック
│   ├── utils/           # ユーティリティ
│   ├── types/           # 型定義
│   └── index.ts         # エントリーポイント
├── prisma/
│   ├── schema.prisma    # Prismaスキーマ
│   └── migrations/      # マイグレーション
└── tests/               # テスト
```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Prisma Studio（データベースGUI）
npm run prisma:studio

# テスト実行
npm test
```

## 次のステップ

1. PostgreSQLデータベースのセットアップ
2. WordPress JWTプラグインの設定
3. APIルート・コントローラーの実装
4. フロントエンドとの統合
