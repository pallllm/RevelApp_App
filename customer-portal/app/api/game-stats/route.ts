import { NextRequest } from 'next/server';
import { verifyWordPressToken, extractTokenFromHeader } from '@/lib/auth/wordpress';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { readGamePlayRecords, getAvailableMonths } from '@/lib/google/spreadsheet-reader';

/**
 * GET /api/game-stats?userId=xxx&year=2024&month=12
 * 指定ユーザーの指定月のゲームプレイ統計を取得（スプレッドシートから読み込み）
 */
export async function GET(request: NextRequest) {
  try {
    // WordPress JWT認証
    const authHeader = extractTokenFromHeader(request.headers);
    const user = await verifyWordPressToken(authHeader);

    // URLパラメータから取得
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = parseInt(searchParams.get('year') || '0');
    const month = parseInt(searchParams.get('month') || '0');

    if (!userId || !year || !month) {
      return errorResponse(
        new Error('userId, year, and month parameters are required'),
        400
      );
    }

    // ユーザーが同じ事業所に所属しているか確認 & スプレッドシートURL取得
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        facilityId: true,
        spreadsheetUrl: true,
      },
    });

    if (!targetUser || targetUser.facilityId !== user.facilityId) {
      return errorResponse(new Error('Unauthorized'), 403);
    }

    // スプレッドシートURLがない場合はエラー
    if (!targetUser.spreadsheetUrl) {
      return errorResponse(
        new Error('User does not have a spreadsheet URL configured'),
        400
      );
    }

    // スプレッドシートからゲームプレイ記録を読み込み
    const gameRecords = await readGamePlayRecords(
      targetUser.spreadsheetUrl,
      year,
      month
    );

    // ゲーム別プレイ回数を集計
    const gameCountMap = new Map<string, number>();
    for (const record of gameRecords) {
      const count = gameCountMap.get(record.gameName) || 0;
      gameCountMap.set(record.gameName, count + 1);
    }

    // 統計データを整形
    const stats = Array.from(gameCountMap.entries())
      .map(([gameName, playCount]) => ({
        gameId: gameName, // ゲーム名をIDとして使用
        gameName,
        gameLevel: 0, // スプレッドシートにはレベル情報なし
        gameImageUrl: null,
        playCount,
      }))
      .sort((a, b) => b.playCount - a.playCount);

    // 月間合計プレイ回数
    const totalPlayCount = gameRecords.length;

    // 累計プレイ回数を計算（利用可能な全月のデータを集計）
    let totalAllTimePlayCount = 0;
    const cumulativeGameCountMap = new Map<string, number>();

    try {
      const availableMonths = await getAvailableMonths(
        targetUser.spreadsheetUrl,
        'game'
      );

      for (const { year: y, month: m } of availableMonths) {
        // 選択した年月以前のみ集計
        if (y < year || (y === year && m <= month)) {
          let records;
          if (y === year && m === month) {
            records = gameRecords;
          } else {
            records = await readGamePlayRecords(
              targetUser.spreadsheetUrl,
              y,
              m
            );
          }

          totalAllTimePlayCount += records.length;

          // ゲームごとの累計を集計
          for (const record of records) {
            const count = cumulativeGameCountMap.get(record.gameName) || 0;
            cumulativeGameCountMap.set(record.gameName, count + 1);
          }
        }
      }
    } catch (e) {
      // 累計計算に失敗した場合は今月のみ
      totalAllTimePlayCount = totalPlayCount;
      // 今月のデータをコピー
      gameCountMap.forEach((count, gameName) => {
        cumulativeGameCountMap.set(gameName, count);
      });
    }

    // 累計統計データを整形
    const cumulativeStats = Array.from(cumulativeGameCountMap.entries())
      .map(([gameName, playCount]) => ({
        gameId: gameName,
        gameName,
        gameLevel: 0,
        gameImageUrl: null,
        playCount,
      }))
      .sort((a, b) => b.playCount - a.playCount);

    // 前月のプレイ回数
    let previousMonthPlayCount = 0;
    try {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevRecords = await readGamePlayRecords(
        targetUser.spreadsheetUrl,
        prevYear,
        prevMonth
      );
      previousMonthPlayCount = prevRecords.length;
    } catch (e) {
      // 前月データがない場合は0
    }

    return successResponse({
      gameStats: stats,
      cumulativeGameStats: cumulativeStats,
      totalPlayCount,
      totalAllTimePlayCount,
      previousMonthPlayCount,
      playCountDifference: totalPlayCount - previousMonthPlayCount,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
