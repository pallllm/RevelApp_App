/**
 * 工賃計算サービス
 * プラン別の工賃計算ロジックを実装
 */

import { PlanType } from '@/lib/google/spreadsheet-types';
import {
  WagePhaseName,
  GameLevel,
  WagePhaseRate,
  WageCalculationInput,
  FacilityWageCalculationInput,
  MemberWageResult,
  PlayWageDetail,
  CalculationLogEntry,
  FacilityWageResult,
  WageSummary,
  CarryoverResult,
  DailyPlayInfo,
  determinePhase,
  extractGameLevel,
  DEFAULT_WAGE_RATES,
  ENTRY_PLAN_FIXED_WAGE,
  MINIMUM_PAYMENT_AMOUNT,
} from '@/lib/types/wage';
import { prisma } from '@/lib/prisma';

// ===================
// 工賃レート取得
// ===================

/**
 * DBまたはデフォルトから工賃フェーズレートを取得
 */
export async function getWagePhaseRates(): Promise<WagePhaseRate[]> {
  const phases = await prisma.wagePhase.findMany({
    orderBy: { minMonths: 'asc' },
  });

  if (phases.length === 0) {
    return DEFAULT_WAGE_RATES;
  }

  return phases.map(phase => ({
    phaseName: mapPhaseName(phase.phaseName),
    minMonths: phase.minMonths,
    maxMonths: phase.maxMonths,
    rates: {
      level1: phase.level1Wage,
      level2: phase.level2Wage,
      level3: phase.level3Wage,
      level4: phase.level4Wage,
    },
  }));
}

/**
 * フェーズ名をWagePhaseNameにマッピング
 */
function mapPhaseName(phaseName: string): WagePhaseName {
  const mapping: Record<string, WagePhaseName> = {
    '0〜3ヶ月': 'short',
    '0-3ヶ月': 'short',
    'short': 'short',
    '3〜9ヶ月': 'mid',
    '3-9ヶ月': 'mid',
    'mid': 'mid',
    '9ヶ月以上': 'long',
    'long': 'long',
  };
  return mapping[phaseName] || 'short';
}

/**
 * フェーズとレベルから工賃レートを取得
 */
export function getWageRate(
  rates: WagePhaseRate[],
  phase: WagePhaseName,
  level: GameLevel
): number {
  const phaseRate = rates.find(r => r.phaseName === phase);
  if (!phaseRate) {
    return DEFAULT_WAGE_RATES.find(r => r.phaseName === phase)!.rates[`level${level}`];
  }
  return phaseRate.rates[`level${level}`];
}

// ===================
// ENTRYプラン計算
// ===================

/**
 * ENTRYプランの工賃計算
 * - 固定50円/プレイ
 * - 上限なし
 */
export function calculateEntryPlanWage(
  input: WageCalculationInput
): MemberWageResult {
  const playDetails: PlayWageDetail[] = [];
  const calculationLog: CalculationLogEntry[] = [];
  let totalWage = 0;

  for (const record of input.playRecords) {
    const detail: PlayWageDetail = {
      date: record.date,
      gameName: record.gameName,
      gameLevel: record.gameLevel,
      wageRate: ENTRY_PLAN_FIXED_WAGE,
      wageAmount: ENTRY_PLAN_FIXED_WAGE,
      isValid: true,
    };
    playDetails.push(detail);
    totalWage += ENTRY_PLAN_FIXED_WAGE;
  }

  calculationLog.push({
    type: 'info',
    message: `ENTRYプラン: ${input.playRecords.length}件のプレイ x ${ENTRY_PLAN_FIXED_WAGE}円 = ${totalWage}円`,
  });

  return {
    userId: input.userId,
    userName: input.userName,
    phase: 'short', // ENTRYはフェーズ不問
    totalWage,
    validPlayCount: input.playRecords.length,
    excludedPlayCount: 0,
    playDetails,
    calculationLog,
  };
}

// ===================
// FOCUSプラン計算
// ===================

/**
 * FOCUSプランの工賃計算
 * - 1人1日1プレイ
 * - 高単価優先
 */
export function calculateFocusPlanWage(
  input: WageCalculationInput,
  rates: WagePhaseRate[]
): MemberWageResult {
  const playDetails: PlayWageDetail[] = [];
  const calculationLog: CalculationLogEntry[] = [];

  const phase = determinePhase(input.continuationMonths);

  calculationLog.push({
    type: 'info',
    message: `継続${input.continuationMonths}ヶ月 → フェーズ: ${phase}`,
  });

  // 日付ごとにグループ化
  const playsByDate = groupPlaysByDate(input.playRecords);

  let totalWage = 0;
  let validCount = 0;
  let excludedCount = 0;

  for (const [dateStr, plays] of Object.entries(playsByDate)) {
    // 各日付について高単価順にソート
    const sortedPlays = plays
      .map(p => ({
        ...p,
        wageRate: getWageRate(rates, phase, p.gameLevel),
      }))
      .sort((a, b) => b.wageRate - a.wageRate);

    // 最初の1件のみ有効
    sortedPlays.forEach((play, index) => {
      const isValid = index === 0;
      const detail: PlayWageDetail = {
        date: play.date,
        gameName: play.gameName,
        gameLevel: play.gameLevel,
        wageRate: play.wageRate,
        wageAmount: isValid ? play.wageRate : 0,
        isValid,
        excludeReason: isValid ? undefined : 'FOCUSプラン: 1日1プレイ制限',
      };
      playDetails.push(detail);

      if (isValid) {
        totalWage += play.wageRate;
        validCount++;
      } else {
        excludedCount++;
        calculationLog.push({
          type: 'excluded',
          message: `${formatDate(play.date)}: ${play.gameName} - 1日1プレイ制限により除外`,
          date: play.date,
          gameName: play.gameName,
        });
      }
    });
  }

  calculationLog.push({
    type: 'info',
    message: `FOCUSプラン合計: 有効${validCount}件、除外${excludedCount}件、工賃${totalWage}円`,
  });

  return {
    userId: input.userId,
    userName: input.userName,
    phase,
    totalWage,
    validPlayCount: validCount,
    excludedPlayCount: excludedCount,
    playDetails,
    calculationLog,
  };
}

// ===================
// FLEXIBLEプラン計算
// ===================

/**
 * FLEXIBLEプランの工賃計算（施設全体）
 * - 日次上限 = 在籍利用者数
 * - 高単価優先
 */
export function calculateFlexiblePlanWages(
  facilityInput: FacilityWageCalculationInput,
  rates: WagePhaseRate[]
): MemberWageResult[] {
  const results: MemberWageResult[] = [];
  const memberResultMap = new Map<string, MemberWageResult>();

  // 各メンバーの初期結果を作成
  for (const member of facilityInput.members) {
    const phase = determinePhase(member.continuationMonths);
    memberResultMap.set(member.userId, {
      userId: member.userId,
      userName: member.userName,
      phase,
      totalWage: 0,
      validPlayCount: 0,
      excludedPlayCount: 0,
      playDetails: [],
      calculationLog: [{
        type: 'info',
        message: `継続${member.continuationMonths}ヶ月 → フェーズ: ${phase}`,
      }],
    });
  }

  // 日付ごとに全メンバーのプレイを収集
  const dailyPlays = collectDailyPlays(facilityInput.members, rates);
  const dailyLimit = facilityInput.activeMemberCount;

  for (const daily of dailyPlays) {
    // 高単価順にソート
    const sortedPlays = daily.plays.sort((a, b) => b.wageRate - a.wageRate);

    // 日次上限まで有効
    let validCount = 0;

    for (const play of sortedPlays) {
      const memberResult = memberResultMap.get(play.userId)!;
      const isValid = validCount < dailyLimit;

      const detail: PlayWageDetail = {
        date: daily.date,
        gameName: play.gameName,
        gameLevel: play.gameLevel,
        wageRate: play.wageRate,
        wageAmount: isValid ? play.wageRate : 0,
        isValid,
        excludeReason: isValid ? undefined : `FLEXIBLEプラン: 日次上限(${dailyLimit}件)超過`,
      };
      memberResult.playDetails.push(detail);

      if (isValid) {
        memberResult.totalWage += play.wageRate;
        memberResult.validPlayCount++;
        validCount++;
      } else {
        memberResult.excludedPlayCount++;
        memberResult.calculationLog.push({
          type: 'excluded',
          message: `${formatDate(daily.date)}: ${play.gameName} - 日次上限超過により除外`,
          date: daily.date,
          gameName: play.gameName,
        });
      }
    }
  }

  // 結果を配列に変換
  for (const member of facilityInput.members) {
    const result = memberResultMap.get(member.userId)!;
    result.calculationLog.push({
      type: 'info',
      message: `FLEXIBLEプラン合計: 有効${result.validPlayCount}件、除外${result.excludedPlayCount}件、工賃${result.totalWage}円`,
    });
    results.push(result);
  }

  return results;
}

// ===================
// メイン計算関数
// ===================

/**
 * 施設の月次工賃を計算
 */
export async function calculateMonthlyWage(
  facilityInput: FacilityWageCalculationInput
): Promise<FacilityWageResult> {
  const rates = await getWagePhaseRates();
  const calculationLog: CalculationLogEntry[] = [];
  let memberResults: MemberWageResult[] = [];

  calculationLog.push({
    type: 'info',
    message: `${facilityInput.year}年${facilityInput.month}月の工賃計算開始 - プラン: ${facilityInput.planType}`,
  });

  switch (facilityInput.planType) {
    case 'ENTRY':
      // ENTRYは個別計算
      memberResults = facilityInput.members.map(m => calculateEntryPlanWage(m));
      break;

    case 'FOCUS':
      // FOCUSは個別計算
      memberResults = facilityInput.members.map(m => calculateFocusPlanWage(m, rates));
      break;

    case 'FLEXIBLE':
      // FLEXIBLEは施設全体で計算
      memberResults = calculateFlexiblePlanWages(facilityInput, rates);
      break;
  }

  // サマリー計算
  const totalWage = memberResults.reduce((sum, m) => sum + m.totalWage, 0);
  const totalPlayCount = memberResults.reduce((sum, m) => sum + m.validPlayCount, 0);

  const summary: WageSummary = {
    totalWage,
    memberCount: memberResults.length,
    totalPlayCount,
    averageWagePerMember: memberResults.length > 0 ? Math.round(totalWage / memberResults.length) : 0,
  };

  // 繰越金計算
  const carryover = calculateCarryover(
    facilityInput.previousCarryover,
    totalWage
  );

  calculationLog.push({
    type: 'info',
    message: `計算完了: 総工賃${totalWage}円、対象${memberResults.length}人、プレイ${totalPlayCount}件`,
  });

  calculationLog.push({
    type: 'info',
    message: `繰越: 前月${carryover.previousCarryover}円 + 当月${carryover.currentMonthWage}円 = ${carryover.totalAmount}円 → 支払${carryover.paymentAmount}円、次月繰越${carryover.nextCarryover}円`,
  });

  return {
    facilityId: facilityInput.facilityId,
    year: facilityInput.year,
    month: facilityInput.month,
    summary,
    members: memberResults,
    carryover,
    calculationLog,
  };
}

// ===================
// 繰越金計算
// ===================

/**
 * 繰越金の計算
 * - 報酬額合計 = 前月繰越 + 当月工賃
 * - 1,000円以上 → 支払い、繰越=0
 * - 1,000円未満 → 繰越
 */
export function calculateCarryover(
  previousCarryover: number,
  currentMonthWage: number
): CarryoverResult {
  const totalAmount = previousCarryover + currentMonthWage;

  let paymentAmount: number;
  let nextCarryover: number;

  if (totalAmount >= MINIMUM_PAYMENT_AMOUNT) {
    paymentAmount = totalAmount;
    nextCarryover = 0;
  } else {
    paymentAmount = 0;
    nextCarryover = totalAmount;
  }

  return {
    previousCarryover,
    currentMonthWage,
    totalAmount,
    paymentAmount,
    nextCarryover,
  };
}

// ===================
// DB保存
// ===================

/**
 * 計算結果をDBに保存
 */
export async function saveWageResult(
  result: FacilityWageResult
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 既存データを削除
    const existingMonthlyWage = await tx.monthlyWage.findUnique({
      where: {
        facilityId_year_month: {
          facilityId: result.facilityId,
          year: result.year,
          month: result.month,
        },
      },
    });

    if (existingMonthlyWage) {
      // 関連する MemberMonthlyWage を削除
      await tx.memberMonthlyWage.deleteMany({
        where: { monthlyWageId: existingMonthlyWage.id },
      });

      // MonthlyWage を削除
      await tx.monthlyWage.delete({
        where: { id: existingMonthlyWage.id },
      });
    }

    // MonthlyWage を作成
    const monthlyWage = await tx.monthlyWage.create({
      data: {
        facilityId: result.facilityId,
        year: result.year,
        month: result.month,
        totalAmount: result.summary.totalWage,
        memberCount: result.summary.memberCount,
        status: 'CONFIRMED',
      },
    });

    // MemberMonthlyWage を作成
    for (const member of result.members) {
      if (member.validPlayCount > 0) {
        await tx.memberMonthlyWage.create({
          data: {
            monthlyWageId: monthlyWage.id,
            userId: member.userId,
            amount: member.totalWage,
            playCount: member.validPlayCount,
          },
        });
      }
    }

    // 繰越金を保存
    await tx.wageCarryover.upsert({
      where: {
        facilityId_year_month: {
          facilityId: result.facilityId,
          year: result.year,
          month: result.month,
        },
      },
      update: {
        amount: result.carryover.nextCarryover,
      },
      create: {
        facilityId: result.facilityId,
        year: result.year,
        month: result.month,
        amount: result.carryover.nextCarryover,
      },
    });
  });
}

// ===================
// ヘルパー関数
// ===================

/**
 * プレイ記録を日付ごとにグループ化
 */
function groupPlaysByDate(
  playRecords: { date: Date; gameName: string; gameLevel: GameLevel }[]
): Record<string, { date: Date; gameName: string; gameLevel: GameLevel }[]> {
  const groups: Record<string, { date: Date; gameName: string; gameLevel: GameLevel }[]> = {};

  for (const record of playRecords) {
    const dateStr = formatDate(record.date);
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(record);
  }

  return groups;
}

/**
 * 全メンバーの日次プレイ情報を収集
 */
function collectDailyPlays(
  members: WageCalculationInput[],
  rates: WagePhaseRate[]
): DailyPlayInfo[] {
  const dailyMap = new Map<string, DailyPlayInfo>();

  for (const member of members) {
    const phase = determinePhase(member.continuationMonths);

    for (const record of member.playRecords) {
      const dateStr = formatDate(record.date);

      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, {
          date: record.date,
          plays: [],
        });
      }

      dailyMap.get(dateStr)!.plays.push({
        userId: member.userId,
        gameName: record.gameName,
        gameLevel: record.gameLevel,
        wageRate: getWageRate(rates, phase, record.gameLevel),
      });
    }
  }

  // 日付順にソート
  return Array.from(dailyMap.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}

/**
 * 日付をフォーマット
 */
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 前月の繰越金を取得
 */
export async function getPreviousCarryover(
  facilityId: string,
  year: number,
  month: number
): Promise<number> {
  // 前月を計算
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth === 0) {
    prevYear -= 1;
    prevMonth = 12;
  }

  const carryover = await prisma.wageCarryover.findUnique({
    where: {
      facilityId_year_month: {
        facilityId,
        year: prevYear,
        month: prevMonth,
      },
    },
  });

  return carryover?.amount || 0;
}
