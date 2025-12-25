# Vercel Postgres セットアップ完全ガイド

## 前提条件

- Vercel アカウント（https://vercel.com で無料登録）
- ローカルPCに Node.js インストール済み
- customer-portal プロジェクトをローカルに持っている

---

## Step 1: Vercel CLI インストール

ターミナル（コマンドプロンプト）を開いて：

```bash
npm install -g vercel
```

---

## Step 2: Vercel にログイン

```bash
vercel login
```

**何が起こるか:**
1. ブラウザが自動で開く
2. Vercel ログイン画面が表示される
3. GitHub / GitLab / Bitbucket / Email でログイン
4. 「Continue」をクリック
5. ターミナルに「Success! Logged in as...」と表示される

**うまくいかない場合:**
- 手動でブラウザを開いて https://vercel.com/login にアクセス
- ログイン後、ターミナルの指示に従う

---

## Step 3: プロジェクトディレクトリに移動

```bash
cd /path/to/RevelApp_App/customer-portal
```

**例（Mac/Linux）:**
```bash
cd ~/Desktop/RevelApp_App/customer-portal
```

**例（Windows）:**
```bash
cd C:\Users\YourName\Desktop\RevelApp_App\customer-portal
```

---

## Step 4: Vercel にプロジェクトをリンク

```bash
vercel link
```

**質問される内容と回答例:**

```
? Set up and deploy "~/customer-portal"? [Y/n]
→ Y （Enter）

? Which scope do you want to deploy to?
→ あなたのアカウント名を選択（矢印キーで選択、Enter）

? Link to existing project? [y/N]
→ N （新規プロジェクト）

? What's your project's name?
→ revelapp-customer-portal （または好きな名前）

? In which directory is your code located?
→ ./ （そのまま Enter）

✅ Linked to xxxxxxx/revelapp-customer-portal
```

---

## Step 5: Vercel ダッシュボードで Postgres 作成

### 方法 A: ブラウザから作成（推奨・簡単）

1. **Vercel ダッシュボードを開く**
   ```
   https://vercel.com/dashboard
   ```

2. **プロジェクトを選択**
   - 「revelapp-customer-portal」をクリック

3. **Storage タブに移動**
   - 上部メニュー: Overview / Deployments / Analytics / **Storage** ← ここ

4. **Create Database ボタンをクリック**

5. **Postgres を選択**
   - Postgres のカードをクリック

6. **データベース名を入力**
   ```
   Database Name: revelapp-db
   Region: Washington, D.C., USA (iad1) または Tokyo (hnd1)
   ```

7. **Create ボタンをクリック**

8. **環境変数を接続**
   - 「Connect Project」タブ
   - 「revelapp-customer-portal」を選択
   - Environment: Production, Preview, Development すべてチェック
   - 「Connect」ボタンをクリック

✅ これで環境変数が自動設定されます！

### 方法 B: CLI から作成（コマンド派）

```bash
vercel env pull .env.local
```

これで Vercel の環境変数がローカルにダウンロードされます。

---

## Step 6: 環境変数の確認

### ブラウザで確認:

1. Vercel ダッシュボード
2. プロジェクト → Settings → Environment Variables

以下の変数が自動追加されているはず:
```
POSTGRES_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
POSTGRES_PRISMA_URL  ← Prisma用（重要）
POSTGRES_URL_NO_SSL
```

### ローカルで確認:

```bash
cat .env.local
```

**見つからない場合:**
```bash
vercel env pull .env.local
```

を実行してダウンロード。

---

## Step 7: WordPress 環境変数を追加

Vercel ダッシュボードで追加:

1. Settings → Environment Variables
2. 「Add New」ボタン

追加する変数:

```
Name: WORDPRESS_URL
Value: https://customer-portal.revelapp.jp
Environments: Production, Preview, Development (全部チェック)
→ Save

Name: WORDPRESS_JWT_SECRET
Value: j8kL#mN9pQ2rS5tU7vW0xY3zA6bC9dE2fG5hJ8kL#mN9
Environments: Production, Preview, Development (全部チェック)
→ Save
```

---

## Step 8: Prisma スキーマの DATABASE_URL を更新

`customer-portal/prisma/schema.prisma` を開いて確認:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ← これでOK
}
```

**重要:**
Vercel Postgres の場合、`DATABASE_URL` の代わりに `POSTGRES_PRISMA_URL` を使うと接続プーリングで高速化されます。

変更する場合:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")  // ← 変更
}
```

または `.env.local` で:
```bash
DATABASE_URL=${POSTGRES_PRISMA_URL}
```

---

## Step 9: Prisma マイグレーション実行

ローカルの `.env.local` に環境変数が設定されていることを確認してから:

```bash
cd customer-portal

# Prisma Client 生成（既に実行済みかも）
npx prisma generate

# データベースにテーブルを作成
npx prisma migrate dev --name init
```

**成功すると:**
```
Applying migration `20241225000000_init`
✔ Generated Prisma Client

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20241225000000_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

---

## Step 10: Prisma Studio でデータベース確認

```bash
npx prisma studio
```

ブラウザが開いて、データベースのテーブルが見えます:
- facilities
- users
- games
- health_records
- monthly_wages
- etc.

すべてのテーブルが作成されていればOK！

---

## Step 11: デプロイ

```bash
vercel deploy --prod
```

**成功すると:**
```
🔗 Production: https://revelapp-customer-portal.vercel.app
```

---

## ✅ 動作確認

### 1. ヘルスチェック

```bash
curl https://revelapp-customer-portal.vercel.app/health
```

### 2. API テスト（認証なし）

```bash
curl https://revelapp-customer-portal.vercel.app/api/facilities
```

→ 401 Unauthorized が返ればOK（認証が必要なため）

### 3. WordPress ログインしてトークン取得

```bash
curl -X POST https://customer-portal.revelapp.jp/wp-json/jwt-auth/v1/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'
```

→ トークンをコピー

### 4. API テスト（認証あり）

```bash
curl https://revelapp-customer-portal.vercel.app/api/facilities \
  -H "Authorization: Bearer <コピーしたトークン>"
```

→ データが返ってくればOK！

---

## 🎉 完了！

これで完全にVercel上で動作するバックエンドが完成しました！

---

## トラブルシューティング

### エラー1: "Error: P1001: Can't reach database server"

**原因:** 環境変数が設定されていない

**解決:**
```bash
vercel env pull .env.local
```

### エラー2: "Migration failed"

**原因:** DATABASE_URL が間違っている

**解決:**
`.env.local` を確認:
```bash
cat .env.local | grep DATABASE_URL
```

### エラー3: "Module not found: Can't resolve '@prisma/client'"

**原因:** Prisma Client が生成されていない

**解決:**
```bash
npx prisma generate
```

---

## 料金について

### Vercel Postgres 料金プラン

**Hobby (個人用):**
- 月額: $0（Vercelアカウント無料）
- データベース: 利用不可 ❌

**Pro プラン:**
- 月額: $20
- 含まれるもの:
  - 256MB ストレージ
  - 60時間/月 のコンピュート時間
  - 自動バックアップ
  - コネクションプーリング

**注意:**
Vercel Postgres を使うには **Pro プラン ($20/月)** が必要です。

無料で使いたい場合は Supabase をおすすめします。

---

## 次のステップ

1. ✅ Vercel Postgres セットアップ完了
2. → 残りの API Routes を実装
3. → フロントエンドを API に接続
4. → 本番デプロイ

お疲れ様でした！
