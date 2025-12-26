# Googleカレンダー統合セットアップガイド

RevelAppカスタマーポータルのホームページに、Googleカレンダーのイベントを表示するための設定手順です。

## 前提条件

- Googleアカウント
- Google Cloud Platformへのアクセス権限
- 表示したいGoogleカレンダー

## セットアップ手順

### 1. Google Cloud Platformでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（例: "RevelApp Calendar Integration"）
3. プロジェクトを選択

### 2. Google Calendar APIを有効化

1. 左側メニューから「APIとサービス」→「ライブラリ」を選択
2. 「Google Calendar API」を検索
3. 「有効にする」をクリック

### 3. サービスアカウントを作成

1. 「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「サービスアカウント」をクリック
3. サービスアカウント名を入力（例: "revelapp-calendar-reader"）
4. 「作成して続行」をクリック
5. ロール選択はスキップ（「完了」をクリック）

### 4. サービスアカウントキーを作成

1. 作成したサービスアカウントをクリック
2. 「キー」タブを選択
3. 「鍵を追加」→「新しい鍵を作成」をクリック
4. キーのタイプで「JSON」を選択
5. 「作成」をクリック
6. JSONファイルがダウンロードされる（**このファイルは安全に保管してください**）

### 5. Googleカレンダーで権限を付与

1. 表示したいGoogleカレンダーを開く
2. カレンダーの設定を開く
3. 「特定のユーザーと共有」セクションで「ユーザーを追加」
4. サービスアカウントのメールアドレスを入力
   - 形式: `サービスアカウント名@プロジェクトID.iam.gserviceaccount.com`
   - 例: `revelapp-calendar-reader@revelapp-12345.iam.gserviceaccount.com`
5. 権限を「予定の表示」に設定
6. 「送信」をクリック

### 6. カレンダーIDを取得

1. カレンダーの設定ページで下にスクロール
2. 「カレンダーの統合」セクションを見つける
3. 「カレンダーID」をコピー
   - プライマリカレンダーの場合: メールアドレスと同じ
   - その他のカレンダー: ランダムな文字列 (例: `abc123@group.calendar.google.com`)

### 7. 環境変数を設定

`.env.local`ファイルに以下の環境変数を追加:

```bash
# Googleカレンダー統合
# サービスアカウントキー（ダウンロードしたJSONファイルの内容を1行にまとめて貼り付け）
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

# カレンダーID（省略可、省略時は primary が使用される）
GOOGLE_CALENDAR_ID="your-calendar-id@group.calendar.google.com"
```

**重要な注意事項:**
- JSONファイルの内容を1行にまとめる必要があります
- シングルクォート `'` で囲んでください
- 改行やスペースは削除してください
- `.env.local`ファイルは`.gitignore`に含まれていることを確認してください

### 8. 動作確認

1. 開発サーバーを再起動
   ```bash
   npm run dev
   ```

2. ホームページにアクセス
   - カレンダーにイベントがある日は紫色でハイライト表示
   - "Scheduled"セクションにGoogleカレンダーのイベントが表示される

## トラブルシューティング

### イベントが表示されない

1. **環境変数が正しく設定されているか確認**
   - JSONの形式が正しいか
   - シングルクォートで囲んでいるか

2. **サービスアカウントにカレンダーへのアクセス権限があるか確認**
   - Googleカレンダーの共有設定を再確認
   - サービスアカウントのメールアドレスが正しいか

3. **APIが有効になっているか確認**
   - Google Cloud ConsoleでCalendar APIが有効か確認

4. **カレンダーIDが正しいか確認**
   - カレンダーの設定から正しいIDをコピーしているか

### コンソールエラーの確認

ブラウザの開発者ツールのコンソールとサーバーログを確認:

```bash
# サーバーログを確認
npm run dev
# ブラウザでホームページにアクセス
# エラーメッセージを確認
```

## セキュリティ上の注意

- サービスアカウントキーは**絶対にGitにコミットしないでください**
- `.env.local`ファイルは必ず`.gitignore`に含めてください
- 本番環境では環境変数を安全に管理してください（Vercelの環境変数設定など）
- サービスアカウントには最小限の権限のみを付与してください

## 必要なパッケージ

以下のnpmパッケージが必要です:

```bash
npm install googleapis
```

このパッケージは`lib/services/google-calendar.ts`で使用されます。

## 参考リンク

- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [googleapis Node.js Client](https://github.com/googleapis/google-api-nodejs-client)
