import { NextRequest } from 'next/server';
import { verifyWordPressToken, extractTokenFromHeader } from '@/lib/auth/wordpress';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

/**
 * GET /api/wages/carryover?year=2024&month=12
 * 指定月の繰越金額を取得
 */
export async function GET(request: NextRequest) {
  try {
    // WordPress JWT認証
    const authHeader = extractTokenFromHeader(request.headers);
    const user = await verifyWordPressToken(authHeader);

    // URLパラメータから年月を取得（デフォルトは次月）
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const defaultYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
    const defaultMonth = now.getMonth() === 11 ? 1 : now.getMonth() + 2;

    const year = parseInt(searchParams.get('year') || defaultYear.toString());
    const month = parseInt(searchParams.get('month') || defaultMonth.toString());

    // 繰越金額を取得
    const carryover = await prisma.wageCarryover.findUnique({
      where: {
        facilityId_year_month: {
          facilityId: user.facilityId,
          year,
          month,
        },
      },
    });

    return successResponse({
      carryover: carryover
        ? {
            year: carryover.year,
            month: carryover.month,
            amount: carryover.amount,
          }
        : null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
