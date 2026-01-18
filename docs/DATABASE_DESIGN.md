# RevelApp Customer Portal - データベース設計書

**バージョン**: 1.2
**最終更新**: 2026年1月16日
**ステータス**: Draft

---

## 1. 概要

### 1.1 データベース構成
- **DBMS**: PostgreSQL 15+
- **ホスティング**: Supabase
- **ORM**: Prisma 5.x
- **スキーマファイル**: `prisma/schema.prisma`

### 1.2 命名規則
| 対象 | 規則 | 例 |
|-----|------|-----|
| テーブル名 | snake_case（複数形） | `facilities`, `users` |
| カラム名 | camelCase | `facilityId`, `createdAt` |
| 主キー | `id` | `id` |
| 外部キー | `[参照テーブル]Id` | `facilityId`, `userId` |
| タイムスタンプ | `createdAt`, `updatedAt` | - |

---

## 2. ER図

```
┌─────────────────┐       ┌─────────────────┐
│    Facility     │       │    WagePhase    │
│─────────────────│       │─────────────────│
│ id (PK)         │       │ id (PK)         │
│ name            │       │ phaseName       │
│ planType        │       │ minMonths       │
│ address         │       │ maxMonths       │
│ phone           │       │ level1-4Wage    │
│ email           │       └─────────────────┘
│ bankInfo...     │
│ driveFolderUrl  │       ┌─────────────────┐
│ spreadsheetUrl  │       │      Game       │
│ createdAt       │       │─────────────────│
│ updatedAt       │       │ id (PK)         │
└────────┬────────┘       │ name            │
         │                │ level           │
         │1               │ imageUrl        │
         │                │ manualUrl       │
         │                │ videoUrl        │
         ▼ *              └────────┬────────┘
┌─────────────────┐                │
│      User       │                │
│─────────────────│       ┌────────┴────────┐
│ id (PK)         │       │                 │
│ facilityId (FK) │───────┤  FacilityGame   │
│ wordpressUserId │       │─────────────────│
│ role            │       │ id (PK)         │
│ email           │       │ facilityId (FK) │◄──┐
│ password        │       │ gameId (FK)     │   │
│ name            │       │ isBackup        │   │
│ initials        │       └─────────────────┘   │
│ spreadsheetUrl  │                             │
│ status          │       ┌─────────────────┐   │
│ startDate       │       │   MemberGame    │   │
│ continuationMo. │       │─────────────────│   │
│ createdAt       │       │ id (PK)         │   │
│ updatedAt       │       │ memberId (FK)   │◄──┤
└────────┬────────┘       │ gameId (FK)     │   │
         │                └─────────────────┘   │
         │1                                     │
         │                                      │
         ▼ *                                    │
┌─────────────────┐       ┌─────────────────┐   │
│  HealthRecord   │       │ GamePlayRecord  │   │
│─────────────────│       │─────────────────│   │
│ id (PK)         │       │ id (PK)         │   │
│ userId (FK)     │       │ memberId (FK)   │   │
│ date            │       │ gameId (FK)     │   │
│ fatigueLevel    │       │ playedAt        │   │
│ sleepHours      │       │ sessionDuration │   │
│ mood            │       └─────────────────┘   │
│ emotions        │                             │
│ weather         │       ┌─────────────────┐   │
│ temperature     │       │  MonthlyWage    │   │
│ notes...        │       │─────────────────│   │
│ createdAt       │       │ id (PK)         │   │
└─────────────────┘       │ facilityId (FK) │◄──┤
                          │ year            │   │
┌─────────────────┐       │ month           │   │
│ ChangeRequest   │       │ totalAmount     │   │
│─────────────────│       │ memberCount     │   │
│ id (PK)         │       │ status          │   │
│ facilityId (FK) │◄──────│ paymentDate     │   │
│ requestedBy(FK) │       └────────┬────────┘   │
│ requestType     │                │            │
│ requestData     │                │1           │
│ notes           │                ▼ *          │
│ status          │       ┌─────────────────┐   │
│ reviewedBy      │       │MemberMonthlyWage│   │
│ reviewedAt      │       │─────────────────│   │
│ createdAt       │       │ id (PK)         │   │
└────────┬────────┘       │ monthlyWageId   │   │
         │                │ memberId (FK)   │   │
         │1               │ amount          │   │
         ▼ *              │ playCount       │   │
┌─────────────────┐       └─────────────────┘   │
│ChangeRequestDoc │                             │
│─────────────────│       ┌─────────────────┐   │
│ id (PK)         │       │  WageCarryover  │   │
│ changeRequestId │       │─────────────────│   │
│ fileName        │       │ id (PK)         │   │
│ fileUrl         │       │ facilityId (FK) │◄──┘
│ uploadedAt      │       │ year            │
└─────────────────┘       │ month           │
                          │ amount          │
┌─────────────────┐       └─────────────────┘
│NotificationRead │
│─────────────────│
│ id (PK)         │
│ wordpressPostId │
│ userId (FK)     │
│ readAt          │
└─────────────────┘
```

---

## 3. テーブル定義

### 3.1 Facility（事業所）

事業所の基本情報を管理するマスタテーブル。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| name | VARCHAR(255) | NO | - | 事業所名 |
| planType | ENUM | NO | - | 契約プラン |
| address | VARCHAR(500) | YES | - | 住所 |
| phone | VARCHAR(20) | YES | - | 電話番号 |
| email | VARCHAR(255) | YES | - | メールアドレス |
| latitude | DECIMAL | YES | - | 緯度（天気API用） |
| longitude | DECIMAL | YES | - | 経度（天気API用） |
| driveFolderUrl | VARCHAR(500) | YES | - | Google DriveフォルダURL |
| spreadsheetUrl | VARCHAR(500) | YES | - | 管理スプレッドシートURL |
| bankName | VARCHAR(100) | YES | - | 銀行名 |
| bankBranch | VARCHAR(100) | YES | - | 支店名 |
| bankAccountType | ENUM | YES | - | 口座種別 |
| bankAccountNumber | VARCHAR(20) | YES | - | 口座番号 |
| bankAccountHolder | VARCHAR(100) | YES | - | 口座名義 |
| createdAt | TIMESTAMP | NO | now() | 作成日時 |
| updatedAt | TIMESTAMP | NO | now() | 更新日時 |

**インデックス**
- PRIMARY KEY (id)
- INDEX (planType)

**Enum: PlanType**
```
FOCUS    - フォーカスプラン（利用者個別ゲーム選択）
ENTRY    - エントリープラン（施設共通ゲーム）
FLEXIBLE - フレキシブルプラン（柔軟な選択）
```

**Enum: BankAccountType**
```
REGULAR  - 普通預金
CHECKING - 当座預金
```

---

### 3.2 User（ユーザー）

施設スタッフと利用者を統合管理するテーブル。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| facilityId | UUID | NO | - | 事業所ID（FK） |
| wordpressUserId | INT | YES | - | WordPress User ID |
| role | ENUM | NO | - | ユーザーロール |
| email | VARCHAR(255) | NO | - | メールアドレス |
| password | VARCHAR(255) | YES | - | ハッシュ化パスワード |
| name | VARCHAR(100) | NO | - | 氏名 |
| initials | VARCHAR(10) | YES | - | イニシャル |
| spreadsheetUrl | VARCHAR(500) | YES | - | 個人スプレッドシートURL |
| spreadsheetType | ENUM | YES | - | シート形式 |
| status | ENUM | NO | ACTIVE | ステータス |
| startDate | DATE | YES | - | 利用開始日 |
| cancellationDate | DATE | YES | - | 退所日 |
| continuationMonths | INT | NO | 0 | 継続月数 |
| createdAt | TIMESTAMP | NO | now() | 作成日時 |
| updatedAt | TIMESTAMP | NO | now() | 更新日時 |

**インデックス**
- PRIMARY KEY (id)
- UNIQUE (email)
- UNIQUE (wordpressUserId)
- INDEX (facilityId)
- INDEX (role)
- INDEX (status)

**Enum: UserRole**
```
ADMIN  - 運営管理者
STAFF  - 施設スタッフ
MEMBER - 利用者
```

**Enum: UserStatus**
```
ACTIVE    - アクティブ
CANCELLED - 退所
```

**Enum: SpreadsheetType**
```
entry        - エントリープラン用
focus_simple - フォーカス簡易版
focus_normal - フォーカス通常版
```

---

### 3.3 Game（ゲームマスタ）

利用可能なゲームのマスタテーブル。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | VARCHAR(50) | NO | - | ゲームID（PK） |
| name | VARCHAR(100) | NO | - | ゲーム名 |
| level | INT | NO | - | ゲームレベル (1-4) |
| requiresAnydesk | BOOLEAN | NO | false | AnyDesk必要フラグ |
| imageUrl | VARCHAR(500) | YES | - | 画像URL |
| manualUrl | VARCHAR(500) | YES | - | マニュアルURL |
| videoUrl | VARCHAR(500) | YES | - | 動画URL |
| description | TEXT | YES | - | 説明文 |
| createdAt | TIMESTAMP | NO | now() | 作成日時 |
| updatedAt | TIMESTAMP | NO | now() | 更新日時 |

**インデックス**
- PRIMARY KEY (id)
- INDEX (level)

**初期データ**
| id | name | level |
|----|------|-------|
| playbox | PLAY BOX | 1 |
| elf | エルフの森 | 1 |
| mcheroes | マイクリプトヒーローズ | 2 |
| axie-tri | Axieトライフォース | 2 |
| axie-quest | Axieクエスト | 3 |
| career | キャリア乙女サバイバー | 3 |
| bounty | バウンティカインズ | 3 |
| axie-origin | Axieオリジン | 4 |
| xeno | XENO | 4 |

---

### 3.4 FacilityGame（事業所選択ゲーム）

事業所が選択したゲームの中間テーブル。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| facilityId | UUID | NO | - | 事業所ID（FK） |
| gameId | VARCHAR(50) | NO | - | ゲームID（FK） |
| isBackup | BOOLEAN | NO | false | 予備ゲームフラグ |
| createdAt | TIMESTAMP | NO | now() | 作成日時 |

**インデックス**
- PRIMARY KEY (id)
- UNIQUE (facilityId, gameId)
- INDEX (facilityId)
- INDEX (gameId)

---

### 3.5 MemberGame（利用者選択ゲーム）

利用者が選択したゲームの中間テーブル（FOCUSプラン用）。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| memberId | UUID | NO | - | 利用者ID（FK） |
| gameId | VARCHAR(50) | NO | - | ゲームID（FK） |
| createdAt | TIMESTAMP | NO | now() | 作成日時 |

**インデックス**
- PRIMARY KEY (id)
- UNIQUE (memberId, gameId)
- INDEX (memberId)
- INDEX (gameId)

---

### 3.6 GamePlayRecord（ゲームプレイ記録）

利用者のゲームプレイ履歴。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| memberId | UUID | NO | - | 利用者ID（FK） |
| gameId | VARCHAR(50) | NO | - | ゲームID（FK） |
| playedAt | TIMESTAMP | NO | now() | プレイ日時 |
| sessionDuration | INT | YES | - | プレイ時間（分） |
| createdAt | TIMESTAMP | NO | now() | 作成日時 |

**インデックス**
- PRIMARY KEY (id)
- INDEX (memberId)
- INDEX (gameId)
- INDEX (playedAt)
- INDEX (memberId, playedAt) - 月次集計用

---

### 3.7 HealthRecord（体調記録）

利用者の日次体調記録。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| userId | UUID | NO | - | 利用者ID（FK） |
| date | DATE | NO | - | 記録日 |
| fatigueLevel | INT | YES | - | 疲労度 (0-100) |
| sleepHours | DECIMAL | YES | - | 睡眠時間 |
| mood | VARCHAR(20) | YES | - | 気分 |
| emotions | JSON | YES | - | 感情タグ配列 |
| weather | VARCHAR(20) | YES | - | 天気 |
| temperature | DECIMAL | YES | - | 気温 |
| hasPressureChange | BOOLEAN | YES | false | 気圧変化 |
| achievedTasks | TEXT | YES | - | できたこと |
| difficultTasks | TEXT | YES | - | 難しかったこと |
| freeNotes | TEXT | YES | - | 自由記述 |
| createdAt | TIMESTAMP | NO | now() | 作成日時 |
| updatedAt | TIMESTAMP | NO | now() | 更新日時 |

**インデックス**
- PRIMARY KEY (id)
- UNIQUE (userId, date) - 1日1件制約
- INDEX (userId)
- INDEX (date)

**mood値**
- とても良い
- 良い
- 普通
- 悪い
- とても悪い

**weather値**
- sunny（晴れ）
- cloudy（曇り）
- rainy（雨）
- snowy（雪）

---

### 3.8 WagePhase（工賃フェーズマスタ）

継続月数に基づく工賃レートのマスタテーブル。工賃計算サービス（`lib/services/wage-calculator.ts`）で参照される。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| phaseName | VARCHAR(50) | NO | - | フェーズ名 |
| minMonths | INT | NO | - | 最小継続月数 |
| maxMonths | INT | YES | - | 最大継続月数 |
| level1Wage | INT | NO | - | Lv1工賃（円） |
| level2Wage | INT | NO | - | Lv2工賃（円） |
| level3Wage | INT | NO | - | Lv3工賃（円） |
| level4Wage | INT | NO | - | Lv4工賃（円） |
| colorFrom | VARCHAR(20) | YES | - | グラデーション開始色 |
| colorTo | VARCHAR(20) | YES | - | グラデーション終了色 |
| textColor | VARCHAR(20) | YES | - | テキスト色 |
| createdAt | TIMESTAMP | NO | now() | 作成日時 |

**インデックス**
- PRIMARY KEY (id)
- INDEX (minMonths) - フェーズ判定用

**初期データ**
| phaseName | minMonths | maxMonths | Lv1 | Lv2 | Lv3 | Lv4 |
|-----------|-----------|-----------|-----|-----|-----|-----|
| 0〜3ヶ月 | 0 | 3 | 50 | 60 | 70 | 80 |
| 4〜9ヶ月 | 4 | 9 | 60 | 70 | 80 | 90 |
| 9ヶ月以上 | 9 | NULL | 70 | 80 | 90 | 100 |

**フェーズ判定ロジック**
```typescript
// lib/types/wage.ts
function determinePhase(continuationMonths: number): 'short' | 'mid' | 'long' {
  if (continuationMonths <= 3) return 'short';
  if (continuationMonths <= 9) return 'mid';
  return 'long';
}
```

※ 工賃計算は運営管理ポータルから実行（POST /api/wages/calculate）
※ エントリープランは固定50円/プレイのため、このテーブルは参照しない

---

### 3.9 MonthlyWage（月次工賃）

施設・月ごとの工賃合計。工賃計算API（POST /api/wages/calculate）で作成・更新される。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| facilityId | UUID | NO | - | 事業所ID（FK） |
| year | INT | NO | - | 年 |
| month | INT | NO | - | 月 (1-12) |
| totalAmount | INT | NO | 0 | 合計工賃（円） |
| memberCount | INT | NO | 0 | 対象利用者数 |
| status | ENUM | NO | CALCULATING | ステータス |
| paymentDate | DATE | YES | - | 支払日 |
| createdAt | TIMESTAMP | NO | now() | 作成日時 |
| updatedAt | TIMESTAMP | NO | now() | 更新日時 |

**インデックス**
- PRIMARY KEY (id)
- UNIQUE (facilityId, year, month)
- INDEX (facilityId)
- INDEX (year, month)
- INDEX (status)

**Enum: WageStatus**
```
CALCULATING - 計算中
CONFIRMED   - 確定
PAID        - 支払済
```

---

### 3.10 MemberMonthlyWage（利用者別月次工賃）

利用者ごとの月次工賃内訳。工賃計算API（POST /api/wages/calculate）で作成・更新される。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| monthlyWageId | UUID | NO | - | 月次工賃ID（FK） |
| memberId | UUID | NO | - | 利用者ID（FK） |
| amount | INT | NO | 0 | 工賃額（円） |
| playCount | INT | NO | 0 | プレイ回数 |
| createdAt | TIMESTAMP | NO | now() | 作成日時 |

**インデックス**
- PRIMARY KEY (id)
- UNIQUE (monthlyWageId, memberId)
- INDEX (monthlyWageId)
- INDEX (memberId)

---

### 3.11 WageCarryover（繰越金）

施設・月ごとの繰越金。工賃計算API（POST /api/wages/calculate）で作成・更新される。
1,000円未満の場合は翌月へ繰り越される。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| facilityId | UUID | NO | - | 事業所ID（FK） |
| year | INT | NO | - | 年 |
| month | INT | NO | - | 月 (1-12) |
| amount | INT | NO | 0 | 繰越金額（円） |
| createdAt | TIMESTAMP | NO | now() | 作成日時 |
| updatedAt | TIMESTAMP | NO | now() | 更新日時 |

**インデックス**
- PRIMARY KEY (id)
- UNIQUE (facilityId, year, month)
- INDEX (facilityId)

---

### 3.12 ChangeRequest（変更申請）

施設からの変更申請。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| facilityId | UUID | NO | - | 事業所ID（FK） |
| requestedById | UUID | NO | - | 申請者ID（FK） |
| requestType | VARCHAR(50) | NO | - | 申請種別 |
| requestData | JSON | NO | - | 申請データ |
| notes | TEXT | YES | - | 備考 |
| status | ENUM | NO | PENDING | ステータス |
| reviewedById | UUID | YES | - | 審査者ID |
| reviewedAt | TIMESTAMP | YES | - | 審査日時 |
| reviewNotes | TEXT | YES | - | 審査コメント |
| createdAt | TIMESTAMP | NO | now() | 作成日時 |
| updatedAt | TIMESTAMP | NO | now() | 更新日時 |

**インデックス**
- PRIMARY KEY (id)
- INDEX (facilityId)
- INDEX (status)
- INDEX (createdAt)

**Enum: RequestStatus**
```
PENDING  - 申請中
APPROVED - 承認済
REJECTED - 却下
```

**requestType値**
- plan_change（プラン変更）
- game_change（ゲーム変更）
- user_add（利用者追加）
- user_remove（利用者削除）
- pc_add（PC追加）
- pc_change（PC変更）
- payment_change（支払方法変更）
- wage_account（口座変更）
- other（その他）

---

### 3.13 ChangeRequestDocument（変更申請添付資料）

変更申請に添付されたドキュメント。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| changeRequestId | UUID | NO | - | 変更申請ID（FK） |
| fileName | VARCHAR(255) | NO | - | ファイル名 |
| fileUrl | VARCHAR(500) | NO | - | ファイルURL |
| uploadedAt | TIMESTAMP | NO | now() | アップロード日時 |

**インデックス**
- PRIMARY KEY (id)
- INDEX (changeRequestId)

---

### 3.14 NotificationRead（通知既読）

WordPress投稿の既読管理。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|---|------|----------|------|
| id | UUID | NO | uuid() | 主キー |
| wordpressPostId | INT | NO | - | WordPress Post ID |
| userId | UUID | NO | - | ユーザーID（FK） |
| readAt | TIMESTAMP | NO | now() | 既読日時 |

**インデックス**
- PRIMARY KEY (id)
- UNIQUE (wordpressPostId, userId)
- INDEX (userId)

---

## 4. リレーション一覧

| 親テーブル | 子テーブル | カーディナリティ | FK カラム |
|-----------|-----------|----------------|----------|
| Facility | User | 1:N | facilityId |
| Facility | FacilityGame | 1:N | facilityId |
| Facility | MonthlyWage | 1:N | facilityId |
| Facility | WageCarryover | 1:N | facilityId |
| Facility | ChangeRequest | 1:N | facilityId |
| User | HealthRecord | 1:N | userId |
| User | MemberGame | 1:N | memberId |
| User | GamePlayRecord | 1:N | memberId |
| User | MemberMonthlyWage | 1:N | memberId |
| User | NotificationRead | 1:N | userId |
| User | ChangeRequest | 1:N | requestedById |
| Game | FacilityGame | 1:N | gameId |
| Game | MemberGame | 1:N | gameId |
| Game | GamePlayRecord | 1:N | gameId |
| MonthlyWage | MemberMonthlyWage | 1:N | monthlyWageId |
| ChangeRequest | ChangeRequestDocument | 1:N | changeRequestId |

---

## 5. データ整合性

### 5.1 制約

| テーブル | 制約 | 説明 |
|---------|------|------|
| User | UNIQUE(email) | メールアドレス重複禁止 |
| User | UNIQUE(wordpressUserId) | WordPress ID重複禁止 |
| HealthRecord | UNIQUE(userId, date) | 1日1件制約 |
| FacilityGame | UNIQUE(facilityId, gameId) | 重複選択禁止 |
| MemberGame | UNIQUE(memberId, gameId) | 重複選択禁止 |
| MonthlyWage | UNIQUE(facilityId, year, month) | 月次1件制約 |
| WageCarryover | UNIQUE(facilityId, year, month) | 月次1件制約 |
| NotificationRead | UNIQUE(wordpressPostId, userId) | 既読重複禁止 |

### 5.2 カスケード設定

| 親テーブル | 子テーブル | ON DELETE |
|-----------|-----------|-----------|
| Facility | User | CASCADE |
| Facility | FacilityGame | CASCADE |
| User | HealthRecord | CASCADE |
| User | MemberGame | CASCADE |
| User | GamePlayRecord | CASCADE |
| ChangeRequest | ChangeRequestDocument | CASCADE |

---

## 6. パフォーマンス考慮

### 6.1 インデックス戦略

```sql
-- 頻繁にアクセスされるクエリ用
CREATE INDEX idx_users_facility_role ON users(facility_id, role);
CREATE INDEX idx_health_records_user_date ON health_records(user_id, date);
CREATE INDEX idx_game_play_records_member_date ON game_play_records(member_id, played_at);
CREATE INDEX idx_monthly_wages_facility_ym ON monthly_wages(facility_id, year, month);
```

### 6.2 クエリ最適化

```typescript
// 利用者一覧取得（施設限定 + 必要カラムのみ）
const members = await prisma.user.findMany({
  where: {
    facilityId: user.facilityId,
    role: 'MEMBER',
  },
  select: {
    id: true,
    name: true,
    initials: true,
    status: true,
    memberGames: {
      select: {
        game: { select: { name: true } }
      }
    }
  },
});
```

---

## 7. マイグレーション

### 7.1 初期マイグレーション

```bash
# マイグレーション作成
npx prisma migrate dev --name init

# 本番適用
npx prisma migrate deploy
```

### 7.2 マイグレーション履歴

| バージョン | 日付 | 説明 |
|-----------|------|------|
| 20251225150701_init | 2025-12-25 | 初期スキーマ作成 |

---

## 8. バックアップ・リカバリ

### 8.1 バックアップ方針

| 項目 | 内容 |
|-----|------|
| 方式 | Supabase自動バックアップ |
| 頻度 | 日次 |
| 保持期間 | 7日間（Pro: 30日間） |
| 対象 | 全テーブル |

### 8.2 リカバリ手順

1. Supabaseダッシュボードからバックアップポイント選択
2. 新規プロジェクトへリストア
3. 環境変数（DATABASE_URL）を更新
4. アプリケーション再デプロイ

---

## 9. 改訂履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|---------|-------|
| 1.0 | 2026-01-07 | 初版作成 | Claude |
| 1.1 | 2026-01-07 | ゲーム一覧更新、工賃フェーズレート更新 | Claude |
| 1.2 | 2026-01-16 | WagePhaseにカラー関連カラム追加、工賃計算APIとの関連を明記 | Claude |
