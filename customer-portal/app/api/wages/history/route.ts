import { NextRequest } from 'next/server';
import { verifyWordPressToken, extractTokenFromHeader } from '@/lib/auth/wordpress';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

/**
 * GET /api/wages/history
 * 工賃履歴を取得
 */
export async function GET(request: NextRequest) {
  try {
    // WordPress JWT認証
    const authHeader = extractTokenFromHeader(request.headers);
    const user = await verifyWordPressToken(authHeader);

    // 工賃履歴を取得（最新12ヶ月分）
    const wageHistory = await prisma.monthlyWage.findMany({
      where: {
        facilityId: user.facilityId,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
      take: 12,
    });

    return successResponse({
      history: wageHistory.map(wage => ({
        id: wage.id,
        year: wage.year,
        month: wage.month,
        totalAmount: wage.totalAmount,
        memberCount: wage.memberCount,
        status: wage.status,
        paymentDate: wage.paymentDate,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
