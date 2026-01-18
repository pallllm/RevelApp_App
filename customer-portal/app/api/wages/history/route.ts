export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { verifyWordPressToken, extractTokenFromHeader } from '@/lib/auth/wordpress';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

/**
 * GET /api/wages/history
 * GET /api/wages/history?all=true (全件取得)
 * 工賃履歴を取得
 */
export async function GET(request: NextRequest) {
  try {
    // WordPress JWT認証
    const authHeader = extractTokenFromHeader(request.headers);
    const user = await verifyWordPressToken(authHeader);

    // クエリパラメータで全件取得かどうかを判定
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get('all') === 'true';

    // 工賃履歴を取得
    const wageHistory = await prisma.monthlyWage.findMany({
      where: {
        facilityId: user.facilityId,
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
      ...(fetchAll ? {} : { take: 6 }), // デフォルトは最新6ヶ月、all=trueで全件
    });

    // 総件数を取得
    const totalCount = await prisma.monthlyWage.count({
      where: {
        facilityId: user.facilityId,
      },
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
      totalCount,
      hasMore: !fetchAll && totalCount > 6,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
