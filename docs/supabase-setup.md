# Supabase セットアップ完全ガイド

**無料で始めて、後でVercel Postgresに移行可能！**

---

## 前提条件

- メールアドレス（GitHub アカウント推奨）
- ローカルPCに Node.js インストール済み

---

## Step 1: Supabase アカウント作成

### 1-1. Supabase にアクセス

```
https://supabase.com
```

### 1-2. サインアップ

**「Start your project」** ボタンをクリック

**推奨: GitHub でサインアップ**
- 「Continue with GitHub」をクリック
- GitHub 認証
- Supabase にアクセス許可

または Email でもOK

---

## Step 2: 新しいプロジェクト作成

### 2-1. Organization 作成（初回のみ）

```
Organization name: RevelApp（または好きな名前）
→ Create organization
```

### 2-2. New Project ボタンをクリック

### 2-3. プロジェクト設定

```
Name: revelapp-customer-portal

Database Password: (自動生成されたパスワードをコピー！) 9fQhBw7AP7CjeFW5
               ⚠️ 重要: このパスワードは後で使います

Region: Northeast Asia (Tokyo)  ← 日本から近い
        または
        Northeast Asia (Seoul)

Pricing Plan: Free  ← 無料プラン

→ Create new project ボタンをクリック
```

**待機時間:** 約2-3分（データベースが起動中）

---

## Step 3: データベース接続情報を取得

### 3-1. Settings → Database に移動

左サイドバー:
```
⚙️ Settings → Database
```

### 3-2. Connection String をコピー

**「Connection string」セクションを探す**

```
URI タブを選択

表示される接続文字列:
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
postgresql://postgres:9fQhBw7AP7CjeFW5@db.myfpkgydkikmfrpspjtq.supabase.co:5432/postgres

```

**重要:**
- `[YOUR-PASSWORD]` の部分を、Step 2でコピーしたパスワードに置き換える

**完成例:**
```
postgresql://postgres:your-actual-password-here@db.abcdefghijk.supabase.co:5432/postgres
```

### 3-3. Connection Pooler の接続文字列もコピー（推奨）

**「Connection Pooling」セクション**

```
Mode: Transaction
URI タブを選択

表示される接続文字列:
postgresql://postgres.xxxxx:your-password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**これが Prisma 用の推奨接続文字列です！**

---

## Step 4: ローカル環境変数設定

### 4-1. .env.local を編集

`customer-portal/.env.local` を開いて編集:

```bash
# Database - Supabase
DATABASE_URL="postgresql://postgres.xxxxx:your-password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres"

# WordPress Integration
WORDPRESS_URL=https://customer-portal.revelapp.jp
WORDPRESS_JWT_SECRET=j8kL#mN9pQ2rS5tU7vW0xY3zA6bC9dE2fG5hJ8kL#mN9

# Environment
NODE_ENV=development
```

**2つの接続文字列が必要:**
- `DATABASE_URL` = Connection Pooler（Prismaクエリ用・高速）
- `DIRECT_URL` = Direct Connection（マイグレーション用）

### 4-2. Prisma スキーマを更新

`customer-portal/prisma/schema.prisma` を開いて編集:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // ← この行を追加
}
```

---

## Step 5: Prisma マイグレーション実行

### 5-1. ターミナルでプロジェクトディレクトリに移動

```bash
cd /path/to/RevelApp_App/customer-portal
```

### 5-2. Prisma Client 生成

```bash
npx prisma generate
```

### 5-3. データベースにテーブルを作成

```bash
npx prisma migrate dev --name init
```

**成功すると:**
```
Applying migration `20241225000000_init`
✔ Generated Prisma Client

The following migration(s) have been created and applied:

migrations/
  └─ 20241225000000_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

---

## Step 6: Supabase でデータベース確認

### 方法 A: Supabase ダッシュボード（簡単）

1. Supabase ダッシュボード
2. 左サイドバー → **Table Editor**
3. 作成されたテーブルが表示される:
   - facilities
   - users
   - games
   - facility_games
   - member_games
   - game_play_records
   - health_records
   - wage_phases
   - monthly_wages
   - member_monthly_wages
   - wage_carryovers
   - change_requests
   - change_request_documents
   - notification_reads

### 方法 B: Prisma Studio（ローカル）

```bash
npx prisma studio
```

ブラウザが開いて、データベースのテーブルが見えます。

---

## Step 7: テストデータを追加（任意）

### Supabase SQL Editor で実行

Supabase ダッシュボード → **SQL Editor** → **New query**

```sql
-- テスト用事業所を作成
INSERT INTO facilities (id, name, plan_type, created_at, updated_at)
VALUES (
  'test-facility-001',
  'テスト事業所',
  'FLEXIBLE',
  NOW(),
  NOW()
);

-- テスト用ユーザーを作成（WordPress User ID は仮）
INSERT INTO users (
  id,
  facility_id,
  wordpress_user_id,
  role,
  email,
  name,
  initials,
  status,
  created_at,
  updated_at
)
VALUES (
  'test-user-001',
  'test-facility-001',
  999,
  'STAFF',
  'test@example.com',
  'テストユーザー',
  'TU',
  'ACTIVE',
  NOW(),
  NOW()
);

-- 工賃フェーズを作成
INSERT INTO wage_phases (
  id,
  phase_name,
  min_months,
  max_months,
  level_1_wage,
  level_2_wage,
  level_3_wage,
  level_4_wage,
  created_at
)
VALUES
  (gen_random_uuid(), '0〜3ヶ月', 0, 3, 200, 300, 400, 500, NOW()),
  (gen_random_uuid(), '4〜9ヶ月', 4, 9, 250, 400, 550, 700, NOW()),
  (gen_random_uuid(), '9ヶ月以上', 10, NULL, 300, 500, 700, 1000, NOW());
```

**Run ボタンをクリック**

---

## Step 8: ローカル開発サーバーで動作確認

### 8-1. Next.js 開発サーバー起動

```bash
cd customer-portal
npm run dev
```

### 8-2. API テスト

**ブラウザまたはcurlで:**

```bash
# ヘルスチェック（認証不要）
curl http://localhost:3000/api/facilities

# 401 Unauthorized が返ればOK（認証が必要なため）
```

### 8-3. WordPress ログインしてトークン取得

```bash
curl -X POST https://customer-portal.revelapp.jp/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_wordpress_username",
    "password": "your_wordpress_password"
  }'
```

→ トークンをコピー

### 8-4. 認証付きAPIテスト

```bash
curl http://localhost:3000/api/facilities \
  -H "Authorization: Bearer <コピーしたトークン>"
```

**成功すると:**
```json
{
  "facility": {
    "id": "test-facility-001",
    "name": "テスト事業所",
    "planType": "FLEXIBLE",
    ...
  }
}
```

---

## Step 9: Vercel にデプロイ

### 9-1. Vercel にログイン（まだの場合）

```bash
vercel login
```

### 9-2. プロジェクトをリンク

```bash
vercel link
```

### 9-3. 環境変数を Vercel に追加

**Vercel ダッシュボード:**

1. プロジェクト → Settings → Environment Variables
2. 以下を追加:

```
Name: DATABASE_URL
Value: postgresql://postgres.xxxxx:your-password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
Environments: Production, Preview, Development (全部チェック)

Name: DIRECT_URL
Value: postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres
Environments: Production, Preview, Development (全部チェック)

Name: WORDPRESS_URL
Value: https://customer-portal.revelapp.jp
Environments: Production, Preview, Development

Name: WORDPRESS_JWT_SECRET
Value: j8kL#mN9pQ2rS5tU7vW0xY3zA6bC9dE2fG5hJ8kL#mN9
Environments: Production, Preview, Development
```

### 9-4. デプロイ

```bash
vercel deploy --prod
```

**成功すると:**
```
🔗 Production: https://revelapp-customer-portal.vercel.app
```

---

## ✅ 動作確認

### 本番環境でテスト

```bash
# ヘルスチェック
curl https://revelapp-customer-portal.vercel.app/api/facilities

# WordPress ログイン
curl -X POST https://customer-portal.revelapp.jp/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'

# 認証付きAPI
curl https://revelapp-customer-portal.vercel.app/api/facilities \
  -H "Authorization: Bearer <token>"
```

---

## 🎉 完了！

これで Supabase を使った本番環境が完成しました！

---

## 📊 Supabase 無料プランの制限

```
✅ 含まれるもの:
- 500MB データベースストレージ
- 1GB ファイルストレージ
- 5GB 帯域幅/月
- 50万 エッジリクエスト/月
- 2GB エッジ関数実行時間
- 1日 200MB エッジ関数サイズ
- 7日間のログ保持
- コミュニティサポート

⚠️ 制限:
- プロジェクトが1週間非アクティブだと一時停止
  → 再アクティブ化は簡単（ダッシュボードでクリック）
- 同時接続数: 60
- 自動バックアップなし（手動でエクスポート必要）
```

**十分な容量！**
通常のアプリなら無料プランで問題なく運用できます。

---

## 🔄 将来の Vercel Postgres 移行手順

必要になったら、このガイドに従ってください:

### Step 1: Vercel Postgres 作成

`docs/vercel-postgres-setup.md` の手順に従う

### Step 2: Supabase からデータエクスポート

```bash
# Supabaseダッシュボード → Database → Backups
# または
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

### Step 3: 環境変数を Vercel Postgres に変更

```bash
# Vercel ダッシュボードで環境変数更新
DATABASE_URL → Vercel Postgres の URL に変更
```

### Step 4: マイグレーション実行

```bash
npx prisma migrate deploy
```

### Step 5: データインポート

```bash
psql $DATABASE_URL < backup.sql
```

### Step 6: 動作確認

```bash
curl https://revelapp-customer-portal.vercel.app/api/facilities/stats
```

### 完了！

**ダウンタイム:** 約10-15分
**難易度:** 簡単

---

## トラブルシューティング

### エラー1: "Can't reach database server"

**原因:** 接続文字列が間違っている

**解決:**
1. Supabase → Settings → Database
2. Connection string を再確認
3. パスワードが正しいか確認

### エラー2: "SSL connection required"

**原因:** SSL設定が必要

**解決:**
接続文字列に `?sslmode=require` を追加:
```
postgresql://...@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### エラー3: "Migration failed"

**原因:** DIRECT_URL が設定されていない

**解決:**
```bash
# .env.local に追加
DIRECT_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
```

---

## 🎓 便利な Supabase 機能

### 1. SQL Editor
リアルタイムでSQLを実行・テスト

### 2. Table Editor
GUIでデータ編集（SQLなしでOK）

### 3. Authentication（将来使える）
WordPress の代わりに Supabase Auth も使用可能

### 4. Storage（将来使える）
ファイルアップロード（PDF、画像など）

### 5. Realtime（将来使える）
リアルタイム更新機能

---

## 📚 参考リンク

- Supabase公式: https://supabase.com/docs
- Prisma + Supabase: https://www.prisma.io/docs/guides/database/supabase
- Vercel + Supabase: https://vercel.com/guides/using-supabase-with-vercel

---

お疲れ様でした！🎉
