# ローカル環境でのテスト手順

## 現在の状況

✅ **完了済み:**
1. Supabase データベースセットアップ
2. Prisma スキーマ定義
3. データベースマイグレーション（14テーブル作成済み）
4. テストデータ投入
5. Next.js API Routes 実装（facilities エンドポイント）
6. 開発用認証バイパス実装

⚠️ **WordPress REST API ブロック問題:**
- WordPress の REST API が全体的にブロックされている
- JWT 認証エンドポイントにアクセスできない
- トラブルシューティングガイド: `docs/wordpress-jwt-troubleshooting.md`

---

## ローカルでのテスト方法

### 1. 環境変数の確認

`customer-portal/.env.local` が正しく設定されているか確認:

```bash
cd ~/path/to/RevelApp_App/customer-portal
cat .env.local
```

**期待される内容:**
```bash
# Database - Supabase
DATABASE_URL="postgresql://postgres.myfpkgydkikmfrpspjtq:9fQhBw7AP7CjeFW5@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.myfpkgydkikmfrpspjtq:9fQhBw7AP7CjeFW5@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

# WordPress Integration
WORDPRESS_URL=https://customer-portal.revelapp.jp
WORDPRESS_JWT_SECRET=j8kL#mN9pQ2rS5tU7vW0xY3zA6bC9dE2fG5hJ8kL#mN9

# NextAuth (Optional)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Environment
NODE_ENV=development
```

### 2. 開発サーバー起動

```bash
cd customer-portal
npm run dev
```

**期待される出力:**
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 3s
```

### 3. API テスト（開発用モックトークン）

WordPress REST API問題が解決するまで、開発用モックトークン `dev-token` を使用できます。

#### テスト 1: 認証なしアクセス（401エラーを確認）

```bash
curl http://localhost:3000/api/facilities
```

**期待される結果:**
```json
{
  "error": "No authentication token provided"
}
```

✅ これが返ればAPIは正常に動作しています！

#### テスト 2: 開発用トークンでアクセス

```bash
curl http://localhost:3000/api/facilities \
  -H "Authorization: Bearer dev-token" \
  -s | jq '.'
```

**期待される結果:**
```json
{
  "facility": {
    "id": "test-facility-001",
    "name": "テスト事業所",
    "planType": "FLEXIBLE",
    "address": "東京都渋谷区テスト1-2-3",
    "phone": "03-1234-5678",
    "email": "test@revelapp.jp",
    "memberCount": 3,
    "members": [
      {
        "id": "test-user-member-001",
        "name": "山田太郎",
        "email": "member1@revelapp.jp",
        "role": "MEMBER"
      },
      ...
    ],
    "games": [
      {
        "id": "ikaruga-lv1",
        "name": "斑鳩",
        "level": 1
      },
      ...
    ]
  }
}
```

✅ これが返れば Supabase との接続も成功！

#### テスト 3: 統計情報API

```bash
curl http://localhost:3000/api/facilities/stats \
  -H "Authorization: Bearer dev-token" \
  -s | jq '.'
```

**期待される結果:**
```json
{
  "stats": {
    "activeMemberCount": 3,
    "monthlyPlayCount": 4,
    "previousMonthWage": {
      "year": 2024,
      "month": 12,
      "totalAmount": 52000,
      "memberCount": 3,
      "status": "CONFIRMED"
    },
    "totalWages": 52000,
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

---

## WordPress JWT 認証の修正（本番用）

開発用モックトークンは **本番環境では使えません**。WordPress REST API 問題を解決する必要があります。

### 最も可能性が高い原因: セキュリティプラグイン

WordPress管理画面にログインして確認:

#### Wordfence の場合:

1. **Wordfence** → **Firewall** → **Manage Firewall**
2. **All Options** で検索: `rest`
3. 以下をオフにする:
   - `Disable WordPress REST API`
   - `Block unauthenticated REST API requests`

#### iThemes Security の場合:

1. **Security** → **Settings** → **WordPress Tweaks**
2. `Disable REST API` → **オフ**

### 確認方法

```bash
curl https://customer-portal.revelapp.jp/wp-json/
```

**期待される結果:**
```json
{
  "name": "RevelApp Customer Portal",
  "description": "...",
  "routes": {...}
}
```

❌ **現在の結果:** 302 Redirect to wp-login.php

### JWT トークン取得（WordPress修正後）

```bash
curl -X POST https://customer-portal.revelapp.jp/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Op*^vJLDazO8M3uONK*c1xAp"}'
```

**期待される結果:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user_email": "admin@example.com",
  "user_nicename": "admin"
}
```

### 本番用トークンでAPIテスト

```bash
# トークンを環境変数に保存
export TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# APIテスト
curl http://localhost:3000/api/facilities \
  -H "Authorization: Bearer $TOKEN" \
  -s | jq '.'
```

---

## 開発用モックトークンの仕組み

`customer-portal/lib/auth/wordpress.ts` の先頭に以下が追加されています:

```typescript
// 開発環境でのみモックトークンを許可
if (process.env.NODE_ENV === 'development' && authHeader === 'Bearer dev-token') {
  console.warn('⚠️  WARNING: Using development mock token!');

  // テストユーザー（test-user-staff-001）を返す
  const user = await prisma.user.findUnique({
    where: { id: 'test-user-staff-001' },
    include: { facility: true },
  });

  return user;
}
```

**重要:**
- `NODE_ENV=development` の場合のみ有効
- 本番環境では自動的に無効化される
- テストユーザー（スタッフ）として認証される

---

## データベース確認

### Prisma Studio（ローカルGUI）

```bash
cd customer-portal
npx prisma studio
```

ブラウザが開いて `http://localhost:5555` でデータベースが見えます。

### Supabase ダッシュボード

1. https://supabase.com にアクセス
2. プロジェクト選択: `revelapp-customer-portal`
3. **Table Editor** でテーブル確認

---

## トラブルシューティング

### エラー: "Can't reach database server"

**原因:** 環境変数が読み込まれていない

**解決:**
```bash
# .env.local を確認
cat .env.local

# 開発サーバーを再起動
# Ctrl+C で停止して再度起動
npm run dev
```

### エラー: "User not found in database"

**原因:** テストデータが投入されていない

**解決:**
```bash
# Supabase SQL Editor で docs/supabase-test-data.sql を実行
```

### エラー: "Invalid authentication token"

**原因:** 開発用トークンのスペルミス

**解決:**
```bash
# 正しいトークン: dev-token
curl http://localhost:3000/api/facilities \
  -H "Authorization: Bearer dev-token"
```

---

## 次のステップ

### 現在の優先順位:

1. ✅ **ローカルAPIテスト** - 開発用モックトークンで動作確認
2. ⚠️ **WordPress REST API 問題解決** - セキュリティプラグイン設定確認
3. **残りのAPI実装** - 利用者管理、ゲーム管理、体調記録など
4. **フロントエンド接続** - 既存のUIをAPIに接続
5. **Vercelデプロイ** - 本番環境へのデプロイ

---

## 参考ファイル

- **トラブルシューティング:** `docs/wordpress-jwt-troubleshooting.md`
- **Supabaseセットアップ:** `docs/supabase-setup.md`
- **Vercel Postgresセットアップ:** `docs/vercel-postgres-setup.md`
- **API実装:** `customer-portal/API_README.md`

---

お疲れ様でした！🎉

まずはローカルで開発用モックトークンを使ってAPIが動作することを確認してください。
WordPress REST API の問題は並行して解決していきましょう。
