import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

/**
 * GET /api/notifications
 * 通知一覧を取得（変更申請の状態通知 + システムアラート）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get('facilityId');

    if (!facilityId) {
      return errorResponse('facilityId is required', 400);
    }

    const notifications = [];

    // 1. 変更申請の状態通知を取得
    const recentChangeRequests = await prisma.changeRequest.findMany({
      where: {
        facilityId,
        createdAt: {
          // 過去30日以内
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        requester: {
          select: {
            name: true,
          },
        },
      },
    });

    // 変更申請を通知形式に変換
    for (const request of recentChangeRequests) {
      let message = '';
      let type: 'info' | 'success' | 'warning' | 'error' = 'info';

      switch (request.status) {
        case 'PENDING':
          message = `${request.requester.name}さんの変更申請が提出されました`;
          type = 'info';
          break;
        case 'APPROVED':
          message = `${request.requester.name}さんの変更申請が承認されました`;
          type = 'success';
          break;
        case 'REJECTED':
          message = `${request.requester.name}さんの変更申請が却下されました`;
          type = 'warning';
          break;
      }

      notifications.push({
        id: `change-request-${request.id}`,
        type,
        title: '変更申請の状態更新',
        message,
        timestamp: request.createdAt.toISOString(),
        read: false,
        link: '/app/members',
      });
    }

    // 2. システムアラートを追加（ダミーデータ - 後で実際のシステムアラートロジックに置き換え）
    const today = new Date();
    const currentDay = today.getDate();

    // 変更申請締切が近い場合のアラート
    if (currentDay >= 10 && currentDay <= 15) {
      notifications.push({
        id: 'system-alert-deadline',
        type: 'warning' as const,
        title: '変更申請締切のお知らせ',
        message: `変更申請の締切は15日です。まだ提出されていない方はお早めにお願いします。`,
        timestamp: new Date(today.getFullYear(), today.getMonth(), 10).toISOString(),
        read: false,
        link: '/app/members',
      });
    }

    // 請求確定日が近い場合のアラート
    if (currentDay >= 23 && currentDay <= 25) {
      notifications.push({
        id: 'system-alert-billing',
        type: 'info' as const,
        title: '請求確定日のお知らせ',
        message: `25日に請求が確定します。工賃管理データをご確認ください。`,
        timestamp: new Date(today.getFullYear(), today.getMonth(), 23).toISOString(),
        read: false,
        link: '/app/rewards',
      });
    }

    // 月末メンテナンスのアラート
    if (currentDay >= 28) {
      notifications.push({
        id: 'system-alert-maintenance',
        type: 'warning' as const,
        title: '月末メンテナンスのお知らせ',
        message: `月末にシステムメンテナンスを実施します。詳細は後日お知らせします。`,
        timestamp: new Date(today.getFullYear(), today.getMonth(), 28).toISOString(),
        read: false,
        link: '/app',
      });
    }

    // タイムスタンプでソート（新しい順）
    notifications.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return successResponse({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to fetch notifications',
      500
    );
  }
}
