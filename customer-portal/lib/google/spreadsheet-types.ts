/**
 * スプレッドシート連携の型定義
 */

// ===================
// プラン種別
// ===================
export type PlanType = 'FOCUS' | 'FLEXIBLE' | 'ENTRY';

// ===================
// 利用者一覧シート関連（フォーカス/フレキシブル用）
// ===================

/** 利用者情報（利用者一覧シートから取得） */
export interface MemberInfo {
  id: string;                    // ID（B列）
  name: string;                  // 利用者名（C列）
  startDate: Date | null;        // 開始日（D列）
  spreadsheetUrl: string;        // シートURL（E列）
  sheetType: 'normal' | 'simple'; // 形式（F列）通常版/簡易版
  selectedGames: string[];       // 選択したゲーム（G列〜）
  backupGame: string | null;     // 予備ゲーム
  disease?: string;              // 主な疾患名
  daysPerWeek?: number;          // 週の通所日数
  isWithdrawn: boolean;          // 離脱フラグ
  withdrawnDate?: Date | null;   // 離脱日
}

/** 利用者一覧シートのデータ */
export interface MemberListSheet {
  planType: PlanType;            // プラン種別（C3セル）
  members: MemberInfo[];         // 利用者リスト
}

// ===================
// 体調記録関連（フォーカス/フレキシブル用）
// ===================

/** 気分の選択肢 */
export type MoodType = '絶好調' | '好調' | '普通' | '不調' | '絶不調';

/** 体調記録（1日分） */
export interface HealthRecordRow {
  date: Date;
  mood: MoodType | null;
  emotions: string | null;       // 現在の主な感情
  emotionContext: string | null; // 感情を感じた瞬間や状況
  fatigueLevel: number | null;   // 疲労度（0〜1）
  sleepHours: number | null;     // 睡眠時間（時間）
  sleepMinutes: number | null;   // 睡眠時間（分）
  totalSleepHours: number | null; // 合計睡眠時間
  workReport: string | null;     // 業務報告（AN列）
}

/** 月次体調記録 */
export interface MonthlyHealthRecords {
  year: number;
  month: number;
  memberId: string;
  memberName: string;
  records: HealthRecordRow[];
}

// ===================
// ゲームプレイ記録関連（全プラン共通）
// ===================

/** ゲームプレイ記録（1行分） */
export interface GamePlayRecordRow {
  date: Date;
  gameName: string;              // プレイしたゲーム名
  gameData: Record<string, any>; // ゲーム固有のデータ（スコア等）
}

/** 日次振り返り記録（ゲームプレイ記録表から） */
export interface DailyReflectionRow {
  date: Date;
  achievedTasks: string | null;  // 出来た事/達成した事
  difficultTasks: string | null; // 難しかった事
}

/** 月次ゲームプレイ記録（フォーカス/フレキシブル用） */
export interface MonthlyGamePlayRecords {
  year: number;
  month: number;
  memberId: string;
  memberName: string;
  records: GamePlayRecordRow[];
}

/** 月次ゲームプレイ記録（エントリー用：施設全体） */
export interface MonthlyFacilityGamePlayRecords {
  year: number;
  month: number;
  facilityId: string;
  records: GamePlayRecordRow[];
  totalPlayCount: number;
}

// ===================
// エントリープラン用
// ===================

/** 選択ゲーム一覧（エントリー用） */
export interface EntryPlanGameSelection {
  game1: string;
  game2: string;
  game3: string;
  backupGame: string | null;
}

// ===================
// スプレッドシート列マッピング
// ===================

/** 利用者一覧シートの列マッピング（フォーカス用） */
export const FOCUS_MEMBER_LIST_COLUMNS = {
  id: 'B',
  name: 'C',
  startDate: 'D',
  spreadsheetUrl: 'E',
  sheetType: 'F',
  game1: 'G',
  game2: 'H',
  backupGame: 'I',
  disease: 'M',
  daysPerWeek: 'N',
  withdrawn: 'R',
  withdrawnDate: 'S',
} as const;

/** 利用者一覧シートの列マッピング（フレキシブル用） */
export const FLEXIBLE_MEMBER_LIST_COLUMNS = {
  id: 'B',
  name: 'C',
  startDate: 'D',
  spreadsheetUrl: 'E',
  sheetType: 'F',
  game1: 'G',
  game2: 'H',
  game3: 'I',
  game4: 'J',
  game5: 'K',
  backupGame: 'L',
  disease: 'M',
  daysPerWeek: 'N',
  withdrawn: 'R',
  withdrawnDate: 'S',
} as const;

/** 体調記録表の列マッピング */
export const HEALTH_RECORD_COLUMNS = {
  date: 'B',
  mood: 'C',
  emotions: 'E',
  emotionContext: 'F',
  fatigueLevel: 'G',
  sleepHours: 'H',
  sleepMinutes: 'I',
  totalSleep: 'J',
  workReport: 'AN',  // 業務報告欄
} as const;

/** ゲームプレイ記録表の共通設定 */
export const GAME_PLAY_RECORD_CONFIG = {
  headerRow: 3,      // ゲーム名がある行
  subHeaderRow: 5,   // サブヘッダー行
  exampleRow: 6,     // 例の行
  dataStartRow: 7,   // データ開始行
  dateColumn: 'B',   // 日付列
  playedGameColumn: 'C', // プレイしたゲーム列
  gameDataStartColumn: 'D', // ゲームデータ開始列
} as const;

// ===================
// ヘルパー関数
// ===================

/** シート名から年月を抽出 */
export function parseSheetNameDate(sheetName: string): { year: number; month: number } | null {
  // "2025.12ゲームプレイ記録表" or "2025.12体調記録表" の形式
  const match = sheetName.match(/^(\d{4})\.(\d{2})/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
  };
}

/** 気分文字列をMoodTypeに変換 */
export function parseMood(value: string | null): MoodType | null {
  if (!value) return null;
  const moodMap: Record<string, MoodType> = {
    '絶好調': '絶好調',
    '好調': '好調',
    '普通': '普通',
    '不調': '不調',
    '絶不調': '絶不調',
  };
  return moodMap[value] || null;
}

/** プラン文字列をPlanTypeに変換 */
export function parsePlanType(value: string | null): PlanType | null {
  if (!value) return null;
  const planMap: Record<string, PlanType> = {
    'フォーカス': 'FOCUS',
    'フレキシブル': 'FLEXIBLE',
    'エントリー': 'ENTRY',
  };
  return planMap[value] || null;
}
