import { google } from 'googleapis';

/**
 * Google Calendar Service
 * サービスアカウントを使用してGoogleカレンダーのイベントを取得
 */

// 環境変数からサービスアカウント認証情報を取得
const getGoogleAuth = () => {
  try {
    // サービスアカウントキーをJSON形式で環境変数から取得
    const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
      : null;

    if (!credentials) {
      console.warn('GOOGLE_SERVICE_ACCOUNT_JSON is not set. Google Calendar integration is disabled.');
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    return auth;
  } catch (error) {
    console.error('Failed to initialize Google Auth:', error);
    return null;
  }
};

/**
 * Googleカレンダーのイベントを取得
 * @param calendarId - カレンダーID（デフォルト: プライマリカレンダー）
 * @param timeMin - 開始日時（ISO 8601形式）
 * @param timeMax - 終了日時（ISO 8601形式）
 * @returns イベントの配列
 */
export async function fetchGoogleCalendarEvents(
  calendarId: string = 'primary',
  timeMin: string,
  timeMax: string
): Promise<Array<{
  id: string;
  summary: string;
  description?: string;
  start: string; // ISO 8601 date or datetime
  end: string;   // ISO 8601 date or datetime
  isAllDay: boolean;
}>> {
  try {
    const auth = getGoogleAuth();

    if (!auth) {
      console.warn('Google Calendar auth not configured. Returning empty events.');
      return [];
    }

    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100,
    });

    const events = response.data.items || [];

    return events.map((event) => {
      // 終日イベントかどうかを判定
      const isAllDay = !!event.start?.date;

      return {
        id: event.id || '',
        summary: event.summary || '(タイトルなし)',
        description: event.description ?? undefined,
        start: event.start?.dateTime || event.start?.date || '',
        end: event.end?.dateTime || event.end?.date || '',
        isAllDay,
      };
    });
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error);
    // エラーが発生しても空の配列を返す（フォールバック）
    return [];
  }
}

/**
 * 指定した月のGoogleカレンダーイベントを取得
 * @param year - 年
 * @param month - 月（1-12）
 * @param calendarId - カレンダーID
 * @returns イベントの配列
 */
export async function fetchMonthlyCalendarEvents(
  year: number,
  month: number,
  calendarId?: string
) {
  // 月の最初の日
  const startDate = new Date(year, month - 1, 1);
  startDate.setHours(0, 0, 0, 0);

  // 月の最後の日
  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  return fetchGoogleCalendarEvents(
    calendarId || process.env.GOOGLE_CALENDAR_ID || 'primary',
    startDate.toISOString(),
    endDate.toISOString()
  );
}

/**
 * 特定の日付のイベントを取得
 * @param date - 日付（YYYY-MM-DD形式）
 * @param calendarId - カレンダーID
 * @returns その日のイベント配列
 */
export async function fetchDailyCalendarEvents(
  date: string,
  calendarId?: string
) {
  const [year, month, day] = date.split('-').map(Number);

  const startDate = new Date(year, month - 1, day);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(year, month - 1, day);
  endDate.setHours(23, 59, 59, 999);

  return fetchGoogleCalendarEvents(
    calendarId || process.env.GOOGLE_CALENDAR_ID || 'primary',
    startDate.toISOString(),
    endDate.toISOString()
  );
}
