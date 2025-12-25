# WordPress JWT 認証トラブルシューティング

## 現在の問題

WordPress REST API全体が認証でブロックされており、JWT認証エンドポイントにアクセスできません。

### 症状

```bash
curl https://customer-portal.revelapp.jp/wp-json/
# → 302 Redirect to wp-login.php

curl https://customer-portal.revelapp.jp/wp-json/jwt-auth/v1/token
# → 302 Redirect to wp-login.php
```

## 原因の可能性

1. **セキュリティプラグインがREST APIをブロック**
   - Wordfence
   - iThemes Security
   - All In One WP Security
   - その他のセキュリティプラグイン

2. **REST API無効化プラグイン**
   - Disable REST API
   - WP REST API Controller

3. **カスタムコードでREST APIを制限**
   - functions.php内の他のフィルター
   - プラグインによる制限

## 解決方法

### 方法 1: セキュリティプラグインの設定確認（最も可能性が高い）

#### Wordfence の場合:

1. WordPress管理画面にログイン
2. **Wordfence** → **Firewall** → **Manage Firewall**
3. **Protection Level** を確認
4. **Advanced Firewall Options** を開く
5. 以下の設定を探す:
   - "Immediately block the IP of users who try to sign in as these usernames"
   - **REST APIに関する設定**を探してオフにする

または、より簡単な方法:

**Wordfence** → **All Options** で検索: `rest`

見つかったオプション:
- `Disable WordPress REST API` → **オフにする**
- `Block unauthenticated REST API requests` → **オフにする**

#### iThemes Security の場合:

1. **Security** → **Settings** → **WordPress Tweaks**
2. "Disable REST API" → **オフにする**
3. "XML-RPC" → `Disable XML-RPC` のチェックを外す

### 方法 2: プラグインの一時的な無効化

**テスト用に全プラグインを無効化:**

1. WordPress管理画面 → **プラグイン**
2. すべてのプラグインにチェック
3. 一括操作 → **無効化**
4. JWT Authentication プラグインだけ有効化
5. curlでテスト

動作すれば、1つずつプラグインを有効化して原因を特定。

### 方法 3: functions.php でREST API全体を許可

**子テーマの `functions.php` に追加:**

```php
// REST API全体を認証なしで許可（開発環境のみ！）
add_filter('rest_authentication_errors', function($result) {
    // すでにエラーがある場合はそのまま返す
    if (is_wp_error($result)) {
        return $result;
    }

    // JWT認証エンドポイントは常に許可
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/jwt-auth/v1/') !== false) {
        return true;
    }

    // その他のREST APIも許可（開発環境のみ）
    return true;
}, 1); // 優先度を1に設定（早く実行）
```

**重要:** これは開発環境のみ！本番環境では適切な認証を設定すること。

### 方法 4: .htaccess でREST APIヘッダーを許可

既存の `.htaccess` に以下が **確実に** 含まれているか確認:

```apache
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /

# JWT Authentication - Authorization ヘッダーを許可
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]

# WordPressのデフォルトルール
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
```

### 方法 5: wp-config.php で REST API を強制的に有効化

`wp-config.php` に追加:

```php
// REST APIを強制的に有効化
define('REST_API_ENABLED', true);
```

## 確認コマンド

### 1. REST API root が動作するか確認

```bash
curl https://customer-portal.revelapp.jp/wp-json/
```

**期待される結果:**
```json
{
  "name": "サイト名",
  "description": "...",
  "url": "https://customer-portal.revelapp.jp",
  "routes": {...}
}
```

### 2. JWT プラグインエンドポイント確認

```bash
curl https://customer-portal.revelapp.jp/wp-json/jwt-auth/v1
```

**期待される結果:**
```json
{
  "namespace": "jwt-auth/v1",
  "routes": {
    "/jwt-auth/v1": {...},
    "/jwt-auth/v1/token": {...}
  }
}
```

### 3. トークン取得テスト

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
  "user_nicename": "admin",
  "user_display_name": "Admin"
}
```

## 開発用一時的な回避策

WordPress側の問題が解決するまで、開発を続けるための方法:

### オプションA: モックトークンで開発

`customer-portal/lib/auth/wordpress.ts` を一時的に変更:

```typescript
export async function verifyWordPressToken(authHeader: string | null): Promise<AuthenticatedUser> {
  // 開発環境でのみモックトークンを許可
  if (process.env.NODE_ENV === 'development' && authHeader === 'Bearer dev-token') {
    // テストユーザーを返す
    const user = await prisma.user.findUnique({
      where: { id: 'test-user-staff-001' },
      include: { facility: true }
    });

    if (user) return user as AuthenticatedUser;
  }

  // 通常のJWT認証処理...
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('No authentication token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, process.env.WORDPRESS_JWT_SECRET!) as WordPressJWTPayload;

  const user = await prisma.user.findUnique({
    where: { wordpressUserId: decoded.data.user.id },
    include: { facility: true }
  });

  if (!user) throw new NotFoundError('User');

  return user as AuthenticatedUser;
}
```

**使い方:**

```bash
# モックトークンでAPIテスト
curl http://localhost:3000/api/facilities \
  -H "Authorization: Bearer dev-token"
```

### オプションB: 認証を一時的にスキップ

開発中のみ認証をスキップする環境変数を追加:

`.env.local`:
```bash
# 開発中のみ認証をスキップ（本番では絶対にfalse!）
SKIP_AUTH_IN_DEV=true
```

`lib/auth/wordpress.ts`:
```typescript
export async function verifyWordPressToken(authHeader: string | null): Promise<AuthenticatedUser> {
  // 開発環境で認証スキップが有効な場合
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_AUTH_IN_DEV === 'true') {
    console.warn('⚠️  WARNING: Authentication is SKIPPED in development mode!');

    // デフォルトのテストユーザーを返す
    const user = await prisma.user.findFirst({
      where: { role: 'STAFF' },
      include: { facility: true }
    });

    if (user) return user as AuthenticatedUser;
  }

  // 通常の認証処理...
}
```

## 本番環境への移行

WordPress REST API が正常に動作したら:

1. `.env.local` の `SKIP_AUTH_IN_DEV` を削除
2. モックトークンのコードを削除
3. 正規のWordPress JWTトークンでテスト
4. Vercelにデプロイ

## チェックリスト

- [ ] WordPress REST API root (`/wp-json/`) が動作する
- [ ] JWT Authentication プラグインが有効
- [ ] JWT エンドポイント (`/wp-json/jwt-auth/v1`) が動作する
- [ ] トークン取得エンドポイントが200を返す
- [ ] 取得したトークンでAPIアクセスできる
- [ ] セキュリティプラグインの設定確認
- [ ] .htaccess にAuthorizationヘッダー許可設定
- [ ] wp-config.php にJWT設定

## サポートが必要な場合

1. WordPress管理画面にアクセスできるか確認
2. 有効化されているプラグインのリストを確認
3. 特にセキュリティ関連のプラグイン設定を確認
4. 必要に応じてプラグインを一時的に無効化してテスト
