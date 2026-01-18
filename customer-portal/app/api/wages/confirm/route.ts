import { NextRequest } from 'next/server';
import { verifyAuth, isStaffOrAbove } from '@/lib/auth/verify';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

/**
 * POST /api/wages/confirm
 * 工賃を確定する（ステータスをCONFIRMEDに更新）
 */
export async function POST(request: NextRequest) {
  try {
    // 認証
    const user = await verifyAuth(request);

    // スタッフ以上の権限チェック
    if (!isStaffOrAbove(user)) {
      return errorResponse(new Error('Permission denied'), 403);
    }

    // リクエストボディを取得
    const body = await request.json();
    const { year, month } = body;

    if (!year || !month) {
      return errorResponse(
        new Error('year and month are required'),
        400
      );
    }

    // 対象の工賃レコードを取得
    const monthlyWage = await prisma.monthlyWage.findUnique({
      where: {
        facilityId_year_month: {
          facilityId: user.facilityId,
          year,
          month,
        },
      },
    });

    if (!monthlyWage) {
      return errorResponse(
        new Error('Wage record not found. Please calculate wages first.'),
        404
      );
    }

    // 既に確定済みまたは支払済みの場合はエラー
    if (monthlyWage.status === 'CONFIRMED') {
      return errorResponse(
        new Error('Wage is already confirmed'),
        400
      );
    }

    if (monthlyWage.status === 'PAID') {
      return errorResponse(
        new Error('Wage is already paid'),
        400
      );
    }

    // ステータスをCONFIRMEDに更新
    const updatedWage = await prisma.monthlyWage.update({
      where: {
        id: monthlyWage.id,
      },
      data: {
        status: 'CONFIRMED',
      },
    });

    return successResponse({
      success: true,
      message: 'Wage confirmed successfully',
      wage: {
        id: updatedWage.id,
        year: updatedWage.year,
        month: updatedWage.month,
        totalAmount: updatedWage.totalAmount,
        status: updatedWage.status,
      },
    });
  } catch (error) {
    console.error('Wage confirm error:', error);
    return errorResponse(error);
  }
}
