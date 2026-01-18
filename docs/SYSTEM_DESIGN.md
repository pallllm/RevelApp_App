# RevelApp Customer Portal - システム設計書

**バージョン**: 1.2
**最終更新**: 2026年1月16日
**ステータス**: Draft

---

## 1. システム概要

### 1.1 システム構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                         クライアント層                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js Frontend (React 18)                 │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │  Pages  │  │Components│  │ Hooks   │  │ Context │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         アプリケーション層                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js API Routes (BFF)                    │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │  Auth   │  │ Business│  │Validation│  │ Response│    │   │
│  │  │Middleware│  │  Logic  │  │  Layer  │  │ Handler │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ Prisma Client
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         データ層                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │  PostgreSQL   │  │   WordPress   │  │  Google APIs  │       │
│  │  (Supabase)   │  │  (JWT Auth)   │  │(Calendar/Drive)│       │
│  └───────────────┘  └───────────────┘  └───────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|----------|
| **Frontend** | Next.js (App Router) | 14.2.x |
| | React | 18.3.x |
| | TypeScript | 5.x |
| | Tailwind CSS | 3.4.x |
| | Recharts | 2.12.x |
| **Backend** | Next.js API Routes | 14.2.x |
| | Prisma ORM | 5.22.x |
| | jsonwebtoken | 9.0.x |
| | bcryptjs | 3.0.x |
| | Zod | 4.2.x |
| **Database** | PostgreSQL | 15+ |
| | Supabase | - |
| **Infrastructure** | Vercel | - |
| **External APIs** | WordPress REST API | - |
| | Google Calendar API | v3 |
| | Google Drive API | v3 |
| | Google Sheets API | v4 |

---

## 2. アーキテクチャ設計

### 2.1 ディレクトリ構造

```
customer-portal/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # ルートページ（リダイレクト）
│   ├── login/                    # ログインページ
│   │   └── page.tsx
│   ├── app/                      # メインアプリケーション
│   │   ├── layout.tsx            # アプリレイアウト
│   │   ├── page.tsx              # ダッシュボード
│   │   ├── members/              # 利用者管理
│   │   ├── games/                # ゲーム管理
│   │   ├── health-graph/         # 体調グラフ
│   │   ├── rewards/              # 工賃管理
│   │   ├── requests/             # 変更申請
│   │   ├── contract/             # 契約情報
│   │   └── support/              # サポート
│   └── api/                      # API Routes
│       ├── auth/                 # 認証API
│       ├── facilities/           # 事業所API
│       ├── members/              # 利用者API
│       ├── games/                # ゲームAPI
│       ├── health-records/       # 体調記録API
│       ├── wages/                # 工賃API
│       ├── change-requests/      # 変更申請API
│       └── notifications/        # 通知API
├── components/                   # UIコンポーネント
│   ├── ui/                       # 基本UI
│   ├── layout/                   # レイアウト
│   └── forms/                    # フォーム
├── lib/                          # ユーティリティ
│   ├── prisma.ts                 # Prisma Client
│   ├── auth/                     # 認証ロジック
│   ├── api/                      # APIクライアント
│   ├── utils/                    # ヘルパー関数
│   ├── google/                   # Google API連携
│   └── services/                 # 外部サービス
├── prisma/                       # Prisma設定
│   ├── schema.prisma             # スキーマ定義
│   └── migrations/               # マイグレーション
└── public/                       # 静的ファイル
```

### 2.2 レイヤー構成

```
┌──────────────────────────────────────────────────────┐
│                  Presentation Layer                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │   Pages    │  │ Components │  │   Hooks    │     │
│  │ (app/*.tsx)│  │(/components)│  │ (useXxx)   │     │
│  └────────────┘  └────────────┘  └────────────┘     │
├──────────────────────────────────────────────────────┤
│                  Application Layer                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │ API Routes │  │  Services  │  │ Validators │     │
│  │ (app/api/) │  │ (/lib/*)   │  │  (Zod)     │     │
│  └────────────┘  └────────────┘  └────────────┘     │
├──────────────────────────────────────────────────────┤
│                    Domain Layer                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │   Models   │  │ Business   │  │   Types    │     │
│  │  (Prisma)  │  │   Logic    │  │ (TS Types) │     │
│  └────────────┘  └────────────┘  └────────────┘     │
├──────────────────────────────────────────────────────┤
│                 Infrastructure Layer                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐     │
│  │  Database  │  │ External   │  │   Cache    │     │
│  │ (Prisma)   │  │   APIs     │  │ (Future)   │     │
│  └────────────┘  └────────────┘  └────────────┘     │
└──────────────────────────────────────────────────────┘
```

---

## 3. 認証・認可設計

### 3.1 認証フロー

```
┌────────┐      ┌────────────┐      ┌────────────┐      ┌────────┐
│ Client │      │ Login Page │      │  API Route │      │   DB   │
└───┬────┘      └─────┬──────┘      └─────┬──────┘      └───┬────┘
    │                 │                   │                 │
    │  1. アクセス     │                   │                 │
    ├────────────────>│                   │                 │
    │                 │                   │                 │
    │  2. ログインフォーム表示              │                 │
    │<────────────────│                   │                 │
    │                 │                   │                 │
    │  3. 認証情報送信  │                   │                 │
    ├────────────────────────────────────>│                 │
    │                 │                   │                 │
    │                 │                   │  4. ユーザー検索  │
    │                 │                   ├────────────────>│
    │                 │                   │                 │
    │                 │                   │  5. ユーザー情報  │
    │                 │                   │<────────────────│
    │                 │                   │                 │
    │                 │                   │  6. パスワード検証│
    │                 │                   │  (bcrypt)       │
    │                 │                   │                 │
    │  7. JWT Token   │                   │                 │
    │<────────────────────────────────────│                 │
    │                 │                   │                 │
    │  8. localStorage に保存              │                 │
    │                 │                   │                 │
```

### 3.2 認証方式

#### 3.2.1 独自JWT認証（推奨）
```typescript
// POST /api/auth/login
{
  "email": "staff@example.com",
  "password": "password123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "staff@example.com",
    "name": "田中太郎",
    "role": "STAFF",
    "facilityId": "uuid"
  }
}
```

#### 3.2.2 WordPress JWT認証（レガシー対応）
```typescript
// WordPress: POST /wp-json/jwt-auth/v1/token
{
  "username": "user@example.com",
  "password": "password"
}

// JWT Payload
{
  "data": {
    "user": {
      "id": 123,
      "user_email": "user@example.com",
      "user_nicename": "user",
      "user_display_name": "User Name"
    }
  },
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 3.3 認可（ロールベースアクセス制御）

| エンドポイント | ADMIN | STAFF | MEMBER |
|--------------|-------|-------|--------|
| GET /api/facilities | ✅ | ✅ | ❌ |
| PATCH /api/facilities | ✅ | ✅ | ❌ |
| GET /api/members | ✅ | ✅ | ❌ |
| POST /api/members | ✅ | ✅ | ❌ |
| GET /api/wages/* | ✅ | ✅ | ❌ |
| POST /api/change-requests | ✅ | ✅ | ❌ |
| GET /api/admin/* | ✅ | ❌ | ❌ |

### 3.4 セキュリティ対策

| 対策 | 実装方法 |
|-----|---------|
| パスワードハッシュ | bcryptjs (saltRounds: 10) |
| JWT署名 | HS256 (NEXTAUTH_SECRET) |
| トークン有効期限 | 7日間 |
| HTTPS強制 | Vercel自動対応 |
| CORS | Next.js設定 |
| XSS対策 | React自動エスケープ |
| CSRF対策 | SameSite Cookie |

---

## 4. コンポーネント設計

### 4.1 コンポーネント階層

```
App
├── AuthProvider (認証Context)
│   └── AppLayout
│       ├── Sidebar
│       │   ├── Logo
│       │   ├── NavItem (x8)
│       │   └── UserInfo
│       ├── Header
│       │   ├── SearchBar
│       │   └── NotificationDropdown
│       └── MainContent
│           └── [Page Components]
```

### 4.2 主要コンポーネント仕様

#### 4.2.1 StatCard
統計表示カード
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: 'purple' | 'blue' | 'green' | 'orange';
}
```

#### 4.2.2 Sidebar
サイドナビゲーション
```typescript
const menuItems = [
  { icon: Home, label: 'ホーム', href: '/app' },
  { icon: Users, label: '利用者管理', href: '/app/members' },
  { icon: Gamepad2, label: 'ゲーム管理', href: '/app/games' },
  { icon: Activity, label: '体調グラフ', href: '/app/health-graph' },
  { icon: Coins, label: '工賃管理', href: '/app/rewards' },
  { icon: FileEdit, label: '変更申請', href: '/app/requests' },
  { icon: FileText, label: '契約情報', href: '/app/contract' },
  { icon: HelpCircle, label: 'サポート', href: '/app/support' },
];
```

#### 4.2.3 変更申請フォーム群
```typescript
// フォーム種別
type RequestFormType =
  | 'PlanChangeForm'      // プラン変更
  | 'GameChangeForm'      // ゲーム変更
  | 'UserAddForm'         // 利用者追加
  | 'UserRemoveForm'      // 利用者削除
  | 'PcAddForm'           // PC追加
  | 'PcChangeForm'        // PC変更
  | 'PaymentChangeForm'   // 支払方法変更
  | 'WageAccountForm'     // 口座変更
  | 'OtherInquiryForm';   // その他

// 共通Props
interface RequestFormProps {
  facilityId: string;
  onSubmit: (data: RequestData) => Promise<void>;
  onCancel: () => void;
}
```

### 4.3 状態管理

#### 4.3.1 認証状態（Context API）
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

#### 4.3.2 ページ状態（useState/useEffect）
```typescript
// 例: ダッシュボードページ
const [facility, setFacility] = useState<Facility | null>(null);
const [stats, setStats] = useState<FacilityStats | null>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  Promise.all([getFacility(), getFacilityStats()])
    .then(([f, s]) => { setFacility(f); setStats(s); })
    .finally(() => setIsLoading(false));
}, []);
```

---

## 5. API設計

### 5.1 APIルーティング規則

| パターン | HTTP Method | 用途 |
|---------|-------------|-----|
| /api/[resource] | GET | 一覧取得 |
| /api/[resource] | POST | 新規作成 |
| /api/[resource]/[id] | GET | 詳細取得 |
| /api/[resource]/[id] | PATCH | 部分更新 |
| /api/[resource]/[id] | DELETE | 削除 |

### 5.2 レスポンス形式

#### 成功レスポンス
```typescript
// 単一リソース
{
  "facility": { ... }
}

// リスト
{
  "members": [ ... ],
  "total": 15
}

// 作成・更新
{
  "member": { ... },
  "message": "Member created successfully"
}
```

#### エラーレスポンス
```typescript
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }  // オプション
}
```

### 5.3 エラーハンドリング

| エラークラス | HTTPステータス | 用途 |
|------------|--------------|------|
| AuthenticationError | 401 | 認証エラー |
| AuthorizationError | 403 | 権限エラー |
| NotFoundError | 404 | リソース未発見 |
| ValidationError | 400 | バリデーションエラー |
| ApiError | 500 | 内部エラー |

---

## 6. 外部連携設計

### 6.1 WordPress連携

```
┌─────────────────┐         ┌─────────────────┐
│  Customer Portal │         │    WordPress    │
│                 │         │                 │
│  ┌───────────┐  │  JWT    │  ┌───────────┐  │
│  │ Auth      │◄─┼─────────┼──│ JWT Plugin│  │
│  │ Module    │  │         │  └───────────┘  │
│  └───────────┘  │         │                 │
│                 │  REST   │  ┌───────────┐  │
│  ┌───────────┐  │  API    │  │ Posts     │  │
│  │ Notif.   │◄─┼─────────┼──│ (お知らせ) │  │
│  │ Module    │  │         │  └───────────┘  │
│  └───────────┘  │         │                 │
└─────────────────┘         └─────────────────┘
```

### 6.2 Google連携

```
┌─────────────────┐         ┌─────────────────┐
│  Customer Portal │         │   Google Cloud  │
│                 │         │                 │
│  ┌───────────┐  │ OAuth2  │  ┌───────────┐  │
│  │ Google    │◄─┼─────────┼──│ OAuth     │  │
│  │ Auth      │  │         │  └───────────┘  │
│  └───────────┘  │         │                 │
│                 │  API    │  ┌───────────┐  │
│  ┌───────────┐  │         │  │ Calendar  │  │
│  │ Calendar  │◄─┼─────────┼──│ API v3    │  │
│  │ Service   │  │         │  └───────────┘  │
│  └───────────┘  │         │                 │
│                 │         │  ┌───────────┐  │
│  ┌───────────┐  │         │  │ Drive     │  │
│  │ Drive     │◄─┼─────────┼──│ API v3    │  │
│  │ Service   │  │         │  └───────────┘  │
│  └───────────┘  │         │                 │
│                 │         │  ┌───────────┐  │
│  ┌───────────┐  │         │  │ Sheets    │  │
│  │ Sheets    │◄─┼─────────┼──│ API v4    │  │
│  │ Service   │  │         │  └───────────┘  │
│  └───────────┘  │         │                 │
└─────────────────┘         └─────────────────┘
```

### 6.3 工賃計算システム（アプリ内）

```
┌─────────────────┐         ┌─────────────────┐
│  運営管理ポータル  │         │  Customer Portal │
│                 │         │     (Next.js)    │
│  ┌───────────┐  │ API     │                 │
│  │ 工賃計算   │──┼────────>│  ┌───────────┐  │
│  │ 画面      │  │         │  │ wage-calc │  │
│  │           │  │         │  │ service   │  │
│  │ ・プレビュー│  │         │  └─────┬─────┘  │
│  │ ・確定    │  │         │        │        │
│  └───────────┘  │         │        ▼        │
└─────────────────┘         │  ┌───────────┐  │
                            │  │ Sheets API│  │
┌─────────────────┐         │  │ (読取)    │  │
│  施設管理シート   │◄────────┼──┴───────────┘  │
│ (Spreadsheet)   │         │                 │
│  ┌───────────┐  │         │  ┌───────────┐  │
│  │ 利用者情報 │  │         │  │ PostgreSQL│  │
│  │ プレイ記録 │  │         │  │ (保存)    │  │
│  └───────────┘  │         │  └───────────┘  │
└─────────────────┘         └─────────────────┘
```

**処理フロー**
```
運営管理ポータル
    ↓ 年月選択
「プレビュー」ボタン
    ↓ GET /api/wages/calculate/preview
スプレッドシートからプレイ記録読取
    ↓ wage-calculator.ts
プラン別計算（ENTRY/FLEXIBLE/FOCUS）
    ↓
計算結果表示（除外理由含む）
    ↓ 確認OK
「確定」ボタン
    ↓ POST /api/wages/calculate
DBに保存（MonthlyWage, MemberMonthlyWage, WageCarryover）
    ↓
施設ポータルに反映
```

**主要コンポーネント**
| コンポーネント | 説明 |
|--------------|------|
| `lib/types/wage.ts` | 工賃計算の型定義 |
| `lib/services/wage-calculator.ts` | 工賃計算ロジック（プラン別計算・繰越金計算） |
| `app/api/wages/calculate/route.ts` | 計算実行API（POST: 計算してDB保存） |
| `app/api/wages/calculate/preview/route.ts` | プレビューAPI（GET: 計算のみ、保存なし） |

**処理タイミング**
- 月次（前月分を対象に計算）
- 運営管理ポータルから手動実行

※ 旧GASによる工賃計算は廃止

---

## 7. ビジネスロジック設計

### 7.1 工賃計算ロジック

#### 7.1.1 計算フロー

```
┌─────────────────────────────────────────────────────────┐
│                    月次工賃計算フロー                      │
│              （運営管理ポータルから実行）                    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ 1. 対象月の選択   │  運営スタッフが年月を選択
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. プレビュー実行 │  GET /api/wages/calculate/preview
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. スプレッドシート │  施設管理シート → 利用者一覧取得
│    からデータ取得  │  各利用者シート → プレイ記録取得
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. フェーズ判定   │  継続月数 → short/mid/long
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 5. プラン別ルール適用                      │
│                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  │ エントリー   │ │フレキシブル  │ │ フォーカス   │
│  │ 50円/プレイ │ │ N件/日上限  │ │ 1件/人/日   │
│  │ 上限なし    │ │ 高単価優先  │ │ 高単価優先  │
│  └─────────────┘ └─────────────┘ └─────────────┘
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ 6. 計算結果表示   │  利用者別工賃、除外理由、計算ログ
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 7. 確定実行      │  POST /api/wages/calculate
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 8. 繰越金計算    │  前月繰越 + 当月 = 報酬額合計
│    DB保存       │  1,000円以上 → 支払い / 未満 → 繰越
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 9. 施設ポータル   │  工賃履歴・利用者別工賃に反映
│    に反映       │
└─────────────────┘
```

#### 7.1.2 工賃フェーズ判定

```typescript
function getTenureCategory(startDate: Date, targetDate: Date): 'short' | 'mid' | 'long' {
  const months = (targetDate.getFullYear() - startDate.getFullYear()) * 12
               + targetDate.getMonth() - startDate.getMonth();

  if (months <= 3) return 'short';  // 0〜3ヶ月
  if (months <= 9) return 'mid';    // 4〜9ヶ月
  return 'long';                    // 9ヶ月以上
}
```

#### 7.1.3 プラン別計算ロジック

**エントリープラン**
```typescript
// 固定50円/プレイ、上限なし
function calculateEntryWage(plays: Play[]): number {
  return plays.length * 50;
}
```

**フレキシブルプラン**
```typescript
// 日次上限 = 在籍利用者数、高単価から採用
function applyFlexibleRules(allPlays: Play[], dailyLimit: number): Play[] {
  const playsByDate = groupByDate(allPlays);

  for (const [date, dailyPlays] of playsByDate) {
    // 工賃単価の高い順にソート
    dailyPlays.sort((a, b) => b.wage - a.wage);

    dailyPlays.forEach((play, index) => {
      if (index < dailyLimit) {
        play.status = '有効';
      } else {
        play.status = '除外';
        play.reason = `1日の上限(${dailyLimit}回)超過`;
      }
    });
  }

  return allPlays;
}
```

**フォーカスプラン**
```typescript
// 1人1日1プレイまで、高単価を採用
function applyFocusRules(allPlays: Play[]): Play[] {
  const playsByUserDay = groupByUserAndDate(allPlays);

  for (const [key, userDailyPlays] of playsByUserDay) {
    // 工賃単価の高い順にソート
    userDailyPlays.sort((a, b) => b.wage - a.wage);

    userDailyPlays.forEach((play, index) => {
      if (index === 0) {
        play.status = '有効';
      } else {
        play.status = '除外';
        play.reason = '1日の上限(1回/人)超過';
      }
    });
  }

  return allPlays;
}
```

#### 7.1.4 繰越金計算

```typescript
interface WageCalculation {
  carryoverAmount: number;     // 前月繰越額
  currentWageTotal: number;    // 当月発生工賃
  totalBill: number;           // 報酬額合計
  paymentAmount: number;       // 支払額
  nextCarryover: number;       // 次回繰越額
}

function calculatePayment(carryover: number, currentWage: number): WageCalculation {
  const totalBill = carryover + currentWage;

  // 1,000円以上なら支払い、未満なら繰越
  const paymentAmount = totalBill >= 1000 ? totalBill : 0;
  const nextCarryover = totalBill >= 1000 ? 0 : totalBill;

  return {
    carryoverAmount: carryover,
    currentWageTotal: currentWage,
    totalBill,
    paymentAmount,
    nextCarryover
  };
}
```

### 7.2 工賃フェーズ別レート

| フェーズ | 継続期間 | Lv1 | Lv2 | Lv3 | Lv4 |
|---------|---------|-----|-----|-----|-----|
| short | 0〜3ヶ月 | 50円 | 60円 | 70円 | 80円 |
| mid | 4〜9ヶ月 | 60円 | 70円 | 80円 | 90円 |
| long | 9ヶ月以上 | 70円 | 80円 | 90円 | 100円 |

### 7.3 対応ゲーム一覧

| ID | ゲーム名 | レベル |
|----|---------|-------|
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

## 8. デプロイメント設計

### 8.1 環境構成

| 環境 | URL | 用途 |
|-----|-----|------|
| Production | customer-portal.revelapp.jp | 本番環境 |
| Preview | *.vercel.app | PR確認用 |
| Development | localhost:3000 | ローカル開発 |

### 8.2 CI/CDフロー

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Push   │───>│  Build  │───>│  Test   │───>│ Deploy  │
│ (GitHub)│    │ (Vercel)│    │ (Vercel)│    │ (Vercel)│
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     │              │              │              │
     │              │              │              │
     ▼              ▼              ▼              ▼
  main branch   next build     lint/type     Production
  feature/*     prisma gen     check         Preview
```

### 8.3 環境変数

| 変数名 | 必須 | 説明 |
|-------|-----|------|
| DATABASE_URL | ✅ | PostgreSQL接続文字列 |
| NEXTAUTH_SECRET | ✅ | JWT署名シークレット |
| WORDPRESS_URL | | WordPress URL |
| WORDPRESS_JWT_SECRET | | WordPress JWT シークレット |
| GOOGLE_CLIENT_ID | | Google OAuth クライアントID |
| GOOGLE_CLIENT_SECRET | | Google OAuth シークレット |
| GOOGLE_CALENDAR_ID | | Google カレンダーID |

---

## 9. 監視・ログ設計

### 9.1 ログ出力

```typescript
// Winston設定
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

// ログレベル
// error: エラー発生時
// warn: 警告（非推奨機能使用等）
// info: 重要な処理完了
// debug: デバッグ情報
```

### 9.2 監視項目

| 項目 | ツール | 閾値 |
|-----|-------|-----|
| レスポンスタイム | Vercel Analytics | 3秒超過でアラート |
| エラー率 | Vercel Logs | 1%超過でアラート |
| 稼働率 | Vercel Status | 99.5%未満でアラート |

---

## 10. セキュリティ設計

### 10.1 脅威と対策

| 脅威 | 対策 |
|-----|------|
| SQLインジェクション | Prisma ORM使用（パラメータ化クエリ） |
| XSS | React自動エスケープ、CSP設定 |
| CSRF | SameSite Cookie、Origin検証 |
| 認証バイパス | JWT検証必須、有効期限設定 |
| データ漏洩 | 施設単位のデータ分離 |

### 10.2 データ保護

```typescript
// 施設単位のデータアクセス制御
const members = await prisma.user.findMany({
  where: {
    facilityId: user.facilityId,  // 必須フィルタ
    role: 'MEMBER',
  },
});
```

---

## 11. 改訂履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|---------|-------|
| 1.0 | 2026-01-07 | 初版作成 | Claude |
| 1.1 | 2026-01-07 | GAS連携・ビジネスロジック設計追加、ゲーム一覧更新 | Claude |
| 1.2 | 2026-01-16 | 工賃計算をGASからアプリ内実装に変更、運営管理ポータルからの手動実行フローに更新 | Claude |
