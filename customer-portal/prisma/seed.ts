import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 工賃フェーズマスタを作成
  console.log('Creating wage phases...');

  const wagePhases = [
    {
      id: 'wage-phase-short',
      phaseName: '0〜3ヶ月',
      minMonths: 0,
      maxMonths: 3,
      level1Wage: 50,
      level2Wage: 60,
      level3Wage: 70,
      level4Wage: 80,
      colorFrom: '#4ade80',
      colorTo: '#22c55e',
      textColor: '#ffffff',
    },
    {
      id: 'wage-phase-mid',
      phaseName: '4〜9ヶ月',
      minMonths: 4,
      maxMonths: 9,
      level1Wage: 60,
      level2Wage: 70,
      level3Wage: 80,
      level4Wage: 90,
      colorFrom: '#60a5fa',
      colorTo: '#3b82f6',
      textColor: '#ffffff',
    },
    {
      id: 'wage-phase-long',
      phaseName: '9ヶ月以上',
      minMonths: 9,
      maxMonths: null,
      level1Wage: 70,
      level2Wage: 80,
      level3Wage: 90,
      level4Wage: 100,
      colorFrom: '#c084fc',
      colorTo: '#a855f7',
      textColor: '#ffffff',
    },
  ];

  for (const phase of wagePhases) {
    await prisma.wagePhase.upsert({
      where: { id: phase.id },
      update: {
        phaseName: phase.phaseName,
        minMonths: phase.minMonths,
        maxMonths: phase.maxMonths,
        level1Wage: phase.level1Wage,
        level2Wage: phase.level2Wage,
        level3Wage: phase.level3Wage,
        level4Wage: phase.level4Wage,
        colorFrom: phase.colorFrom,
        colorTo: phase.colorTo,
        textColor: phase.textColor,
      },
      create: phase,
    });
  }

  console.log('Created/Updated wage phases');

  // テスト施設を作成または更新
  const facility = await prisma.facility.upsert({
    where: { id: 'test-facility-001' },
    update: {
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1Ml86pfgkS8RxJyv9WJiP4TBwDq9mCasK0zQp2VZ3_FM/edit',
    },
    create: {
      id: 'test-facility-001',
      name: 'テスト事業所',
      planType: 'FOCUS',
      address: '東京都渋谷区',
      phone: '03-1234-5678',
      email: 'test@example.com',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1Ml86pfgkS8RxJyv9WJiP4TBwDq9mCasK0zQp2VZ3_FM/edit',
    },
  });

  console.log('Created/Updated facility:', facility.id);

  // テストスタッフユーザーを作成または更新
  const staffUser = await prisma.user.upsert({
    where: { id: 'test-user-staff-001' },
    update: {},
    create: {
      id: 'test-user-staff-001',
      facilityId: facility.id,
      wordpressUserId: 1,
      role: 'STAFF',
      email: 'staff@test.example.com',
      name: 'テストスタッフ',
      initials: 'TS',
      status: 'ACTIVE',
    },
  });

  console.log('Created/Updated staff user:', staffUser.id);

  // テスト利用者を作成または更新（スプレッドシートURL付き）
  const memberUser = await prisma.user.upsert({
    where: { id: 'test-user-member-001' },
    update: {
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1Xmhr-dVLH1hKKn3eRYN2uouY5Z2N3KohFjMHylw_BKM/edit',
      spreadsheetType: 'focus_normal',
    },
    create: {
      id: 'test-user-member-001',
      facilityId: facility.id,
      wordpressUserId: 2,
      role: 'MEMBER',
      email: 'member@test.example.com',
      name: 'テスト利用者',
      initials: 'TM',
      status: 'ACTIVE',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/1Xmhr-dVLH1hKKn3eRYN2uouY5Z2N3KohFjMHylw_BKM/edit',
      spreadsheetType: 'focus_normal',
    },
  });

  console.log('Created/Updated member user:', memberUser.id);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
