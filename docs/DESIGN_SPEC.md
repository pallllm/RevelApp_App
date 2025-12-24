# RevelApp デザイン仕様書

## デザインコンセプト

モダンで直感的なUIを提供し、福祉施設の職員が迷いなく操作できるデザインを目指す。

## カラーパレット

### プライマリカラー
- **Purple (#8b5cf6)**: メインアクション、重要な情報
- **Background (#f8f9fb)**: 背景色

### セマンティックカラー
- **Success (#22c55e)**: 成功、承認、ポジティブ
- **Warning (#f59e0b)**: 警告、確認中
- **Danger (#ef4444)**: エラー、削除、注意
- **Info (#3b82f6)**: 情報、セッション
- **Cyan (#06b6d4)**: 補助情報

## タイポグラフィ

### フォント
- **Primary Font**: Inter
- **Fallback**: -apple-system, BlinkMacSystemFont, "Segoe UI"

### サイズスケール
- **h1**: 30px (2rem) - ページタイトル
- **h2**: 24px (1.5rem) - セクションタイトル
- **h3**: 18px (1.125rem) - カードタイトル
- **body**: 14px (0.875rem) - 本文
- **small**: 12px (0.75rem) - 補足情報

## レイアウト

### グリッドシステム
- **Container**: max-width: 1200px
- **Gutter**: 24px (1.5rem)
- **Columns**: 12カラムグリッド

### スペーシング
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px

## コンポーネント

### カード
- **Border Radius**: 12px
- **Shadow**: 0 1px 3px rgba(0,0,0,0.1)
- **Hover Shadow**: 0 4px 6px rgba(0,0,0,0.1)
- **Padding**: 24px

### ボタン
- **Height**: 40px
- **Border Radius**: 8px
- **Primary**: Purple background, white text
- **Outline**: Border with transparent background
- **Ghost**: No border, transparent background

### 統計カード (StatCard)
- アイコン付き
- 大きな数値表示
- 補足説明テキスト
- オプション: トレンド表示

### 入力フィールド
- **Height**: 40px
- **Border Radius**: 8px
- **Focus**: 2px ring in primary color

## アイコン

**Library**: Lucide React

### 使用ガイドライン
- サイズ: 通常 20px (h-5 w-5)
- カラー: コンテキストに応じた色
- 意味を持つアイコンのみ使用

## レスポンシブデザイン

### ブレークポイント
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

### モバイル対応
- タッチターゲット最小サイズ: 44px
- サイドバーは drawer に変換
- グリッドは 1カラムに

## アニメーション

### トランジション
- **Duration**: 200ms
- **Easing**: ease-in-out

### ホバー効果
- カード: shadow 変化
- ボタン: opacity 90%
- リンク: underline または color 変化

## アクセシビリティ

### コントラスト比
- **テキスト**: 最低 4.5:1
- **大きなテキスト**: 最低 3:1

### フォーカス
- すべてのインタラクティブ要素に focus ring
- キーボードナビゲーション対応

### スクリーンリーダー
- 意味のある alt テキスト
- ARIA ラベル適切に使用

## UXルール

### ポジティブフィードバック
- 累計値・継続値など「必ず増える」指標を優先
- ネガティブな比較（前月比減少など）は表示しない

### 操作フロー
- 変更は即時反映ではなく **申請→確認→反映**
- 重要なアクションには確認ダイアログ

### フィードバック
- 成功: グリーンのトースト通知
- エラー: レッドのアラート
- ローディング: スケルトンまたはスピナー

## 参考デザイン

プロジェクトの参考画像:
1. Drive UI - クリーンなカード型レイアウト
2. Codebase Dashboard - アイコンタイルと統計表示

---

**Version**: 1.0.0
**Last Updated**: 2024-12-24
