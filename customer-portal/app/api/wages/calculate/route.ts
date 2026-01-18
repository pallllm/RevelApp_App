import { NextRequest } from 'next/server';
import { verifyAuth, isStaffOrAbove } from '@/lib/auth/verify';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';
import {
  calculateMonthlyWage,
  saveWageResult,
} from '@/lib/services/wage-calculator';
import { buildFacilityInput } from '@/lib/services/wage-input-builder';

/**
 * POST /api/wages/calculate
 * 月次工賃を計算してDBに保存
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
    const { year, month, dryRun = false } = body;

    if (!year || !month) {
      return errorResponse(
        new Error('year and month are required'),
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

    // 工賃計算
    const result = await calculateMonthlyWage(facilityInput);

    // dryRunでなければDBに保存
    if (!dryRun) {
      await saveWageResult(result);
    }

    return successResponse({
      success: true,
      result,
      savedToDb: !dryRun,
    });
  } catch (error) {
    console.error('Wage calculation error:', error);
    return errorResponse(error);
  }
}
