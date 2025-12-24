# RevelApp API Routes ドキュメント

Next.js API Routes を使用したバックエンド実装

## アーキテクチャ

```
customer-portal/
├── app/api/              # API Routes
│   └── facilities/
│       ├── route.ts      # GET, PATCH /api/facilities
│       └── stats/
│           └── route.ts  # GET /api/facilities/stats
├── lib/                  # 共通ロジック
│   ├── prisma.ts         # Prisma Client
│   ├── auth/
│   │   └── wordpress.ts  # WordPress JWT認証
│   └── utils/
│       ├── errors.ts     # エラークラス
│       └── response.ts   # レスポンスヘルパー
└── prisma/
    └── schema.prisma     # データベーススキーマ
```

## セットアップ

### 1. 環境変数設定

`.env.local` を作成:

```bash
cp .env.example .env.local
```

必須の環境変数:

```bash
# データベース
DATABASE_URL="postgresql://user:password@localhost:5432/revelapp"

# WordPress
WORDPRESS_URL="https://customer-portal.revelapp.jp"
WORDPRESS_JWT_SECRET="your-wordpress-jwt-secret"
```

### 2. Prisma セットアップ

```bash
# Prisma Client生成
npx prisma generate

# データベースマイグレーション（PostgreSQL起動後）
npx prisma migrate dev

# Prisma Studio（データベースGUI）
npx prisma studio
```

## WordPress 統合

### WordPress側の設定

#### 1. JWT Authentication プラグインインストール

プラグイン: [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)

#### 2. wp-config.php に追加

```php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key');
define('JWT_AUTH_CORS_ENABLE', true);
```

#### 3. .htaccess に追加

```apache
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
```

### 認証フロー

```typescript
// 1. WordPressでログイン
const response = await fetch('https://customer-portal.revelapp.jp/wp-json/jwt-auth/v1/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'password',
  }),
});

const { token } = await response.json();

// 2. APIリクエスト時にトークンを使用
const apiResponse = await fetch('/api/facilities', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## API エンドポイント

### 事業所管理

#### GET /api/facilities
現在ログイン中のユーザーの事業所情報を取得

**認証**: 必須
**権限**: すべてのロール

**レスポンス例**:
```json
{
  "facility": {
    "id": "uuid",
    "name": "〇〇事業所",
    "planType": "FLEXIBLE",
    "address": "東京都...",
    "phone": "03-1234-5678",
    "email": "info@example.com",
    "memberCount": 15,
    "members": [...],
    "games": [...]
  }
}
```

#### PATCH /api/facilities
事業所情報を更新

**認証**: 必須
**権限**: STAFF, ADMIN

**リクエストボディ**:
```json
{
  "name": "新しい事業所名",
  "address": "新しい住所",
  "phone": "03-9876-5432"
}
```

**レスポンス例**:
```json
{
  "facility": {...},
  "message": "Facility information updated successfully"
}
```

#### GET /api/facilities/stats
ダッシュボード用統計情報を取得

**認証**: 必須
**権限**: すべてのロール

**レスポンス例**:
```json
{
  "stats": {
    "activeMemberCount": 15,
    "monthlyPlayCount": 127,
    "previousMonthWage": {
      "year": 2025,
      "month": 11,
      "totalAmount": 150000,
      "memberCount": 15,
      "status": "CONFIRMED"
    },
    "totalWages": 1500000,
    "continuationMonths": 12,
    "wagePhase": {
      "phaseName": "9ヶ月以上",
      "level1Wage": 300,
      "level2Wage": 500,
      "level3Wage": 700,
      "level4Wage": 1000
    }
  }
}
```

## 開発ガイド

### 新しいAPI Route の作成

#### 1. ルートファイル作成

```bash
# 例: GET /api/members
mkdir -p app/api/members
touch app/api/members/route.ts
```

#### 2. 基本テンプレート

```typescript
import { NextRequest } from 'next/server';
import { verifyWordPressToken, extractTokenFromHeader } from '@/lib/auth/wordpress';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function GET(request: NextRequest) {
  try {
    // 認証
    const authHeader = extractTokenFromHeader(request.headers);
    const user = await verifyWordPressToken(authHeader);

    // ビジネスロジック
    const data = await prisma.someModel.findMany({
      where: { facilityId: user.facilityId },
    });

    return successResponse({ data });
  } catch (error) {
    return errorResponse(error);
  }
}
```

### エラーハンドリング

利用可能なエラークラス:

```typescript
import {
  ApiError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from '@/lib/utils/errors';

// 使用例
throw new AuthenticationError('Invalid credentials');
throw new AuthorizationError('Access denied');
throw new NotFoundError('User');
throw new ValidationError('Invalid email format');
```

### データベース操作

```typescript
import { prisma } from '@/lib/prisma';

// 検索
const users = await prisma.user.findMany({
  where: { facilityId: user.facilityId },
  include: { facility: true },
});

// 作成
const newUser = await prisma.user.create({
  data: {
    facilityId: user.facilityId,
    name: 'John Doe',
    email: 'john@example.com',
  },
});

// 更新
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: { name: 'Jane Doe' },
});

// 削除
await prisma.user.delete({
  where: { id: userId },
});
```

## 次の実装予定

### 実装すべきAPI Routes

- [ ] `/api/members` - 利用者管理
- [ ] `/api/members/[id]` - 利用者詳細
- [ ] `/api/members/[id]/games` - 利用者ゲーム管理
- [ ] `/api/games` - ゲーム一覧
- [ ] `/api/health/records` - 体調記録
- [ ] `/api/health/records/[userId]/[year]/[month]` - 月次体調記録
- [ ] `/api/health/export` - 体調グラフPDF出力
- [ ] `/api/play-records` - プレイ記録
- [ ] `/api/wages` - 工賃管理
- [ ] `/api/wages/[year]/[month]` - 月次工賃詳細
- [ ] `/api/wages/[year]/[month]/pdf` - 工賃PDF出力
- [ ] `/api/change-requests` - 変更申請
- [ ] `/api/notifications` - お知らせ（WordPress連携）

## テスト

### ローカルテスト

```bash
# 開発サーバー起動
npm run dev

# curlでテスト（認証なし）
curl http://localhost:3000/api/facilities

# curlでテスト（認証あり）
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/facilities
```

### Vercel デプロイ後

```bash
curl https://your-app.vercel.app/api/facilities
```

## トラブルシューティング

### Prisma Client が見つからない

```bash
npx prisma generate
```

### データベース接続エラー

`.env.local` の `DATABASE_URL` を確認

### 認証エラー

1. WordPress JWT プラグインが有効化されているか確認
2. `WORDPRESS_JWT_SECRET` が WordPress と一致しているか確認
3. トークンの有効期限を確認

## 参考リンク

- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT Authentication for WordPress](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
