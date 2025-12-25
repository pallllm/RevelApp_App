import { NextRequest } from 'next/server';
import { verifyWordPressToken, extractTokenFromHeader } from '@/lib/auth/wordpress';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

/**
 * GET /api/health-records?userId=xxx&year=2024&month=12
 * 指定ユーザーの指定月の体調記録を取得
 */
export async function GET(request: NextRequest) {
  try {
    // WordPress JWT認証
    const authHeader = extractTokenFromHeader(request.headers);
    const user = await verifyWordPressToken(authHeader);

    // URLパラメータから取得
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = parseInt(searchParams.get('year') || '0');
    const month = parseInt(searchParams.get('month') || '0');

    if (!userId || !year || !month) {
      return errorResponse(
        new Error('userId, year, and month parameters are required'),
        400
      );
    }

    // ユーザーが同じ事業所に所属しているか確認
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser || targetUser.facilityId !== user.facilityId) {
      return errorResponse(new Error('Unauthorized'), 403);
    }

    // 指定月の最初と最後の日付
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // 体調記録を取得
    const healthRecords = await prisma.healthRecord.findMany({
      where: {
        userId,
        recordDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        recordDate: 'asc',
      },
    });

    return successResponse({
      records: healthRecords.map(record => ({
        date: record.recordDate.toISOString().split('T')[0],
        fatigueLevel: record.fatigueLevel,
        sleepHours: record.sleepHours,
        mood: record.mood,
        emotions: record.emotions,
        weather: record.weather,
        temperature: record.temperature,
        hasPressureChange: record.hasPressureChange,
        achievedTasks: record.achievedTasks,
        difficultTasks: record.difficultTasks,
        freeNotes: record.freeNotes,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
