# Vercel デプロイメント戦略

## 現状確認

- **フロントエンド**: Next.js (`customer-portal/`)
- **バックエンド**: Express + Prisma (`backend/`)
- **既存サイト**: https://customer-portal.revelapp.jp/
- **希望**: Vercel でホスティング

---

## Vercel デプロイの選択肢

### 🏆 推奨: Option A - Next.js API Routes 統合

**構成:**
```
customer-portal/
├── app/
│   ├── api/              ← バックエンドロジック（新規）
│   │   ├── auth/route.ts
│   │   ├── facilities/route.ts
│   │   ├── members/route.ts
│   │   ├── health/route.ts
│   │   └── wages/route.ts
│   └── app/              ← フロントエンド（既存）
├── prisma/               ← backend/prisma から移動
│   └── schema.prisma
└── lib/                  ← サービス層
    ├── prisma.ts
    ├── services/
    └── utils/
```

**メリット:**
- ✅ Vercel 完全ネイティブ対応
- ✅ 単一プロジェクトで完結
- ✅ サーバーレス自動スケール
- ✅ 作成した Prisma スキーマそのまま使用可能
- ✅ WordPress JWT 認証も実装可能
- ✅ デプロイが超簡単（`vercel deploy`）
- ✅ 環境変数管理が容易

**デメリット:**
- ⚠️ Express コードを Next.js API Routes に書き換え必要
- ⚠️ サーバーレス環境の制約（実行時間制限など）

**実装イメージ:**
```typescript
// app/api/facilities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWordPressToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // WordPress認証
    const user = await verifyWordPressToken(req);

    // ビジネスロジック
    const facility = await prisma.facility.findUnique({
      where: { id: user.facilityId }
    });

    return NextResponse.json({ facility });
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
```

---

### Option B - Express を Vercel Serverless Functions 化

**構成:**
```
RevelApp_App/
├── api/                  ← Expressアプリ（backend/src から移動）
│   └── index.ts          ← Vercel Serverless Function
├── customer-portal/      ← Next.js（変更なし）
└── vercel.json           ← Vercel設定
```

**vercel.json:**
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ]
}
```

**メリット:**
- ✅ Express コードをほぼそのまま使用可能
- ✅ 既存の Express 構成を活かせる

**デメリット:**
- ⚠️ やや複雑な構成
- ⚠️ コールドスタート問題
- ⚠️ デプロイ設定が複雑
- ⚠️ Vercel のベストプラクティスではない

---

### Option C - バックエンド別サービス分離

**構成:**
- **フロントエンド**: Vercel（Next.js）
- **バックエンド**: Railway / Render / Fly.io（Express）

**Railway 例:**
```
- customer-portal.revelapp.jp → Vercel
- api.revelapp.jp → Railway (Express)
```

**メリット:**
- ✅ Express をそのまま使用
- ✅ 従来型のサーバー環境
- ✅ WebSocket など自由に使用可能

**デメリット:**
- ⚠️ 2つのサービスを管理
- ⚠️ CORS 設定必要
- ⚠️ Railway/Render は有料（$5-10/月）
- ⚠️ デプロイが2回必要

---

## 推奨アーキテクチャ詳細（Option A）

### ディレクトリ構造

```
customer-portal/
├── app/
│   ├── api/                      # バックエンドAPI
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── session/route.ts
│   │   ├── facilities/
│   │   │   ├── route.ts          # GET /api/facilities
│   │   │   └── [id]/route.ts     # GET/PATCH /api/facilities/:id
│   │   ├── members/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── games/route.ts
│   │   ├── health/
│   │   │   ├── records/route.ts
│   │   │   └── export/route.ts
│   │   ├── wages/
│   │   │   ├── route.ts
│   │   │   └── [year]/[month]/
│   │   │       ├── route.ts
│   │   │       └── pdf/route.ts
│   │   ├── change-requests/route.ts
│   │   └── notifications/route.ts
│   └── app/                      # フロントエンド（既存）
│       ├── page.tsx
│       ├── members/page.tsx
│       ├── health-graph/page.tsx
│       └── rewards/page.tsx
├── lib/                          # 共通ロジック
│   ├── prisma.ts                 # Prismaクライアント
│   ├── auth/
│   │   ├── wordpress.ts          # WordPress JWT検証
│   │   └── middleware.ts         # 認証ミドルウェア
│   ├── services/                 # ビジネスロジック
│   │   ├── wageCalculation.ts
│   │   ├── pdfGeneration.ts
│   │   └── weatherApi.ts
│   └── utils/
│       ├── errors.ts
│       └── logger.ts
├── prisma/
│   ├── schema.prisma             # backend/prisma から移動
│   ├── migrations/
│   └── seed.ts
├── public/                       # 静的ファイル
└── package.json
```

### WordPress統合（Next.js版）

```typescript
// lib/auth/wordpress.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function verifyWordPressToken(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(
    token,
    process.env.WORDPRESS_JWT_SECRET!
  ) as any;

  // DBからユーザー取得
  const user = await prisma.user.findUnique({
    where: { wordpressUserId: decoded.data.user.id }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
```

### Prisma設定（Next.js版）

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## WordPress セットアップ

### 現在の https://customer-portal.revelapp.jp/ について

**確認が必要:**
- このサイトは何が動いていますか？
  - 作成した Next.js 顧客ポータル？
  - WordPress サイト？
  - 別のもの？

### 2つのシナリオ

#### シナリオ 1: customer-portal.revelapp.jp が Next.js ポータル

```
構成:
- customer-portal.revelapp.jp → Vercel（Next.js顧客ポータル + API）
- wp.revelapp.jp → WordPress（認証・お知らせ管理）
  または
- admin.revelapp.jp → WordPress
```

#### シナリオ 2: customer-portal.revelapp.jp が WordPress

```
構成:
- customer-portal.revelapp.jp → Vercel（Next.js 新顧客ポータル + API）
  ※WordPressから移行
- 既存 WordPress は認証・管理画面専用として継続使用
```

---

## 移行手順（Option A を選択する場合）

### Phase 1: Prisma 移動

```bash
# Prisma スキーマを customer-portal に移動
mv backend/prisma customer-portal/

# 依存関係追加
cd customer-portal
npm install @prisma/client prisma
npm install -D @types/jsonwebtoken
npm install jsonwebtoken axios bcryptjs zod
```

### Phase 2: ライブラリ層作成

```bash
# lib ディレクトリ作成
mkdir -p lib/{auth,services,utils}

# Prisma クライアント作成
# lib/prisma.ts を作成

# WordPress 認証ロジック作成
# lib/auth/wordpress.ts を作成
```

### Phase 3: API Routes 実装

```bash
# APIルート作成（段階的に）
mkdir -p app/api/{auth,facilities,members,health,wages}

# 例: app/api/facilities/route.ts を作成
```

### Phase 4: 環境変数設定

```bash
# Vercel 環境変数
vercel env add DATABASE_URL
vercel env add WORDPRESS_URL
vercel env add WORDPRESS_JWT_SECRET
vercel env add JWT_SECRET
```

### Phase 5: デプロイ

```bash
# Prisma Generate & Migrate
npx prisma generate
npx prisma migrate deploy

# Vercel デプロイ
vercel deploy --prod
```

---

## コスト比較

| 項目 | Option A (Next.js API) | Option C (Express分離) |
|------|------------------------|------------------------|
| フロントエンド | Vercel (無料~$20/月) | Vercel (無料~$20/月) |
| バックエンド | 込み | Railway $5-10/月 |
| データベース | Vercel Postgres $20/月 | Railway Postgres 込み |
| 合計 | $0-40/月 | $5-30/月 |

※ トラフィック量による

---

## 推奨決定フロー

```
START
  ↓
Vercelを使いたい？
  ↓ YES
サーバーレスの制約は許容できる？
（実行時間60秒以内、WebSocket不要など）
  ↓ YES
  → Option A: Next.js API Routes（推奨）

  ↓ NO
  → Option C: Express を Railway/Render

  ↓ Vercel以外も検討可能
  → Option C: Express を Railway/Render
```

---

## 次のアクション

### 今すぐ確認すべきこと

1. **https://customer-portal.revelapp.jp/ の正体確認**
   ```bash
   curl -I https://customer-portal.revelapp.jp/
   ```

2. **WordPress の有無・場所確認**
   - WordPressは既に用意されているか？
   - URL は？

3. **アーキテクチャ決定**
   - Option A（Next.js API Routes）
   - Option B（Express Serverless化）
   - Option C（Express 分離デプロイ）

### 決定後の作業

Option A を選んだ場合:
1. Prisma を customer-portal に移動
2. lib/ ディレクトリ作成
3. API Routes 実装開始
4. フロントエンドを API に接続

---

## まとめ

**Vercel を使いたい場合、Option A（Next.js API Routes）が最適です。**

理由:
- Vercel のネイティブ機能
- 管理が簡単
- コスト効率が良い
- 作成した Prisma スキーマがそのまま使える
- WordPress 認証も問題なく実装可能

次の質問で決定しましょう！
