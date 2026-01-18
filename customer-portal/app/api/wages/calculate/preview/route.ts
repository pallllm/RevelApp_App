export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { verifyAuth, isStaffOrAbove } from '@/lib/auth/verify';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { calculateMonthlyWage } from '@/lib/services/wage-calculator';
import { buildFacilityInput } from '@/lib/services/wage-input-builder';

/**
 * GET /api/wages/calculate/preview?year=2026&month=1
 * 月次工賃をプレビュー計算（DB保存なし）
 */
export async function GET(request: NextRequest) {
  try {
    // 認証
    const user = await verifyAuth(request);

    // スタッフ以上の権限チェック
    if (!isStaffOrAbove(user)) {
      return errorResponse(new Error('Permission denied'), 403);
    }

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

    // 施設情報を取得
    const facility = await prisma.facility.findUnique({
      where: { id: user.facilityId },
    });

    if (!facility) {
      return errorResponse(new Error('Facility not found'), 404);
    }

    if (!facility.spreadsheetUrl) {
      return errorResponse(
        new Error('Facility spreadsheet URL is not configured'),
        400
      );
    }

    // プレイ記録を取得して工賃入力を構築
    const facilityInput = await buildFacilityInput(
      facility.id,
      facility.planType,
      facility.spreadsheetUrl,
      year,
      month
    );

    // 工賃計算（保存なし）
    const result = await calculateMonthlyWage(facilityInput);

    return successResponse({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Wage preview error:', error);
    return errorResponse(error);
  }
}
