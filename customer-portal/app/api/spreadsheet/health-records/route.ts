import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import {
  readMemberListSheet,
  readHealthRecords,
  getAvailableMonths,
} from '@/lib/google/spreadsheet-reader';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/spreadsheet/health-records
 * スプレッドシートから体調記録を取得（フォーカス/フレキシブルプラン用）
 *
 * クエリパラメータ:
 * - memberId: 利用者ID（利用者一覧シートのID）
 * - year: 対象年
 * - month: 対象月
 * - memberSheetUrl: 利用者のシートURL（直接指定する場合）
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const year = parseInt(searchParams.get('year') || '0');
    const month = parseInt(searchParams.get('month') || '0');
    const memberSheetUrl = searchParams.get('memberSheetUrl');

    if (!year || !month) {
      return errorResponse(
        new Error('year and month parameters are required'),
        400
      );
    }

    let spreadsheetUrl: string;

    if (memberSheetUrl) {
      // 直接URLが指定された場合
      spreadsheetUrl = memberSheetUrl;
    } else if (memberId) {
      // memberIdから利用者のシートURLを取得
      const facility = await prisma.facility.findUnique({
        where: { id: user.facilityId },
      });

      if (!facility?.spreadsheetUrl) {
        return errorResponse(
          new Error('Member list sheet URL not configured'),
          400
        );
      }

      // 利用者一覧から該当者を探す
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
        new Error('memberId or memberSheetUrl is required'),
        400
      );
    }

    // 体調記録を読み取り
    const records = await readHealthRecords(spreadsheetUrl, year, month);

    // 利用可能な月一覧も取得
    const availableMonths = await getAvailableMonths(spreadsheetUrl, 'health');

    return successResponse({
      year,
      month,
      memberId,
      records: records.map(r => ({
        date: r.date.toISOString().split('T')[0],
        mood: r.mood,
        emotions: r.emotions,
        emotionContext: r.emotionContext,
        fatigueLevel: r.fatigueLevel,
        sleepHours: r.sleepHours,
        sleepMinutes: r.sleepMinutes,
        totalSleepHours: r.totalSleepHours,
      })),
      totalRecords: records.length,
      availableMonths,
    });
  } catch (error) {
    console.error('Error reading health records:', error);
    return errorResponse(error);
  }
}
