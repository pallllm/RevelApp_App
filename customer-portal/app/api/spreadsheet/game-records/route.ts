import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import {
  readMemberListSheet,
  readGamePlayRecords,
  readEntryPlanGamePlayRecords,
  readEntryPlanGameSelection,
  getAvailableMonths,
} from '@/lib/google/spreadsheet-reader';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/spreadsheet/game-records
 * スプレッドシートからゲームプレイ記録を取得
 *
 * クエリパラメータ:
 * - memberId: 利用者ID（フォーカス/フレキシブル用）
 * - year: 対象年
 * - month: 対象月
 * - memberSheetUrl: 利用者のシートURL（直接指定する場合）
 * - entrySheetUrl: エントリープラン用シートURL（直接指定する場合）
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const year = parseInt(searchParams.get('year') || '0');
    const month = parseInt(searchParams.get('month') || '0');
    const memberSheetUrl = searchParams.get('memberSheetUrl');
    const entrySheetUrl = searchParams.get('entrySheetUrl');

    if (!year || !month) {
      return errorResponse(
        new Error('year and month parameters are required'),
        400
      );
    }

    // 施設情報を取得してプランタイプを確認
    const facility = await prisma.facility.findUnique({
      where: { id: user.facilityId },
    });

    if (!facility) {
      return errorResponse(new Error('Facility not found'), 404);
    }

    // エントリープランの場合
    if (entrySheetUrl || facility.planType === 'ENTRY') {
      const sheetUrl = entrySheetUrl || facility.spreadsheetUrl;

      if (!sheetUrl) {
        return errorResponse(
          new Error('Entry plan sheet URL not configured'),
          400
        );
      }

      // エントリープランのデータを取得
      const gameRecords = await readEntryPlanGamePlayRecords(sheetUrl, year, month);
      const gameSelection = await readEntryPlanGameSelection(sheetUrl);
      const availableMonths = await getAvailableMonths(sheetUrl, 'game');

      // ゲームごとのプレイ回数を集計
      const gamePlayCounts: Record<string, number> = {};
      for (const record of gameRecords.records) {
        gamePlayCounts[record.gameName] = (gamePlayCounts[record.gameName] || 0) + 1;
      }

      return successResponse({
        planType: 'ENTRY',
        year,
        month,
        facilityId: facility.id,
        gameSelection,
        records: gameRecords.records.map(r => ({
          date: r.date.toISOString().split('T')[0],
          gameName: r.gameName,
          gameData: r.gameData,
        })),
        totalPlayCount: gameRecords.totalPlayCount,
        gamePlayCounts,
        availableMonths,
      });
    }

    // フォーカス/フレキシブルプランの場合
    let spreadsheetUrl: string;

    if (memberSheetUrl) {
      spreadsheetUrl = memberSheetUrl;
    } else if (memberId) {
      if (!facility.spreadsheetUrl) {
        return errorResponse(
          new Error('Member list sheet URL not configured'),
          400
        );
      }

      const memberListSheet = await readMemberListSheet(facility.spreadsheetUrl);
      const member = memberListSheet.members.find(m => m.id === memberId);

      if (!member) {
        return errorResponse(new Error('Member not found'), 404);
      }

      if (!member.spreadsheetUrl) {
        return errorResponse(
          new Error('Member spreadsheet URL not configured'),
          400
        );
      }

      spreadsheetUrl = member.spreadsheetUrl;
    } else {
      return errorResponse(
        new Error('memberId or memberSheetUrl is required for Focus/Flexible plan'),
        400
      );
    }

    // ゲームプレイ記録を読み取り
    const records = await readGamePlayRecords(spreadsheetUrl, year, month);
    const availableMonths = await getAvailableMonths(spreadsheetUrl, 'game');

    // ゲームごとのプレイ回数を集計
    const gamePlayCounts: Record<string, number> = {};
    for (const record of records) {
      gamePlayCounts[record.gameName] = (gamePlayCounts[record.gameName] || 0) + 1;
    }

    return successResponse({
      planType: facility.planType,
      year,
      month,
      memberId,
      records: records.map(r => ({
        date: r.date.toISOString().split('T')[0],
        gameName: r.gameName,
        gameData: r.gameData,
      })),
      totalPlayCount: records.length,
      gamePlayCounts,
      availableMonths,
    });
  } catch (error) {
    console.error('Error reading game play records:', error);
    return errorResponse(error);
  }
}
