export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { verifyWordPressToken, extractTokenFromHeader } from '@/lib/auth/wordpress';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

/**
 * GET /api/facilities/stats
 * ダッシュボード用の統計情報を取得
 */
export async function GET(request: NextRequest) {
  try {
    // WordPress JWT認証
    const authHeader = extractTokenFromHeader(request.headers);
    const user = await verifyWordPressToken(authHeader);

    // 現在の年月を取得
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // 利用者数
    const activeMemberCount = await prisma.user.count({
      where: {
        facilityId: user.facilityId,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });

    // 今月のゲームプレイ回数
    const monthlyPlayCount = await prisma.gamePlayRecord.count({
      where: {
        user: {
          facilityId: user.facilityId,
        },
        playedAt: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1),
        },
      },
    });

    // 前月の工賃情報
    const previousMonthWage = await prisma.monthlyWage.findUnique({
      where: {
        facilityId_year_month: {
          facilityId: user.facilityId,
          year: previousMonthYear,
          month: previousMonth,
        },
      },
    });

    // 累計工賃
    const totalWages = await prisma.monthlyWage.aggregate({
      where: {
        facilityId: user.facilityId,
        status: { in: ['CONFIRMED', 'PAID'] },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // 継続期間（事業所の開設からの月数 - 仮実装）
    const facility = await prisma.facility.findUnique({
      where: { id: user.facilityId },
    });

    const continuationMonths = facility?.createdAt
      ? Math.floor(
          (now.getTime() - facility.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
        )
      : 0;

    // 工賃フェーズ判定
    let wagePhase = await prisma.wagePhase.findFirst({
      where: {
        minMonths: { lte: continuationMonths },
        OR: [{ maxMonths: { gte: continuationMonths } }, { maxMonths: null }],
      },
    });

    return successResponse({
      stats: {
        activeMemberCount,
        monthlyPlayCount,
        previousMonthWage: previousMonthWage
          ? {
              year: previousMonthWage.year,
              month: previousMonthWage.month,
              totalAmount: previousMonthWage.totalAmount,
              memberCount: previousMonthWage.memberCount,
              status: previousMonthWage.status,
            }
          : null,
        totalWages: totalWages._sum.totalAmount || 0,
        continuationMonths,
        wagePhase: wagePhase
          ? {
              phaseName: wagePhase.phaseName,
              level1Wage: wagePhase.level1Wage,
              level2Wage: wagePhase.level2Wage,
              level3Wage: wagePhase.level3Wage,
              level4Wage: wagePhase.level4Wage,
            }
          : null,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
