export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const games = [
  {
    id: 'playbox-lv1',
    name: 'PLAYBOX',
    level: 1,
    requiresAnydesk: false,
    manualUrl: 'https://docs.google.com/presentation/d/1OyvJoVzulv0R9EDYbauTObPvrEUPlNOHjQXzBcFXIlA/edit?usp=drive_link',
    description: 'レベル1のゲーム',
    imageUrl: null,
  },
  {
    id: 'elf-forest-lv1',
    name: 'エルフの森',
    level: 1,
    requiresAnydesk: false,
    manualUrl: 'https://docs.google.com/presentation/d/1MaI1Z1luoqKXVEZc3-SEutgkh5lZHZLtg84pq-JouJA/edit?usp=drive_link',
    description: 'レベル1のゲーム',
    imageUrl: null,
  },
  {
    id: 'mycryptoheroes-lv2',
    name: 'マイクリプトヒーローズ',
    level: 2,
    requiresAnydesk: false,
    manualUrl: 'https://docs.google.com/presentation/d/1jduut-if-AL4Dri9tX-QdzKwzA_u4HxQrluKXjyXXhE/edit?usp=drive_link',
    description: 'レベル2のゲーム',
    imageUrl: null,
  },
  {
    id: 'axie-triforce-lv2',
    name: 'Axieトライフォース',
    level: 2,
    requiresAnydesk: false,
    manualUrl: 'https://docs.google.com/presentation/d/1FYtvR9MHglikCwyep8N8tmHl8efZlnKYK-6KZWH1yKQ/edit?usp=drive_link',
    description: 'レベル2のゲーム',
    imageUrl: null,
  },
  {
    id: 'axie-quest-lv3',
    name: 'Axieクエスト',
    level: 3,
    requiresAnydesk: false,
    manualUrl: 'https://docs.google.com/presentation/d/1H0gPSbgvQrZ6yxeyJRZSb88YM_5bvROKZDoAisFfuOs/edit?usp=drive_link',
    description: 'レベル3のゲーム',
    imageUrl: null,
  },
  {
    id: 'bounty-kinds-lv3',
    name: 'バウンティカインズ',
    level: 3,
    requiresAnydesk: false,
    manualUrl: 'https://docs.google.com/presentation/d/1OUNuFbKu_xObLgQS7bqPk4kt9KamaWyrlM5ElW-bXCs/edit?usp=drive_link',
    description: 'レベル3のゲーム',
    imageUrl: null,
  },
  {
    id: 'career-otome-survivor-lv3',
    name: 'キャリア乙女サバイバー',
    level: 3,
    requiresAnydesk: false,
    manualUrl: 'https://docs.google.com/presentation/d/1NifI_kzpdmkG3SKlG-DSHYCIINQ5ZrRYtiCQ_iFiB80/edit?usp=drive_link',
    description: 'レベル3のゲーム',
    imageUrl: null,
  },
  {
    id: 'axie-origin-lv4',
    name: 'Axieオリジン',
    level: 4,
    requiresAnydesk: false,
    manualUrl: 'https://docs.google.com/document/d/1W-5X-KjTNX91o9LoBKS-wxKoHb98kLHiSqLJs6FbGFw/edit?usp=drive_link',
    description: 'レベル4のゲーム',
    imageUrl: null,
  },
  {
    id: 'xeno-lv4',
    name: 'XENO(ゼノ)',
    level: 4,
    requiresAnydesk: false,
    manualUrl: 'https://docs.google.com/document/d/1kBG0eW8xsW2ioCWDR9sScJ3KH8c0aQVTN1aqNCnx9yc/edit?usp=drive_link',
    description: 'レベル4のゲーム',
    imageUrl: null,
  },
];

/**
 * POST /api/seed/games
 * ゲームデータをシードする（開発環境のみ）
 */
export async function POST() {
  // 開発環境でのみ実行可能
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const results = [];
    const DEV_USER_ID = 'test-user-staff-001';

    // 開発用ユーザーを取得してfacilityIdを取得
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

    // ゲームデータを挿入
    for (const game of games) {
      const result = await prisma.game.upsert({
        where: { id: game.id },
        update: game,
        create: game,
      });
      results.push(result);
    }

    // FacilityGameのリレーションを作成（全ゲームを事業所に割り当て）
    for (const game of games) {
      await prisma.facilityGame.upsert({
        where: {
          facilityId_gameId: {
            facilityId: facilityId,
            gameId: game.id,
          },
        },
        update: {
          isBackup: game.level >= 3, // レベル3以上はバックアップ扱い
        },
        create: {
          facilityId: facilityId,
          gameId: game.id,
          isBackup: game.level >= 3,
        },
      });
    }

    return NextResponse.json({
      message: `Successfully seeded ${results.length} games and assigned to facility`,
      games: results.map(g => ({ id: g.id, name: g.name, level: g.level })),
    });
  } catch (error) {
    console.error('Failed to seed games:', error);
    return NextResponse.json(
      { error: 'Failed to seed games' },
      { status: 500 }
    );
  }
}
