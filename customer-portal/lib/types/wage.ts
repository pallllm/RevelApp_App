/**
 * 工賃計算システムの型定義
 */

import { PlanType } from '@/lib/google/spreadsheet-types';

// ===================
// フェーズ定義
// ===================

/** 工賃フェーズ名 */
export type WagePhaseName = 'short' | 'mid' | 'long';

/** ゲームレベル（1〜4） */
export type GameLevel = 1 | 2 | 3 | 4;

/** フェーズ別工賃レート */
export interface WagePhaseRate {
  phaseName: WagePhaseName;
  minMonths: number;
  maxMonths: number | null; // null = 上限なし
  rates: {
    level1: number;
    level2: number;
    level3: number;
    level4: number;
  };
}

// ===================
// 計算入力
// ===================

/** 工賃計算入力（1ユーザー分） */
export interface WageCalculationInput {
  userId: string;
  userName: string;
  planType: PlanType;
  startDate: Date | null;
  continuationMonths: number;
  playRecords: PlayRecordInput[];
}

/** プレイ記録入力 */
export interface PlayRecordInput {
  date: Date;
  gameName: string;
  gameLevel: GameLevel;
}

/** 施設の計算入力 */
export interface FacilityWageCalculationInput {
  facilityId: string;
  planType: PlanType;
  year: number;
  month: number;
  activeMemberCount: number; // 在籍利用者数（FLEXIBLE日次上限用）
  members: WageCalculationInput[];
  previousCarryover: number; // 前月繰越金
}

// ===================
// 計算結果
// ===================

/** 工賃計算結果（1ユーザー分） */
export interface MemberWageResult {
  userId: string;
  userName: string;
  phase: WagePhaseName;
  totalWage: number;
  validPlayCount: number;
  excludedPlayCount: number;
  playDetails: PlayWageDetail[];
  calculationLog: CalculationLogEntry[];
}

/** プレイ別工賃詳細 */
export interface PlayWageDetail {
  date: Date;
  gameName: string;
  gameLevel: GameLevel;
  wageRate: number;
  wageAmount: number;
  isValid: boolean;
  excludeReason?: string;
}

/** 計算ログエントリ */
export interface CalculationLogEntry {
  type: 'info' | 'warning' | 'excluded';
  message: string;
  date?: Date;
  gameName?: string;
}

/** 施設の工賃計算結果 */
export interface FacilityWageResult {
  facilityId: string;
  year: number;
  month: number;
  summary: WageSummary;
  members: MemberWageResult[];
  carryover: CarryoverResult;
  calculationLog: CalculationLogEntry[];
}

/** 工賃サマリー */
export interface WageSummary {
  totalWage: number;
  memberCount: number;
  totalPlayCount: number;
  averageWagePerMember: number;
}

/** 繰越金結果 */
export interface CarryoverResult {
  previousCarryover: number;
  currentMonthWage: number;
  totalAmount: number;
  paymentAmount: number;
  nextCarryover: number;
}

// ===================
// 日次集計（FLEXIBLE/FOCUS用）
// ===================

/** 日次プレイ情報 */
export interface DailyPlayInfo {
  date: Date;
  plays: {
    userId: string;
    gameName: string;
    gameLevel: GameLevel;
    wageRate: number;
  }[];
}

/** 日次集計結果（FLEXIBLE用） */
export interface DailyAggregation {
  date: Date;
  totalPlays: number;
  validPlays: number;
  dailyLimit: number;
  selectedPlays: {
    userId: string;
    gameName: string;
    gameLevel: GameLevel;
    wageRate: number;
  }[];
  excludedPlays: {
    userId: string;
    gameName: string;
    reason: string;
  }[];
}

// ===================
// API リクエスト/レスポンス
// ===================

/** 工賃計算APIリクエスト */
export interface WageCalculateRequest {
  year: number;
  month: number;
  dryRun?: boolean;
}

/** 工賃計算APIレスポンス */
export interface WageCalculateResponse {
  success: boolean;
  result: FacilityWageResult;
  savedToDb: boolean;
}

/** 工賃プレビューレスポンス */
export interface WagePreviewResponse {
  success: boolean;
  result: FacilityWageResult;
}

// ===================
// ゲームレベル判定用
// ===================

/** ゲーム名からレベルを抽出 */
export function extractGameLevel(gameName: string): GameLevel {
  // ゲーム名に含まれる "Lv1", "Lv2", "Lv3", "Lv4" を検出
  const match = gameName.match(/Lv(\d)/i);
  if (match) {
    const level = parseInt(match[1], 10);
    if (level >= 1 && level <= 4) {
      return level as GameLevel;
    }
  }
  // デフォルトはLv1
  return 1;
}

// ===================
// フェーズ判定用
// ===================

/** 継続月数からフェーズを判定 */
export function determinePhase(continuationMonths: number): WagePhaseName {
  if (continuationMonths < 3) {
    return 'short';
  } else if (continuationMonths < 9) {
    return 'mid';
  } else {
    return 'long';
  }
}

// ===================
// デフォルトレート
// ===================

/** フェーズ別デフォルトレート */
export const DEFAULT_WAGE_RATES: WagePhaseRate[] = [
  {
    phaseName: 'short',
    minMonths: 0,
    maxMonths: 3,
    rates: { level1: 50, level2: 60, level3: 70, level4: 80 },
  },
  {
    phaseName: 'mid',
    minMonths: 3,
    maxMonths: 9,
    rates: { level1: 60, level2: 70, level3: 80, level4: 90 },
  },
  {
    phaseName: 'long',
    minMonths: 9,
    maxMonths: null,
    rates: { level1: 70, level2: 80, level3: 90, level4: 100 },
  },
];

/** ENTRYプランの固定単価 */
export const ENTRY_PLAN_FIXED_WAGE = 50;

/** 繰越金の最低支払額 */
export const MINIMUM_PAYMENT_AMOUNT = 1000;
