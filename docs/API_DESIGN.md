# RevelApp Customer Portal - API設計書

**バージョン**: 1.2
**最終更新**: 2026年1月16日
**ステータス**: Draft

---

## 1. 概要

### 1.1 API基本情報

| 項目 | 内容 |
|-----|------|
| ベースURL | `/api` |
| プロトコル | HTTPS |
| 認証方式 | Bearer Token (JWT) |
| レスポンス形式 | JSON |
| 文字コード | UTF-8 |

### 1.2 共通ヘッダー

**リクエスト**
```http
Content-Type: application/json
Authorization: Bearer <token>
```

**レスポンス**
```http
Content-Type: application/json
```

---

## 2. 認証

### 2.1 ログイン

ユーザー認証を行い、JWTトークンを発行する。

```
POST /api/auth/login
```

**リクエスト**
```json
{
  "email": "staff@example.com",
  "password": "password123"
}
```

**レスポンス（成功: 200）**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "staff@example.com",
    "name": "田中太郎",
    "role": "STAFF",
    "facilityId": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

**レスポンス（失敗: 401）**
```json
{
  "error": "Invalid email or password"
}
```

**制限**
- STAFF/ADMINロールのみログイン可能
- MEMBERロールはログイン不可

---

### 2.2 トークン検証

認証トークンの有効性を検証する（内部処理）。

**JWTペイロード構造**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "staff@example.com",
  "role": "STAFF",
  "facilityId": "550e8400-e29b-41d4-a716-446655440001",
  "iat": 1704067200,
  "exp": 1704672000
}
```

**トークン有効期限**: 7日間

---

## 3. 事業所API

### 3.1 事業所情報取得

ログインユーザーの所属事業所情報を取得する。

```
GET /api/facilities
```

**認証**: 必須
**権限**: STAFF, ADMIN

**レスポンス（成功: 200）**
```json
{
  "facility": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "サンプル事業所",
    "planType": "FLEXIBLE",
    "address": "東京都渋谷区...",
    "phone": "03-1234-5678",
    "email": "info@example.com",
    "latitude": 35.6585,
    "longitude": 139.7454,
    "driveFolderUrl": "https://drive.google.com/...",
    "spreadsheetUrl": "https://docs.google.com/...",
    "bankName": "みずほ銀行",
    "bankBranch": "渋谷支店",
    "bankAccountType": "REGULAR",
    "bankAccountNumber": "1234567",
    "bankAccountHolder": "サンプルジギョウショ",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-12-01T00:00:00.000Z",
    "users": [
      {
        "id": "...",
        "name": "利用者A",
        "role": "MEMBER",
        "status": "ACTIVE"
      }
    ],
    "facilityGames": [
      {
        "game": {
          "id": "gesoten",
          "name": "ゲソてん",
          "level": 1
        },
        "isBackup": false
      }
    ]
  }
}
```

---

### 3.2 事業所情報更新

事業所情報を更新する。

```
PATCH /api/facilities
```

**認証**: 必須
**権限**: STAFF, ADMIN

**リクエスト**
```json
{
  "name": "新しい事業所名",
  "address": "新しい住所",
  "phone": "03-9876-5432",
  "email": "new@example.com",
  "bankName": "三菱UFJ銀行",
  "bankBranch": "新宿支店",
  "bankAccountType": "REGULAR",
  "bankAccountNumber": "7654321",
  "bankAccountHolder": "アタラシイジギョウショ"
}
```

**レスポンス（成功: 200）**
```json
{
  "facility": { ... },
  "message": "Facility information updated successfully"
}
```

---

### 3.3 事業所統計情報取得

ダッシュボード用の統計情報を取得する。

```
GET /api/facilities/stats
```

**認証**: 必須
**権限**: STAFF, ADMIN

**レスポンス（成功: 200）**
```json
{
  "stats": {
    "activeMemberCount": 15,
    "monthlyPlayCount": 127,
    "previousMonthWage": {
      "year": 2025,
      "month": 12,
      "totalAmount": 150000,
      "memberCount": 15,
      "status": "CONFIRMED"
    },
    "totalWages": 1500000,
    "continuationMonths": 12,
    "wagePhase": {
      "id": "...",
      "phaseName": "9ヶ月以上",
      "minMonths": 9,
      "maxMonths": null,
      "level1Wage": 300,
      "level2Wage": 500,
      "level3Wage": 700,
      "level4Wage": 1000
    }
  }
}
```

---

## 4. 利用者API

### 4.1 利用者一覧取得

事業所の利用者一覧を取得する。

```
GET /api/members
```

**認証**: 必須
**権限**: STAFF, ADMIN

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| status | string | No | フィルタ: ACTIVE, CANCELLED |
| limit | number | No | 取得件数（デフォルト: 100） |
| offset | number | No | オフセット（デフォルト: 0） |

**レスポンス（成功: 200）**
```json
{
  "members": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "name": "山田太郎",
      "initials": "Y.T",
      "email": "yamada@example.com",
      "status": "ACTIVE",
      "startDate": "2025-01-15",
      "continuationMonths": 11,
      "spreadsheetUrl": "https://docs.google.com/...",
      "spreadsheetType": "focus_normal",
      "memberGames": [
        {
          "game": {
            "id": "cryptospells",
            "name": "クリプトスペルズ",
            "level": 3
          }
        }
      ]
    }
  ],
  "total": 15
}
```

---

### 4.2 利用者詳細取得

特定の利用者の詳細情報を取得する。

```
GET /api/members/{id}
```

**認証**: 必須
**権限**: STAFF, ADMIN

**パスパラメータ**
| パラメータ | 型 | 説明 |
|-----------|---|------|
| id | UUID | 利用者ID |

**レスポンス（成功: 200）**
```json
{
  "member": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "name": "山田太郎",
    "initials": "Y.T",
    "email": "yamada@example.com",
    "status": "ACTIVE",
    "startDate": "2025-01-15",
    "cancellationDate": null,
    "continuationMonths": 11,
    "spreadsheetUrl": "https://docs.google.com/...",
    "spreadsheetType": "focus_normal",
    "createdAt": "2025-01-15T00:00:00.000Z",
    "updatedAt": "2025-12-01T00:00:00.000Z",
    "memberGames": [...],
    "healthRecords": [...],
    "gamePlayRecords": [...]
  }
}
```

**レスポンス（失敗: 404）**
```json
{
  "error": "Member not found"
}
```

---

### 4.3 利用者作成

新規利用者を作成する。

```
POST /api/members
```

**認証**: 必須
**権限**: STAFF, ADMIN

**リクエスト**
```json
{
  "name": "新規利用者",
  "initials": "S.R",
  "email": "new-member@example.com",
  "startDate": "2026-01-15",
  "spreadsheetType": "entry",
  "gameIds": ["gesoten", "elf1"]
}
```

**レスポンス（成功: 201）**
```json
{
  "member": { ... },
  "message": "Member created successfully"
}
```

**バリデーション**
- name: 必須、1-100文字
- email: 必須、メール形式、重複不可
- startDate: 必須、日付形式

---

### 4.4 利用者更新

利用者情報を更新する。

```
PATCH /api/members/{id}
```

**認証**: 必須
**権限**: STAFF, ADMIN

**リクエスト**
```json
{
  "name": "更新後の名前",
  "initials": "K.N",
  "status": "CANCELLED",
  "cancellationDate": "2026-01-31"
}
```

**レスポンス（成功: 200）**
```json
{
  "member": { ... },
  "message": "Member updated successfully"
}
```

---

### 4.5 利用者削除

利用者を削除する。

```
DELETE /api/members/{id}
```

**認証**: 必須
**権限**: ADMIN

**レスポンス（成功: 200）**
```json
{
  "message": "Member deleted successfully"
}
```

---

## 5. ゲームAPI

### 5.1 ゲーム一覧取得

利用可能なゲーム一覧を取得する。

```
GET /api/games
```

**認証**: 必須
**権限**: STAFF, ADMIN

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| level | number | No | レベルフィルタ (1-4) |

**レスポンス（成功: 200）**
```json
{
  "games": [
    {
      "id": "gesoten",
      "name": "ゲソてん",
      "level": 1,
      "requiresAnydesk": false,
      "imageUrl": "/images/games/gesoten.png",
      "manualUrl": "https://...",
      "videoUrl": "https://...",
      "description": "初心者向けゲーム..."
    },
    {
      "id": "xeno",
      "name": "XENO",
      "level": 4,
      "requiresAnydesk": true,
      "imageUrl": "/images/games/xeno.png",
      "manualUrl": "https://...",
      "videoUrl": "https://...",
      "description": "上級者向けゲーム..."
    }
  ]
}
```

---

### 5.2 ゲーム詳細取得

特定のゲームの詳細情報を取得する。

```
GET /api/games/{gameId}
```

**認証**: 必須
**権限**: STAFF, ADMIN

**パスパラメータ**
| パラメータ | 型 | 説明 |
|-----------|---|------|
| gameId | string | ゲームID |

**レスポンス（成功: 200）**
```json
{
  "game": {
    "id": "cryptospells",
    "name": "クリプトスペルズ",
    "level": 3,
    "requiresAnydesk": false,
    "imageUrl": "/images/games/cryptospells.png",
    "manualUrl": "https://...",
    "videoUrl": "https://...",
    "description": "カードゲーム..."
  }
}
```

---

## 6. 体調記録API

### 6.1 体調記録取得

利用者の月別体調記録を取得する。

```
GET /api/health-records
```

**認証**: 必須
**権限**: STAFF, ADMIN

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| userId | UUID | Yes | 利用者ID |
| year | number | Yes | 年 |
| month | number | Yes | 月 (1-12) |

**レスポンス（成功: 200）**
```json
{
  "records": [
    {
      "id": "...",
      "date": "2025-12-01",
      "fatigueLevel": 45,
      "sleepHours": 7.5,
      "mood": "良い",
      "emotions": ["楽しい", "穏やか"],
      "weather": "sunny",
      "temperature": 12.5,
      "hasPressureChange": false,
      "achievedTasks": "書類整理ができた",
      "difficultTasks": null,
      "freeNotes": null
    }
  ],
  "user": {
    "id": "...",
    "name": "山田太郎"
  }
}
```

---

### 6.2 体調記録作成・更新

体調記録を作成または更新する（1日1件のUPSERT）。

```
POST /api/health-records
```

**認証**: 必須
**権限**: STAFF, ADMIN

**リクエスト**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440010",
  "date": "2025-12-15",
  "fatigueLevel": 50,
  "sleepHours": 6.5,
  "mood": "普通",
  "emotions": ["疲れた"],
  "weather": "cloudy",
  "temperature": 8.0,
  "hasPressureChange": true,
  "achievedTasks": "データ入力完了",
  "difficultTasks": "集中が続かなかった",
  "freeNotes": "午後から頭痛あり"
}
```

**レスポンス（成功: 200/201）**
```json
{
  "record": { ... },
  "message": "Health record saved successfully"
}
```

---

## 7. 工賃API

### 7.0 工賃計算の概要

工賃はプラン別・フェーズ別に計算される。

**契約プラン別ルール**
| プラン | 日次上限 | 計算方式 |
|-------|---------|---------|
| エントリー | 上限なし | 固定50円/プレイ |
| フレキシブル | 在籍利用者数/日 | 高単価から優先採用 |
| フォーカス | 1回/人/日 | 高単価から優先採用 |

**工賃フェーズ別レート**
| フェーズ | 継続期間 | Lv1 | Lv2 | Lv3 | Lv4 |
|---------|---------|-----|-----|-----|-----|
| short | 0〜3ヶ月未満 | 50円 | 60円 | 70円 | 80円 |
| mid | 3〜9ヶ月未満 | 60円 | 70円 | 80円 | 90円 |
| long | 9ヶ月以上 | 70円 | 80円 | 90円 | 100円 |

**繰越金ルール**
- 報酬額合計 = 前月繰越額 + 当月発生工賃
- 1,000円以上 → 支払い実行
- 1,000円未満 → 翌月へ繰越

---

### 7.1 工賃履歴取得

事業所の工賃履歴を取得する。

```
GET /api/wages/history
```

**認証**: 必須
**権限**: STAFF, ADMIN

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| limit | number | No | 取得件数（デフォルト: 12） |

**レスポンス（成功: 200）**
```json
{
  "history": [
    {
      "id": "...",
      "year": 2025,
      "month": 12,
      "totalAmount": 150000,
      "memberCount": 15,
      "status": "CONFIRMED",
      "paymentDate": "2026-01-15"
    },
    {
      "id": "...",
      "year": 2025,
      "month": 11,
      "totalAmount": 145000,
      "memberCount": 14,
      "status": "PAID",
      "paymentDate": "2025-12-15"
    }
  ]
}
```

---

### 7.2 月次利用者別工賃取得

特定月の利用者別工賃内訳を取得する。

```
GET /api/wages/members
```

**認証**: 必須
**権限**: STAFF, ADMIN

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| year | number | Yes | 年 |
| month | number | Yes | 月 (1-12) |

**レスポンス（成功: 200）**
```json
{
  "wages": [
    {
      "member": {
        "id": "...",
        "name": "山田太郎",
        "initials": "Y.T"
      },
      "amount": 12000,
      "playCount": 24
    },
    {
      "member": {
        "id": "...",
        "name": "鈴木花子",
        "initials": "S.H"
      },
      "amount": 9500,
      "playCount": 19
    }
  ],
  "summary": {
    "year": 2025,
    "month": 12,
    "totalAmount": 150000,
    "memberCount": 15,
    "status": "CONFIRMED"
  }
}
```

---

### 7.3 繰越金取得

特定月の繰越金情報を取得する。

```
GET /api/wages/carryover
```

**認証**: 必須
**権限**: STAFF, ADMIN

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| year | number | Yes | 年 |
| month | number | Yes | 月 (1-12) |

**レスポンス（成功: 200）**
```json
{
  "carryover": {
    "year": 2025,
    "month": 12,
    "amount": 5000
  }
}
```

---

### 7.4 工賃計算プレビュー

月次工賃を計算してプレビュー表示する（DB保存なし）。

```
GET /api/wages/calculate/preview
```

**認証**: 必須
**権限**: STAFF, ADMIN

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| year | number | Yes | 年 |
| month | number | Yes | 月 (1-12) |

**レスポンス（成功: 200）**
```json
{
  "success": true,
  "result": {
    "facilityId": "550e8400-e29b-41d4-a716-446655440001",
    "year": 2026,
    "month": 1,
    "summary": {
      "totalWage": 125000,
      "memberCount": 15,
      "totalPlayCount": 280,
      "averageWagePerMember": 8333
    },
    "members": [
      {
        "userId": "...",
        "userName": "山田太郎",
        "phase": "mid",
        "totalWage": 12000,
        "validPlayCount": 18,
        "excludedPlayCount": 2,
        "playDetails": [
          {
            "date": "2026-01-05",
            "gameName": "クリプトスペルズ Lv3",
            "gameLevel": 3,
            "wageRate": 80,
            "wageAmount": 80,
            "isValid": true
          },
          {
            "date": "2026-01-05",
            "gameName": "ゲソてん Lv1",
            "gameLevel": 1,
            "wageRate": 60,
            "wageAmount": 0,
            "isValid": false,
            "excludeReason": "FOCUSプラン: 1日1プレイ制限"
          }
        ],
        "calculationLog": [
          { "type": "info", "message": "継続6ヶ月 → フェーズ: mid" },
          { "type": "excluded", "message": "2026-01-05: ゲソてん Lv1 - 1日1プレイ制限により除外" }
        ]
      }
    ],
    "carryover": {
      "previousCarryover": 500,
      "currentMonthWage": 125000,
      "totalAmount": 125500,
      "paymentAmount": 125500,
      "nextCarryover": 0
    },
    "calculationLog": [
      { "type": "info", "message": "2026年1月の工賃計算開始 - プラン: FOCUS" },
      { "type": "info", "message": "計算完了: 総工賃125000円、対象15人、プレイ280件" }
    ]
  }
}
```

---

### 7.5 工賃計算実行

月次工賃を計算してDBに保存する。

```
POST /api/wages/calculate
```

**認証**: 必須
**権限**: STAFF, ADMIN

**リクエスト**
```json
{
  "year": 2026,
  "month": 1,
  "dryRun": false
}
```

| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| year | number | Yes | 年 |
| month | number | Yes | 月 (1-12) |
| dryRun | boolean | No | trueの場合、計算のみ実行しDB保存しない（デフォルト: false） |

**レスポンス（成功: 200）**
```json
{
  "success": true,
  "result": {
    "facilityId": "550e8400-e29b-41d4-a716-446655440001",
    "year": 2026,
    "month": 1,
    "summary": {
      "totalWage": 125000,
      "memberCount": 15,
      "totalPlayCount": 280,
      "averageWagePerMember": 8333
    },
    "members": [...],
    "carryover": {...},
    "calculationLog": [...]
  },
  "savedToDb": true
}
```

**処理内容**
1. スプレッドシートからプレイ記録を読み取り
2. プラン別ルールで工賃計算（ENTRY/FLEXIBLE/FOCUS）
3. 繰越金計算
4. DB保存（MonthlyWage, MemberMonthlyWage, WageCarryover）

**注意事項**
- 同じ年月で再実行した場合、既存データは上書きされる
- dryRun=trueの場合、プレビューAPIと同じ動作

---

## 8. ゲーム統計API

### 8.1 ゲーム統計取得

利用者のゲームプレイ統計を取得する。

```
GET /api/game-stats
```

**認証**: 必須
**権限**: STAFF, ADMIN

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| userId | UUID | No | 利用者ID（省略時は全利用者） |
| year | number | Yes | 年 |
| month | number | Yes | 月 (1-12) |

**レスポンス（成功: 200）**
```json
{
  "stats": {
    "totalPlayCount": 127,
    "byGame": [
      {
        "gameId": "cryptospells",
        "gameName": "クリプトスペルズ",
        "playCount": 45
      },
      {
        "gameId": "gesoten",
        "gameName": "ゲソてん",
        "playCount": 32
      }
    ],
    "byMember": [
      {
        "memberId": "...",
        "memberName": "山田太郎",
        "playCount": 24
      }
    ]
  }
}
```

---

## 9. 変更申請API

### 9.1 変更申請一覧取得

事業所の変更申請一覧を取得する。

```
GET /api/change-requests
```

**認証**: 必須
**権限**: STAFF, ADMIN

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| status | string | No | フィルタ: PENDING, APPROVED, REJECTED |
| limit | number | No | 取得件数（デフォルト: 50） |

**レスポンス（成功: 200）**
```json
{
  "requests": [
    {
      "id": "...",
      "requestType": "game_change",
      "requestData": {
        "currentGames": ["gesoten", "elf1"],
        "newGames": ["cryptospells", "axie-tri"]
      },
      "notes": "難易度を上げたい",
      "status": "PENDING",
      "createdAt": "2025-12-20T10:00:00.000Z",
      "requestedBy": {
        "id": "...",
        "name": "田中太郎"
      }
    }
  ],
  "total": 5
}
```

---

### 9.2 変更申請作成

新規変更申請を作成する。

```
POST /api/change-requests
```

**認証**: 必須
**権限**: STAFF, ADMIN

**リクエスト**
```json
{
  "requestType": "plan_change",
  "requestData": {
    "currentPlan": "ENTRY",
    "newPlan": "FLEXIBLE",
    "desiredDate": "2026-02-01",
    "reason": "利用者が増えたため"
  },
  "notes": "できれば2月から変更希望"
}
```

**申請種別と必要データ**

| requestType | requestData内容 |
|-------------|----------------|
| plan_change | currentPlan, newPlan, desiredDate, reason |
| game_change | currentGames[], newGames[] |
| user_add | userName, userEmail, startDate, gameIds[] |
| user_remove | userId, reason, endDate |
| pc_add | quantity, purpose |
| pc_change | changeDetails |
| payment_change | currentMethod, newMethod |
| wage_account | bankName, bankBranch, accountType, accountNumber, accountHolder |
| other | inquiry |

**レスポンス（成功: 201）**
```json
{
  "request": { ... },
  "message": "Change request submitted successfully"
}
```

---

## 10. 通知API

### 10.1 通知一覧取得

お知らせ一覧を取得する（WordPress連携）。

```
GET /api/notifications
```

**認証**: 必須
**権限**: STAFF, ADMIN

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| limit | number | No | 取得件数（デフォルト: 10） |

**レスポンス（成功: 200）**
```json
{
  "notifications": [
    {
      "id": 123,
      "title": "年末年始の営業について",
      "excerpt": "年末年始の営業日程をお知らせします...",
      "date": "2025-12-20T00:00:00.000Z",
      "isRead": false
    },
    {
      "id": 120,
      "title": "新ゲーム追加のお知らせ",
      "excerpt": "新しいゲームが追加されました...",
      "date": "2025-12-15T00:00:00.000Z",
      "isRead": true
    }
  ]
}
```

---

### 10.2 通知既読登録

通知を既読にする。

```
POST /api/notifications/{postId}/read
```

**認証**: 必須
**権限**: STAFF, ADMIN

**パスパラメータ**
| パラメータ | 型 | 説明 |
|-----------|---|------|
| postId | number | WordPress Post ID |

**レスポンス（成功: 200）**
```json
{
  "message": "Notification marked as read"
}
```

---

## 11. カレンダーAPI

### 11.1 カレンダーイベント取得

Googleカレンダーのイベントを取得する。

```
GET /api/calendar-events
```

**認証**: 必須
**権限**: STAFF, ADMIN

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|-----------|---|------|------|
| year | number | No | 年（デフォルト: 現在年） |
| month | number | No | 月（デフォルト: 現在月） |

**レスポンス（成功: 200）**
```json
{
  "events": [
    {
      "id": "abc123",
      "title": "月次ミーティング",
      "start": "2025-12-15T10:00:00.000Z",
      "end": "2025-12-15T11:00:00.000Z",
      "allDay": false
    },
    {
      "id": "def456",
      "title": "年末休業",
      "start": "2025-12-29",
      "end": "2026-01-03",
      "allDay": true
    }
  ]
}
```

---

## 12. エラーレスポンス

### 12.1 エラー形式

```json
{
  "error": "エラーメッセージ",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### 12.2 HTTPステータスコード

| コード | 説明 | 用途 |
|-------|------|------|
| 200 | OK | 成功（取得・更新） |
| 201 | Created | 成功（作成） |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 権限エラー |
| 404 | Not Found | リソース未発見 |
| 500 | Internal Server Error | サーバーエラー |

### 12.3 エラーコード一覧

| コード | 説明 |
|-------|------|
| AUTH_REQUIRED | 認証が必要 |
| AUTH_INVALID_TOKEN | 無効なトークン |
| AUTH_TOKEN_EXPIRED | トークン期限切れ |
| AUTH_INVALID_CREDENTIALS | 認証情報が不正 |
| FORBIDDEN | アクセス権限なし |
| NOT_FOUND | リソースが見つからない |
| VALIDATION_ERROR | バリデーションエラー |
| DUPLICATE_ENTRY | 重複データ |
| INTERNAL_ERROR | 内部エラー |

---

## 13. レート制限

| エンドポイント | 制限 |
|--------------|------|
| POST /api/auth/login | 5回/分（IP単位） |
| その他のAPI | 100回/分（ユーザー単位） |

**制限超過時のレスポンス（429）**
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

---

## 14. 開発者向け情報

### 14.1 開発環境トークン

開発環境では `dev-token` を使用してモック認証が可能。

```http
Authorization: Bearer dev-token
```

### 14.2 APIクライアント使用例

```typescript
import { getFacility, getMemberWages } from '@/lib/api/client';

// 事業所情報取得
const facility = await getFacility();

// 月次工賃取得
const wages = await getMemberWages(2025, 12);
```

---

## 15. 改訂履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|---------|-------|
| 1.0 | 2026-01-07 | 初版作成 | Claude |
| 1.1 | 2026-01-07 | 工賃計算ロジック概要追加、フェーズ別レート更新 | Claude |
| 1.2 | 2026-01-16 | 工賃計算API（calculate, preview）追加 | Claude |
