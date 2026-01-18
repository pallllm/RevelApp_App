/**
 * 工賃計算入力データの構築サービス
 * calculate/route.ts と preview/route.ts で共通利用
 */

import { prisma } from '@/lib/prisma';
import {
  FacilityWageCalculationInput,
  WageCalculationInput,
  PlayRecordInput,
  extractGameLevel,
} from '@/lib/types/wage';
import {
  readMemberListSheet,
  readGamePlayRecords,
  readEntryPlanGamePlayRecords,
} from '@/lib/google/spreadsheet-reader';
import { PlanType } from '@/lib/google/spreadsheet-types';
import { getPreviousCarryover } from './wage-calculator';

/**
 * 施設の工賃計算入力を構築
 */
export async function buildFacilityInput(
  facilityId: string,
  planType: PlanType,
  spreadsheetUrl: string,
  year: number,
  month: number
): Promise<FacilityWageCalculationInput> {
  // 前月繰越金を取得
  const previousCarryover = await getPreviousCarryover(facilityId, year, month);

  if (planType === 'ENTRY') {
    // ENTRYプラン: 施設全体のプレイ記録を取得
    return await buildEntryInput(facilityId, spreadsheetUrl, year, month, previousCarryover);
  } else {
    // FOCUS/FLEXIBLEプラン: 利用者一覧から個別のプレイ記録を取得
    return await buildFocusFlexibleInput(
      facilityId,
      planType,
      spreadsheetUrl,
      year,
      month,
      previousCarryover
    );
  }
}

/**
 * ENTRYプランの入力を構築
 */
async function buildEntryInput(
  facilityId: string,
  spreadsheetUrl: string,
  year: number,
  month: number,
  previousCarryover: number
): Promise<FacilityWageCalculationInput> {
  // 施設のプレイ記録を取得
  const playRecords = await readEntryPlanGamePlayRecords(spreadsheetUrl, year, month);

  // DBの利用者情報を取得
  const members = await prisma.user.findMany({
    where: {
      facilityId,
      role: 'MEMBER',
      status: 'ACTIVE',
    },
  });

  // ENTRYプランは施設全体のプレイ記録を1人のユーザーとして扱う
  const memberInputs: WageCalculationInput[] = [];

  const facilityPlayRecords: PlayRecordInput[] = playRecords.records.map(record => ({
    date: record.date,
    gameName: record.gameName,
    gameLevel: extractGameLevel(record.gameName),
  }));

  if (members.length > 0) {
    memberInputs.push({
      userId: members[0].id,
      userName: members[0].name,
      planType: 'ENTRY',
      startDate: members[0].startDate,
      continuationMonths: members[0].continuationMonths,
      playRecords: facilityPlayRecords,
    });
  }

  return {
    facilityId,
    planType: 'ENTRY',
    year,
    month,
    activeMemberCount: members.length,
    members: memberInputs,
    previousCarryover,
  };
}

/**
 * FOCUS/FLEXIBLEプランの入力を構築
 */
async function buildFocusFlexibleInput(
  facilityId: string,
  planType: PlanType,
  spreadsheetUrl: string,
  year: number,
  month: number,
  previousCarryover: number
): Promise<FacilityWageCalculationInput> {
  // 利用者一覧を読み取り
  const memberList = await readMemberListSheet(spreadsheetUrl);

  // アクティブな利用者のみ抽出
  const activeMembers = memberList.members.filter(m => !m.isWithdrawn);

  // 各利用者のプレイ記録を取得
  const memberInputs: WageCalculationInput[] = [];

  for (const member of activeMembers) {
    if (!member.spreadsheetUrl) {
      continue;
    }

    try {
      // DBからユーザー情報を取得（継続月数など）
      const dbUser = await prisma.user.findFirst({
        where: {
          facilityId,
          name: member.name,
          status: 'ACTIVE',
        },
      });

      // プレイ記録を取得
      const playRecords = await readGamePlayRecords(member.spreadsheetUrl, year, month);

      const playRecordInputs: PlayRecordInput[] = playRecords.map(record => ({
        date: record.date,
        gameName: record.gameName,
        gameLevel: extractGameLevel(record.gameName),
      }));

      memberInputs.push({
        userId: dbUser?.id || member.id,
        userName: member.name,
        planType: memberList.planType,
        startDate: member.startDate,
        continuationMonths: dbUser?.continuationMonths || calculateContinuationMonths(member.startDate, year, month),
        playRecords: playRecordInputs,
      });
    } catch (error) {
      console.warn(`Failed to read play records for ${member.name}:`, error);
    }
  }

  return {
    facilityId,
    planType: memberList.planType,
    year,
    month,
    activeMemberCount: activeMembers.length,
    members: memberInputs,
    previousCarryover,
  };
}

/**
 * 継続月数を計算
 */
export function calculateContinuationMonths(
  startDate: Date | null,
  targetYear: number,
  targetMonth: number
): number {
  if (!startDate) {
    return 0;
  }

  const targetDate = new Date(targetYear, targetMonth - 1, 1);
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  const months = (targetDate.getFullYear() - start.getFullYear()) * 12 +
    (targetDate.getMonth() - start.getMonth());

  return Math.max(0, months);
}
