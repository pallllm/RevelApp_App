import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/change-requests
 * 新しい変更申請を作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestType, requestData, notes } = body;

    // バリデーション
    if (!requestType || !requestData) {
      return NextResponse.json(
        { error: 'Request type and data are required' },
        { status: 400 }
      );
    }

    // 開発環境では固定のfacilityIdとrequesterIdを使用
    // 本番環境ではJWTトークンから取得
    const DEV_FACILITY_ID = 'test-facility-1';
    const DEV_REQUESTER_ID = 'test-staff-1'; // STAFFユーザー

    // 変更申請を作成
    const changeRequest = await prisma.changeRequest.create({
      data: {
        facilityId: DEV_FACILITY_ID,
        requesterId: DEV_REQUESTER_ID,
        requestType,
        requestData,
        notes: notes || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      changeRequest: {
        id: changeRequest.id,
        requestType: changeRequest.requestType,
        status: changeRequest.status,
        submittedAt: changeRequest.submittedAt.toISOString(),
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create change request:', error);
    return NextResponse.json(
      { error: 'Failed to create change request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/change-requests
 * 事業所の変更申請一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    // 開発環境では固定のfacilityIdを使用
    const DEV_FACILITY_ID = 'test-facility-1';

    // 変更申請一覧を取得（新しい順）
    const changeRequests = await prisma.changeRequest.findMany({
      where: {
        facilityId: DEV_FACILITY_ID,
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        processor: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    return NextResponse.json({
      changeRequests: changeRequests.map(cr => ({
        id: cr.id,
        requestType: cr.requestType,
        status: cr.status,
        requestData: cr.requestData,
        notes: cr.notes,
        submittedAt: cr.submittedAt.toISOString(),
        processedAt: cr.processedAt?.toISOString() || null,
        requester: cr.requester,
        processor: cr.processor,
      }))
    });

  } catch (error) {
    console.error('Failed to fetch change requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch change requests' },
      { status: 500 }
    );
  }
}
