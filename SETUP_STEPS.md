# MacBookでの最新コード反映手順

## 1. 開発サーバーを停止

現在実行中の開発サーバーを停止してください：
- ターミナルで `Ctrl + C` を押す

## 2. 最新のコードを取得

```bash
cd ~/path/to/RevelApp_App
git pull origin claude/design-revelapp-architecture-gCfw8
```

または、パスが不明な場合：

```bash
# 現在のディレクトリを確認
pwd

# RevelApp_App ディレクトリに移動
cd /path/to/RevelApp_App

# 最新のコードを取得
git pull origin claude/design-revelapp-architecture-gCfw8
```

## 3. 開発サーバーを再起動

```bash
cd customer-portal
npm run dev
```

## 4. APIテスト（新しいターミナルで）

開発サーバーが起動したら、**別のターミナルウィンドウ**で：

```bash
# 事業所情報取得
curl http://localhost:3000/api/facilities \
  -H "Authorization: Bearer dev-token" \
  -s | jq '.'

# 統計情報取得
curl http://localhost:3000/api/facilities/stats \
  -H "Authorization: Bearer dev-token" \
  -s | jq '.'
```

## 期待される結果

### /api/facilities の成功例：

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
        "email": "member1@revelapp.jp"
      }
    ],
    "games": [
      {
        "id": "ikaruga-lv1",
        "name": "斑鳩",
        "level": 1
      }
    ]
  }
}
```

### /api/facilities/stats の成功例：

```json
{
  "stats": {
    "activeMemberCount": 3,
    "monthlyPlayCount": 4,
    "previousMonthWage": {
      "year": 2024,
      "month": 12,
      "totalAmount": 52000
    }
  }
}
```

## トラブルシューティング

### エラー: "Invalid authentication token"

**原因:** まだ古いコードが動作している

**解決策:**
1. 開発サーバーを完全に停止（Ctrl+C）
2. `git pull` で最新コードを取得
3. 開発サーバーを再起動

### エラー: "Can't reach database server"

**原因:** Supabase接続情報が設定されていない

**解決策:**
```bash
# .env.local ファイルを確認
cat customer-portal/.env.local

# DATABASE_URL が正しく設定されているか確認
# 期待される内容: postgresql://postgres.myfpkgydkikmfrpspjtq:...
```

### 開発サーバーが起動しない

**原因:** ポート3000が使用中

**解決策:**
```bash
# ポート3000を使用中のプロセスを確認
lsof -ti:3000

# プロセスを終了
lsof -ti:3000 | xargs kill -9

# 再度起動
npm run dev
```

## 確認ポイント

開発サーバーの起動時に以下のメッセージが表示されるはずです：

```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 3s
```

また、APIリクエスト時にターミナルに以下の警告が表示されます：

```
⚠️  WARNING: Using development mock token! This should NEVER be used in production.
```

この警告が表示されれば、開発用トークンが正しく動作しています！
