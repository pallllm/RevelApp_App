# RevelApp バックエンドアーキテクチャ設計

## 1. 技術スタック提案

### バックエンドフレームワーク
- **Node.js + Express** (推奨)
  - TypeScript対応
  - 既存のNext.jsと技術スタック統一
  - 豊富なエコシステム

### データベース
- **PostgreSQL** (推奨)
  - リレーショナルデータに適している
  - JSON型サポート（柔軟性）
  - 堅牢なトランザクション処理

### ORM
- **Prisma** (推奨)
  - TypeScript完全対応
  - マイグレーション管理が容易
  - 型安全なクエリ

### 認証
- **NextAuth.js** (推奨)
  - Next.jsとの統合が容易
  - 複数の認証プロバイダー対応
  - セッション管理

### ファイルストレージ
- **AWS S3** または **Cloudflare R2**
  - PDFやアップロードファイル保存

### PDF生成
- **Puppeteer** または **jsPDF + html2canvas**
  - 体調グラフのPDF出力
  - 各種帳票出力

---

## 2. データベーススキーマ設計

### 2.1 ユーザー・組織関連

#### `facilities` (事業所)
```sql
id                UUID PRIMARY KEY
name              VARCHAR(255) NOT NULL
plan_type         ENUM('focus', 'entry', 'flexible') NOT NULL
address           TEXT
phone             VARCHAR(20)
email             VARCHAR(255)
bank_name         VARCHAR(100)
bank_branch       VARCHAR(100)
bank_account_type ENUM('普通', '当座')
bank_account_number VARCHAR(20)
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

#### `users` (利用者・スタッフ)
```sql
id                UUID PRIMARY KEY
facility_id       UUID REFERENCES facilities(id)
role              ENUM('admin', 'staff', 'member') NOT NULL
email             VARCHAR(255) UNIQUE
password_hash     VARCHAR(255)
name              VARCHAR(100) NOT NULL
initials          VARCHAR(10)
status            ENUM('active', 'cancelled') DEFAULT 'active'
start_date        DATE
cancellation_date DATE
continuation_months INT DEFAULT 0
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

### 2.2 ゲーム関連

#### `games` (ゲームマスタ)
```sql
id                VARCHAR(50) PRIMARY KEY
name              VARCHAR(100) NOT NULL
level             INT NOT NULL
requires_anydesk  BOOLEAN DEFAULT FALSE
image_url         VARCHAR(500)
manual_url        VARCHAR(500)
video_url         VARCHAR(500)
description       TEXT
created_at        TIMESTAMP DEFAULT NOW()
```

#### `facility_games` (事業所選択ゲーム)
```sql
id                UUID PRIMARY KEY
facility_id       UUID REFERENCES facilities(id)
game_id           VARCHAR(50) REFERENCES games(id)
is_backup         BOOLEAN DEFAULT FALSE
created_at        TIMESTAMP DEFAULT NOW()

UNIQUE(facility_id, game_id)
```

#### `member_games` (利用者選択ゲーム - Focusプラン用)
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES users(id)
game_id           VARCHAR(50) REFERENCES games(id)
created_at        TIMESTAMP DEFAULT NOW()

UNIQUE(user_id, game_id)
```

#### `game_play_records` (ゲームプレイ記録)
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES users(id)
game_id           VARCHAR(50) REFERENCES games(id)
played_at         TIMESTAMP NOT NULL
session_duration  INT -- 分
notes             TEXT
created_at        TIMESTAMP DEFAULT NOW()
```

### 2.3 体調・行動記録

#### `health_records` (日次体調記録)
```sql
id                UUID PRIMARY KEY
user_id           UUID REFERENCES users(id)
record_date       DATE NOT NULL
fatigue_level     INT CHECK (fatigue_level >= 0 AND fatigue_level <= 100)
sleep_hours       DECIMAL(3,1)
mood              VARCHAR(50) -- 'とても良い', '良い', '普通', '悪い', 'とても悪い'
emotions          JSONB -- ['楽しい', '嬉しい', etc.]
weather           VARCHAR(20) -- 'sunny', 'cloudy', 'rainy', 'snowy'
temperature       DECIMAL(4,1)
has_pressure_change BOOLEAN DEFAULT FALSE
achieved_tasks    TEXT -- できたこと
difficult_tasks   TEXT -- 難しかったこと
free_notes        TEXT -- 自由記述
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()

UNIQUE(user_id, record_date)
```

### 2.4 工賃・報酬関連

#### `wage_phases` (工賃フェーズマスタ)
```sql
id                UUID PRIMARY KEY
phase_name        VARCHAR(50) NOT NULL -- '0〜3ヶ月', '4〜9ヶ月', '9ヶ月以上'
min_months        INT NOT NULL
max_months        INT -- NULLは上限なし
level_1_wage      INT NOT NULL
level_2_wage      INT NOT NULL
level_3_wage      INT NOT NULL
level_4_wage      INT NOT NULL
color_from        VARCHAR(50)
color_to          VARCHAR(50)
text_color        VARCHAR(50)
created_at        TIMESTAMP DEFAULT NOW()
```

#### `monthly_wages` (月次工賃記録)
```sql
id                UUID PRIMARY KEY
facility_id       UUID REFERENCES facilities(id)
year              INT NOT NULL
month             INT NOT NULL
total_amount      INT NOT NULL
member_count      INT NOT NULL
status            ENUM('calculating', 'confirmed', 'paid') DEFAULT 'calculating'
payment_date      DATE
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()

UNIQUE(facility_id, year, month)
```

#### `member_monthly_wages` (利用者別月次工賃)
```sql
id                UUID PRIMARY KEY
monthly_wage_id   UUID REFERENCES monthly_wages(id)
user_id           UUID REFERENCES users(id)
amount            INT NOT NULL
play_count        INT NOT NULL
created_at        TIMESTAMP DEFAULT NOW()

UNIQUE(monthly_wage_id, user_id)
```

#### `wage_carryovers` (繰越金額)
```sql
id                UUID PRIMARY KEY
facility_id       UUID REFERENCES facilities(id)
year              INT NOT NULL
month             INT NOT NULL
amount            INT NOT NULL
created_at        TIMESTAMP DEFAULT NOW()

UNIQUE(facility_id, year, month)
```

### 2.5 変更申請

#### `change_requests` (変更申請)
```sql
id                UUID PRIMARY KEY
facility_id       UUID REFERENCES facilities(id)
requester_id      UUID REFERENCES users(id)
request_type      VARCHAR(50) NOT NULL -- 'facility_info', 'plan_change', 'member_add', etc.
status            ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
request_data      JSONB NOT NULL -- リクエスト内容（柔軟性のためJSON）
notes             TEXT
submitted_at      TIMESTAMP DEFAULT NOW()
processed_at      TIMESTAMP
processed_by      UUID REFERENCES users(id)
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

#### `change_request_documents` (申請添付書類)
```sql
id                UUID PRIMARY KEY
change_request_id UUID REFERENCES change_requests(id)
file_name         VARCHAR(255) NOT NULL
file_url          VARCHAR(500) NOT NULL
file_size         BIGINT
mime_type         VARCHAR(100)
uploaded_at       TIMESTAMP DEFAULT NOW()
```

### 2.6 お知らせ

#### `notifications` (お知らせ)
```sql
id                UUID PRIMARY KEY
title             VARCHAR(255) NOT NULL
content           TEXT NOT NULL
type              ENUM('info', 'warning', 'important') DEFAULT 'info'
target_facilities JSONB -- NULL = 全事業所, または特定facility_idの配列
published_at      TIMESTAMP DEFAULT NOW()
expires_at        TIMESTAMP
is_published      BOOLEAN DEFAULT TRUE
created_at        TIMESTAMP DEFAULT NOW()
updated_at        TIMESTAMP DEFAULT NOW()
```

#### `notification_reads` (お知らせ既読管理)
```sql
id                UUID PRIMARY KEY
notification_id   UUID REFERENCES notifications(id)
user_id           UUID REFERENCES users(id)
read_at           TIMESTAMP DEFAULT NOW()

UNIQUE(notification_id, user_id)
```

---

## 3. API エンドポイント設計

### 3.1 認証 (`/api/auth`)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| POST | `/api/auth/login` | ログイン |
| POST | `/api/auth/logout` | ログアウト |
| GET | `/api/auth/session` | セッション確認 |
| POST | `/api/auth/password/reset` | パスワードリセット |

### 3.2 事業所 (`/api/facilities`)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/facilities/me` | 現在の事業所情報取得 |
| PATCH | `/api/facilities/me` | 事業所情報更新 |
| GET | `/api/facilities/me/stats` | ダッシュボード統計取得 |

### 3.3 利用者 (`/api/members`)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/members` | 利用者一覧取得 |
| GET | `/api/members/:id` | 利用者詳細取得 |
| POST | `/api/members` | 利用者追加申請 |
| PATCH | `/api/members/:id` | 利用者情報更新 |
| DELETE | `/api/members/:id` | 利用者登録解除 |

### 3.4 ゲーム (`/api/games`)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/games` | ゲーム一覧取得 |
| GET | `/api/games/:id` | ゲーム詳細取得 |
| GET | `/api/facilities/me/games` | 事業所選択ゲーム取得 |
| PUT | `/api/facilities/me/games` | 事業所ゲーム選択更新 |
| GET | `/api/members/:id/games` | 利用者選択ゲーム取得 |
| PUT | `/api/members/:id/games` | 利用者ゲーム選択更新 |

### 3.5 体調記録 (`/api/health`)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/health/records` | 体調記録一覧取得 |
| GET | `/api/health/records/:userId/:year/:month` | 月次体調記録取得 |
| POST | `/api/health/records` | 体調記録作成 |
| PATCH | `/api/health/records/:id` | 体調記録更新 |
| GET | `/api/health/records/:userId/summary` | 体調サマリー取得 |
| GET | `/api/health/records/:userId/export` | 体調グラフPDF出力 |

### 3.6 ゲームプレイ (`/api/play-records`)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/play-records` | プレイ記録一覧取得 |
| GET | `/api/play-records/:userId/:year/:month` | 月次プレイ記録取得 |
| POST | `/api/play-records` | プレイ記録作成 |
| GET | `/api/play-records/:userId/stats` | プレイ統計取得 |

### 3.7 工賃 (`/api/wages`)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/wages` | 工賃履歴取得 |
| GET | `/api/wages/:year/:month` | 月次工賃詳細取得 |
| GET | `/api/wages/:year/:month/members` | 月次利用者別工賃取得 |
| GET | `/api/wages/phases` | 工賃フェーズ一覧取得 |
| GET | `/api/wages/:year/:month/notice` | 報酬決定通知書PDF |
| GET | `/api/wages/:year/:month/invoice` | 請求書PDF |
| GET | `/api/wages/carryover` | 繰越金額取得 |

### 3.8 変更申請 (`/api/change-requests`)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/change-requests` | 申請一覧取得 |
| GET | `/api/change-requests/:id` | 申請詳細取得 |
| POST | `/api/change-requests` | 申請作成 |
| POST | `/api/change-requests/:id/documents` | 書類アップロード |
| PATCH | `/api/change-requests/:id` | 申請更新 |
| DELETE | `/api/change-requests/:id` | 申請削除（下書きのみ） |

### 3.9 お知らせ (`/api/notifications`)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/notifications` | お知らせ一覧取得 |
| GET | `/api/notifications/:id` | お知らせ詳細取得 |
| POST | `/api/notifications/:id/read` | 既読マーク |
| GET | `/api/notifications/unread-count` | 未読件数取得 |

### 3.10 外部API連携 (`/api/external`)

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/external/weather/:date` | 気象庁データ取得 |

---

## 4. 認証・認可設計

### セッション管理
- NextAuth.js使用
- JWT + Database Session ハイブリッド
- httpOnly Cookie でトークン保存

### ロール・権限
```typescript
enum UserRole {
  ADMIN = 'admin',      // システム管理者
  STAFF = 'staff',      // 事業所スタッフ
  MEMBER = 'member'     // 利用者
}

// 権限マトリクス
const permissions = {
  ADMIN: ['*'], // 全権限
  STAFF: [
    'facilities:read',
    'facilities:update',
    'members:*',
    'health:*',
    'wages:read',
    'notifications:read',
    'change-requests:*'
  ],
  MEMBER: [
    'health:own:*',
    'wages:own:read',
    'notifications:read'
  ]
}
```

---

## 5. ディレクトリ構造提案

```
RevelApp_App/
├── backend/                    # 新規作成
│   ├── src/
│   │   ├── config/            # 設定ファイル
│   │   │   ├── database.ts
│   │   │   └── auth.ts
│   │   ├── middlewares/       # ミドルウェア
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── routes/            # ルート定義
│   │   │   ├── auth.ts
│   │   │   ├── facilities.ts
│   │   │   ├── members.ts
│   │   │   ├── games.ts
│   │   │   ├── health.ts
│   │   │   ├── wages.ts
│   │   │   ├── changeRequests.ts
│   │   │   └── notifications.ts
│   │   ├── controllers/       # コントローラー
│   │   │   ├── authController.ts
│   │   │   ├── facilitiesController.ts
│   │   │   ├── membersController.ts
│   │   │   └── ...
│   │   ├── services/          # ビジネスロジック
│   │   │   ├── authService.ts
│   │   │   ├── wageCalculationService.ts
│   │   │   ├── pdfGenerationService.ts
│   │   │   └── ...
│   │   ├── models/            # Prismaモデル（自動生成）
│   │   ├── utils/             # ユーティリティ
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   └── ...
│   │   ├── types/             # 型定義
│   │   │   └── index.ts
│   │   └── index.ts           # エントリーポイント
│   ├── prisma/
│   │   ├── schema.prisma      # Prismaスキーマ
│   │   ├── migrations/        # マイグレーション
│   │   └── seed.ts            # 初期データ
│   ├── tests/                 # テスト
│   │   ├── unit/
│   │   └── integration/
│   ├── package.json
│   └── tsconfig.json
├── customer-portal/           # 既存
├── docs/                      # ドキュメント
│   └── backend-architecture.md
└── ...
```

---

## 6. 開発ロードマップ

### Phase 1: 基盤構築（1-2週間）
- [ ] バックエンドプロジェクトセットアップ
- [ ] Prismaセットアップ・スキーマ定義
- [ ] データベースマイグレーション実行
- [ ] 認証システム実装（NextAuth.js）
- [ ] 基本ミドルウェア実装

### Phase 2: コアAPI実装（2-3週間）
- [ ] 事業所API実装
- [ ] 利用者管理API実装
- [ ] ゲーム管理API実装
- [ ] 体調記録API実装
- [ ] プレイ記録API実装

### Phase 3: 工賃・報酬システム（1-2週間）
- [ ] 工賃計算ロジック実装
- [ ] 月次集計バッチ実装
- [ ] PDF生成機能実装
- [ ] 工賃API実装

### Phase 4: その他機能（1-2週間）
- [ ] 変更申請API実装
- [ ] ファイルアップロード機能
- [ ] お知らせAPI実装
- [ ] 外部API連携（気象データ）

### Phase 5: フロントエンド統合（1-2週間）
- [ ] API クライアント実装（React Query）
- [ ] 各ページのAPI接続
- [ ] エラーハンドリング実装
- [ ] ローディング状態実装

### Phase 6: テスト・デプロイ（1週間）
- [ ] ユニットテスト作成
- [ ] 統合テスト作成
- [ ] パフォーマンステスト
- [ ] 本番環境デプロイ

---

## 7. 次のステップ

1. **技術スタック確認**: この提案で問題ないか確認
2. **バックエンドプロジェクト作成**: Express + TypeScript + Prisma セットアップ
3. **Prismaスキーマ実装**: データベーススキーマをコードに落とし込む
4. **初期マイグレーション実行**: データベース作成

これから始めますか？
