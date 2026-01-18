export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/games/[gameId]
 * ゲーム詳細とプレイ記録を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    // JWT認証チェック
    const [payload, authError] = requireAuth(request);
    if (authError) {
      return authError;
    }

    const { facilityId } = payload;
    const { gameId } = params;

    // ゲーム情報を取得
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'ゲームが見つかりません' },
        { status: 404 }
      );
    }

    // このゲームを担当している利用者を取得
    const memberGames = await prisma.memberGame.findMany({
      where: {
        gameId,
        user: {
          facilityId: facilityId!,
          role: 'MEMBER',
          status: 'ACTIVE',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            initials: true,
          },
        },
      },
    });

    // プレイ記録を取得（最新100件）
    const playRecords = await prisma.gamePlayRecord.findMany({
      where: {
        gameId,
        user: {
          facilityId: facilityId!,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            initials: true,
          },
        },
      },
      orderBy: {
        playedAt: 'desc',
      },
      take: 100,
    });

    // 統計情報を計算
    const totalPlayCount = playRecords.length;
    const totalPlayTime = playRecords.reduce(
      (sum, record) => sum + (record.sessionDuration || 0),
      0
    );

    // 利用者ごとのプレイ統計
    const memberStats = memberGames.map((mg) => {
      const memberRecords = playRecords.filter(
        (pr) => pr.userId === mg.user.id
      );
      const memberPlayCount = memberRecords.length;
      const memberPlayTime = memberRecords.reduce(
        (sum, record) => sum + (record.sessionDuration || 0),
        0
      );

      return {
        userId: mg.user.id,
        userName: mg.user.name,
        userInitials: mg.user.initials,
        playCount: memberPlayCount,
        totalPlayTime: memberPlayTime,
        averagePlayTime:
          memberPlayCount > 0
            ? Math.round(memberPlayTime / memberPlayCount)
            : 0,
      };
    });

    return NextResponse.json({
      game: {
        id: game.id,
        name: game.name,
        level: game.level,
        requiresAnydesk: game.requiresAnydesk,
        imageUrl: game.imageUrl,
        manualUrl: game.manualUrl,
        videoUrl: game.videoUrl,
        description: game.description,
      },
      statistics: {
        totalPlayCount,
        totalPlayTime,
        averagePlayTime:
          totalPlayCount > 0
            ? Math.round(totalPlayTime / totalPlayCount)
            : 0,
        memberCount: memberGames.length,
      },
      members: memberStats,
      recentPlays: playRecords.slice(0, 20).map((pr) => ({
        id: pr.id,
        playedAt: pr.playedAt.toISOString(),
        sessionDuration: pr.sessionDuration,
        notes: pr.notes,
        user: pr.user,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch game details:', error);
    return NextResponse.json(
      { error: 'ゲーム詳細の取得に失敗しました' },
      { status: 500 }
    );
  }
}
