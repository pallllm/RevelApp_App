# フロントエンド動作確認手順

## 1. 開発サーバーが起動していることを確認

```bash
# customer-portalディレクトリで
npm run dev
```

以下のメッセージが表示されていればOK:
```
✓ Ready in 3s
Local: http://localhost:3000
```

## 2. ブラウザでアクセス

### ホームダッシュボード
```
http://localhost:3000/app
```

### 確認ポイント ✅

#### データが正しく表示される:
- **利用者登録数**: 3名（APIから取得）
- **契約プラン**: "RevelAppコース A-フレキシブル"（APIから取得）
- **継続月数**: 0ヶ月（APIから取得）
- **工賃フェーズ**: "0〜3ヶ月 フェーズ"（APIから取得）

#### ローディング状態:
- 最初にスピナーが表示される
- 数秒後にデータが表示される

#### ブラウザのコンソール（開発者ツール）:
1. ブラウザで `Cmd + Option + I`（Mac）を押す
2. **Console** タブを開く
3. 以下の警告メッセージが表示されるはず:

```
⚠️  WARNING: Using development mock token! This should NEVER be used in production.
```

これが表示されれば、開発用トークンが正しく動作しています！

#### Network タブ（開発者ツール）:
1. **Network** タブを開く
2. ページをリロード（Cmd + R）
3. 以下のAPIリクエストが成功（200）していることを確認:
   - `facilities` - 事業所情報
   - `stats` - 統計情報

## 3. エラーが出た場合のデバッグ

### エラー: "データの読み込みに失敗しました"

**原因**: APIサーバーが起動していない、またはAPIエンドポイントにアクセスできない

**解決策**:
```bash
# 開発サーバーを再起動
# Ctrl+C で停止
npm run dev
```

### エラー: "Invalid authentication token"

**原因**: 開発用トークンが正しく設定されていない

**解決策**:
1. `lib/api/client.ts` を確認
2. `NODE_ENV=development` が設定されているか確認
3. ブラウザのコンソールで確認:
```javascript
console.log(process.env.NODE_ENV); // "development" が返るはず
```

### エラー: "Can't reach database server"

**原因**: Supabase接続情報が正しくない

**解決策**:
1. `.env.local` を確認
2. DATABASE_URL が正しく設定されているか確認
3. 開発サーバーを再起動

## 4. 期待される動作

### 初回ロード時:
1. スピナー表示（数秒）
2. データ取得成功
3. ホームダッシュボードに以下が表示:
   - 利用者数: 3
   - 契約プラン: RevelAppコース A-フレキシブル
   - 継続月数: 0ヶ月
   - 工賃フェーズ: 0〜3ヶ月（Lv1: 200円、Lv2: 300円、Lv3: 400円、Lv4: 500円）

### APIから取得されるデータ:
```json
{
  "facility": {
    "name": "テスト事業所",
    "planType": "FLEXIBLE",
    "memberCount": 4
  },
  "stats": {
    "activeMemberCount": 3,
    "continuationMonths": 0,
    "wagePhase": {
      "phaseName": "0〜3ヶ月",
      "level1Wage": 200,
      "level2Wage": 300,
      "level3Wage": 400,
      "level4Wage": 500
    }
  }
}
```

## 5. スクリーンショット

成功時のスクリーンショットを撮って確認してください：
- ホームダッシュボード全体
- ブラウザの開発者ツール（Networkタブ）
- ブラウザのコンソール（警告メッセージ）

---

**次のステップ:**
ホームダッシュボードが正常に動作したら、メンバーページ (`/app/members`) のAPI接続に進みます！
