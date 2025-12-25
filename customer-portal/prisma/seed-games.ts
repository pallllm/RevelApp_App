import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

const games = [
  {
    id: 'playbox-lv1',
    name: 'PLAYBOX',
    level: 1,
    requiresAnydesk: false,
    manualUrl: 'https://docs.google.com/presentation/d/1OyvJoVzulv0R9EDYbauTObPvrEUPlNOHjQXzBcFXIlA/edit?usp=drive_link',
    description: 'レベル1のゲーム',
    imageUrl: null, // 後で管理アプリから追加
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

async function main() {
  console.log('🎮 Seeding games...');

  for (const game of games) {
    const result = await prisma.game.upsert({
      where: { id: game.id },
      update: game,
      create: game,
    });
    console.log(`✅ Upserted game: ${result.name} (Level ${result.level})`);
  }

  console.log('✨ Game seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding games:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
