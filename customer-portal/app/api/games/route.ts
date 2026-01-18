export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/games
 * 施設が利用しているゲーム一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    // JWT認証チェック
    const [payload, authError] = requireAuth(request);
    if (authError) {
      return authError;
    }

    const { facilityId } = payload;

    // 施設が利用しているゲームを取得
    const facilityGames = await prisma.facilityGame.findMany({
      where: {
        facilityId: facilityId!,
      },
      include: {
        game: true,
      },
      orderBy: {
        game: {
          level: 'asc',
        },
      },
    });

    // ゲーム情報を整形
    const games = facilityGames.map((fg) => ({
      id: fg.game.id,
      name: fg.game.name,
      level: fg.game.level,
      requiresAnydesk: fg.game.requiresAnydesk,
      imageUrl: fg.game.imageUrl,
      manualUrl: fg.game.manualUrl,
      videoUrl: fg.game.videoUrl,
      description: fg.game.description,
      isBackup: fg.isBackup,
    }));

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Failed to fetch games:', error);
    return NextResponse.json(
      { error: 'ゲーム一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
