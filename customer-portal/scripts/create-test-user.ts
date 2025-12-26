/**
 * テストユーザー作成スクリプト
 *
 * 使用方法:
 * npx ts-node scripts/create-test-user.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash('password123', 10);

    // テスト施設を作成（既に存在する場合はスキップ）
    const facility = await prisma.facility.upsert({
      where: { id: 'test-facility-001' },
      update: {},
      create: {
        id: 'test-facility-001',
        name: 'テスト施設A',
        planType: 'FOCUS',
        email: 'test-facility@revelapp.jp',
        phone: '03-1234-5678',
        address: '東京都渋谷区テスト1-2-3',
        latitude: 35.6812,
        longitude: 139.7671,
      },
    });

    console.log('✓ テスト施設を作成しました:', facility.name);

    // テストユーザー（STAFF）を作成
    const user = await prisma.user.upsert({
      where: { email: 'test@revelapp.jp' },
      update: {
        password: hashedPassword,
      },
      create: {
        id: 'test-user-staff-002',
        facilityId: facility.id,
        role: 'STAFF',
        email: 'test@revelapp.jp',
        password: hashedPassword,
        name: 'テスト太郎',
        status: 'ACTIVE',
      },
    });

    console.log('✓ テストユーザーを作成しました:');
    console.log('  メールアドレス:', user.email);
    console.log('  パスワード: password123');
    console.log('  ロール:', user.role);
    console.log('  施設:', facility.name);
    console.log('');
    console.log('このアカウントでログインできます！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
