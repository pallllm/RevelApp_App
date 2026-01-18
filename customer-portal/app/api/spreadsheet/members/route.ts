export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { readMemberListSheet } from '@/lib/google/spreadsheet-reader';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/spreadsheet/members
 * 利用者一覧シートから利用者情報を取得（フォーカス/フレキシブルプラン用）
 *
 * クエリパラメータ:
 * - facilityId: 施設ID（オプション、指定しない場合はログインユーザーの施設）
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId') || user.facilityId;

    // 施設情報を取得
    const facility = await prisma.facility.findUnique({
      where: { id: facilityId },
    });

    if (!facility) {
      return errorResponse(new Error('Facility not found'), 404);
    }

    // 権限チェック（自分の施設のみアクセス可能）
    if (facility.id !== user.facilityId && user.role !== 'ADMIN') {
      return errorResponse(new Error('Unauthorized'), 403);
    }

    // 利用者一覧シートのURLを取得（施設のspreadsheetUrlに保存されている想定）
    const memberListSheetUrl = facility.spreadsheetUrl;

    if (!memberListSheetUrl) {
      return errorResponse(
        new Error('Member list sheet URL not configured for this facility'),
        400
      );
    }

    // スプレッドシートから利用者一覧を読み取り
    const memberListSheet = await readMemberListSheet(memberListSheetUrl);

    return successResponse({
      planType: memberListSheet.planType,
      members: memberListSheet.members,
      total: memberListSheet.members.length,
      activeCount: memberListSheet.members.filter(m => !m.isWithdrawn).length,
    });
  } catch (error) {
    console.error('Error reading member list sheet:', error);
    return errorResponse(error);
  }
}
