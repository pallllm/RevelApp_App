export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  readMemberListSheet,
  readHealthRecords,
  readEntryPlanGamePlayRecords,
  readEntryPlanGameSelection,
} from '@/lib/google/spreadsheet-reader';

/**
 * GET /api/spreadsheet/test
 * スプレッドシート連携のテストエンドポイント
 *
 * クエリパラメータ:
 * - url: スプレッドシートのURL
 * - type: 'members' | 'health' | 'game' | 'entry'
 * - year: 年（health/game/entryの場合）
 * - month: 月（health/game/entryの場合）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const type = searchParams.get('type') || 'members';
    const year = parseInt(searchParams.get('year') || '2026');
    const month = parseInt(searchParams.get('month') || '1');

    if (!url) {
      return NextResponse.json({
        error: 'url parameter is required',
        usage: {
          members: '/api/spreadsheet/test?type=members&url=<spreadsheet_url>',
          health: '/api/spreadsheet/test?type=health&url=<spreadsheet_url>&year=2026&month=1',
          game: '/api/spreadsheet/test?type=game&url=<spreadsheet_url>&year=2026&month=1',
          entry: '/api/spreadsheet/test?type=entry&url=<spreadsheet_url>&year=2026&month=1',
        },
      }, { status: 400 });
    }

    let result: any;

    switch (type) {
      case 'members':
        result = await readMemberListSheet(url);
        break;

      case 'health':
        result = await readHealthRecords(url, year, month);
        break;

      case 'game':
        // フォーカス/フレキシブル用は個人シートURLが必要
        result = await readEntryPlanGamePlayRecords(url, year, month);
        break;

      case 'entry':
        const gameSelection = await readEntryPlanGameSelection(url);
        const gameRecords = await readEntryPlanGamePlayRecords(url, year, month);
        result = { gameSelection, gameRecords };
        break;

      default:
        return NextResponse.json({
          error: `Unknown type: ${type}`,
          validTypes: ['members', 'health', 'game', 'entry'],
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      url,
      ...(type !== 'members' && { year, month }),
      data: result,
    });

  } catch (error) {
    console.error('Spreadsheet test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hint: error instanceof Error && error.message.includes('GOOGLE_SERVICE_ACCOUNT')
        ? 'Google Service Account JSON is not configured. Please set GOOGLE_SERVICE_ACCOUNT_JSON environment variable.'
        : undefined,
    }, { status: 500 });
  }
}
