export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { fetchMonthlyCalendarEvents } from '@/lib/services/google-calendar';
import { verifyAuth } from '@/lib/auth/verify';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/calendar-events?year=2025&month=1
 * 指定月のGoogleカレンダーイベントを取得（施設固有のカレンダーIDを使用）
 */
export async function GET(request: NextRequest) {
  try {
    // 認証
    const user = await verifyAuth(request);

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || '0');
    const month = parseInt(searchParams.get('month') || '0');

    if (!year || !month || month < 1 || month > 12) {
      return errorResponse(
        new Error('Valid year and month parameters are required'),
        400
      );
    }

    // 施設情報を取得してgoogleCalendarIdを使用
    const facility = await prisma.facility.findUnique({
      where: { id: user.facilityId },
      select: { googleCalendarId: true },
    });

    // Googleカレンダーからイベントを取得（施設のカレンダーIDを使用）
    const events = await fetchMonthlyCalendarEvents(year, month, facility?.googleCalendarId || undefined);

    // イベントを日付ごとにグループ化
    const eventsByDate: Record<number, any[]> = {};

    events.forEach((event) => {
      const startDate = new Date(event.start);
      const day = startDate.getDate();

      if (!eventsByDate[day]) {
        eventsByDate[day] = [];
      }

      eventsByDate[day].push({
        id: event.id,
        title: event.summary,
        description: event.description,
        start: event.start,
        end: event.end,
        isAllDay: event.isAllDay,
      });
    });

    return successResponse({
      events: eventsByDate,
      totalEvents: events.length,
    });
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    return errorResponse(
      error instanceof Error ? error : new Error('Failed to fetch calendar events'),
      500
    );
  }
}
