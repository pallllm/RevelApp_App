import { NextRequest } from 'next/server';
import { verifyWordPressToken, extractTokenFromHeader } from '@/lib/auth/wordpress';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

/**
 * GET /api/wages/members?year=2024&month=12
 * 指定月の利用者別工賃内訳を取得
 */
export async function GET(request: NextRequest) {
  try {
    // WordPress JWT認証
    const authHeader = extractTokenFromHeader(request.headers);
    const user = await verifyWordPressToken(authHeader);

    // URLパラメータから年月を取得
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '0');
    const month = parseInt(searchParams.get('month') || '0');

    if (!year || !month) {
      return errorResponse(
        new Error('year and month parameters are required'),
        400
      );
    }

    // 指定月の工賃データを取得
    const monthlyWage = await prisma.monthlyWage.findUnique({
      where: {
        facilityId_year_month: {
          facilityId: user.facilityId,
          year,
          month,
        },
      },
      include: {
        memberMonthlyWages: {
          include: {
            user: {
              select: {
                name: true,
                initials: true,
              },
            },
          },
          orderBy: {
            amount: 'desc',
          },
        },
      },
    });

    if (!monthlyWage) {
      return successResponse({
        members: [],
      });
    }

    return successResponse({
      members: monthlyWage.memberMonthlyWages.map(memberWage => ({
        name: memberWage.user.name,
        initials: memberWage.user.initials,
        amount: memberWage.amount,
        playCount: memberWage.playCount,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
