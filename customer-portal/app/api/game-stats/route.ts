import { NextRequest } from 'next/server';
import { verifyWordPressToken, extractTokenFromHeader } from '@/lib/auth/wordpress';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';

/**
 * GET /api/game-stats?userId=xxx&year=2024&month=12
 * 指定ユーザーの指定月のゲームプレイ統計を取得
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

    // ユーザーが同じ事業所に所属しているか確認
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser || targetUser.facilityId !== user.facilityId) {
      return errorResponse(new Error('Unauthorized'), 403);
    }

    // 指定月の最初と最後の日付
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // ゲーム別プレイ回数を集計
    const gamePlayStats = await prisma.gamePlayRecord.groupBy({
      by: ['gameId'],
      where: {
        userId,
        playedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // ゲーム情報を取得
    const gameIds = gamePlayStats.map(stat => stat.gameId);
    const games = await prisma.game.findMany({
      where: {
        id: { in: gameIds },
      },
    });

    // 統計データを整形
    const stats = gamePlayStats.map(stat => {
      const game = games.find(g => g.id === stat.gameId);
      return {
        gameId: stat.gameId,
        gameName: game?.name || 'Unknown',
        gameLevel: game?.level || 0,
        gameImageUrl: game?.imageUrl,
        playCount: stat._count.id,
      };
    }).sort((a, b) => b.playCount - a.playCount);

    // 月間合計プレイ回数
    const totalPlayCount = await prisma.gamePlayRecord.count({
      where: {
        userId,
        playedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 累計プレイ回数
    const totalAllTimePlayCount = await prisma.gamePlayRecord.count({
      where: {
        userId,
      },
    });

    // 前月の合計プレイ回数（比較用）
    const previousMonthStart = new Date(year, month - 2, 1);
    const previousMonthEnd = new Date(year, month - 1, 0, 23, 59, 59);
    const previousMonthPlayCount = await prisma.gamePlayRecord.count({
      where: {
        userId,
        playedAt: {
          gte: previousMonthStart,
          lte: previousMonthEnd,
        },
      },
    });

    return successResponse({
      gameStats: stats,
      totalPlayCount,
      totalAllTimePlayCount,
      previousMonthPlayCount,
      playCountDifference: totalPlayCount - previousMonthPlayCount,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
