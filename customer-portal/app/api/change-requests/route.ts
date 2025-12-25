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

    // 開発環境では固定のユーザーを取得し、そこからfacilityIdを取得
    // 本番環境ではJWTトークンから取得
    const DEV_USER_ID = 'test-user-staff-001';

    // 開発用のユーザーを取得
    const firstUser = await prisma.user.findUnique({
      where: {
        id: DEV_USER_ID,
      },
    });

    if (!firstUser) {
      return NextResponse.json(
        { error: 'Development user not found' },
        { status: 400 }
      );
    }

    const facilityId = firstUser.facilityId;

    // 変更申請を作成
    const changeRequest = await prisma.changeRequest.create({
      data: {
        facilityId: facilityId,
        requesterId: firstUser.id,
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
    // 開発環境では固定のユーザーを取得し、そこからfacilityIdを取得
    // 本番環境ではJWTトークンから取得
    const DEV_USER_ID = 'test-user-staff-001';

    const user = await prisma.user.findUnique({
      where: { id: DEV_USER_ID },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Development user not found' },
        { status: 400 }
      );
    }

    const facilityId = user.facilityId;

    // 変更申請一覧を取得（新しい順）
    const changeRequests = await prisma.changeRequest.findMany({
      where: {
        facilityId: facilityId,
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
