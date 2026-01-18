export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchWeatherData } from '@/lib/services/weather';

/**
 * POST /api/seed/health-data
 * 開発環境用: 体調記録とゲームプレイデータをシード
 */
export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    // テストユーザーを取得
    const testUser = await prisma.user.findUnique({
      where: { id: 'test-user-member-001' },
      include: {
        facility: {
          include: {
            facilityGames: {
              include: {
                game: true,
              },
            },
          },
        },
      },
    });

    if (!testUser) {
      return NextResponse.json(
        { error: 'Test user not found. Please run facility seed first.' },
        { status: 404 }
      );
    }

    const games = testUser.facility.facilityGames.map(fg => fg.game);

    if (games.length === 0) {
      return NextResponse.json(
        { error: 'No games found. Please run games seed first.' },
        { status: 404 }
      );
    }

    // 天気データを取得（施設の緯度経度が設定されている場合）
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30);

    let weatherDataMap: Map<string, { temperature: number; weather: string; pressure: number; hasPressureChange: boolean }> = new Map();

    if (testUser.facility.latitude && testUser.facility.longitude) {
      try {
        const weatherData = await fetchWeatherData(
          testUser.facility.latitude,
          testUser.facility.longitude,
          startDate.toISOString().split('T')[0],
          now.toISOString().split('T')[0]
        );

        // 日付をキーにしたマップを作成
        weatherData.forEach(data => {
          weatherDataMap.set(data.date, {
            temperature: data.temperature,
            weather: data.weather,
            pressure: data.pressure,
            hasPressureChange: data.hasPressureChange,
          });
        });
      } catch (error) {
        console.warn('Failed to fetch weather data, using random data:', error);
      }
    }

    // 過去30日分の体調記録を作成
    const healthRecords = [];
    const gamePlayRecords = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // 70%の確率で記録を作成
      if (Math.random() > 0.3) {
        const fatigueLevel = Math.floor(Math.random() * 40) + 30; // 30-70
        const sleepHours = parseFloat((Math.random() * 3 + 5).toFixed(1)); // 5.0-8.0

        // 日付をキーにして実際の天気データを取得
        const dateKey = date.toISOString().split('T')[0];
        const realWeatherData = weatherDataMap.get(dateKey);

        // 実際の天気データがあれば使用、なければランダム生成
        const temperature = realWeatherData?.temperature ?? parseFloat((Math.random() * 10 + 15).toFixed(1));
        const weather = realWeatherData?.weather ?? (['sunny', 'cloudy', 'rainy', 'snow'][Math.floor(Math.random() * 4)]);
        const hasPressureChange = realWeatherData?.hasPressureChange ?? (Math.random() > 0.8);

        const achievements = [
          'ゲームを3回クリアできた',
          '新しいゲームに挑戦した',
          '早起きできた',
          '集中して作業できた',
          '友達とコミュニケーションできた',
        ];
        const challenges = [
          '集中力が続かなかった',
          'ルールの理解に時間がかかった',
          '特になし',
          '少し疲れた',
          '眠かった',
        ];
        const notes = [
          '朝から元気でした',
          '楽しかった',
          '調子良かったです',
          'また頑張ります',
          '気分が良かった',
        ];

        healthRecords.push({
          userId: testUser.id,
          recordDate: date,
          fatigueLevel,
          sleepHours,
          mood: '良い',
          weather,
          temperature,
          hasPressureChange,
          achievedTasks: Math.random() > 0.3 ? achievements[Math.floor(Math.random() * achievements.length)] : null,
          difficultTasks: Math.random() > 0.5 ? challenges[Math.floor(Math.random() * challenges.length)] : null,
          freeNotes: Math.random() > 0.5 ? notes[Math.floor(Math.random() * notes.length)] : null,
        });

        // ゲーム数に応じてプレイ回数を調整（バランス改善）
        // ゲームが少ない場合は各ゲームを均等にプレイ、多い場合はランダム
        const basePlayCount = Math.min(games.length, 3); // 基本1-3回
        const playCount = Math.floor(Math.random() * basePlayCount) + 1;

        // ゲームを重複なく選択（可能な限り）
        const selectedGames = new Set<string>();
        for (let j = 0; j < playCount; j++) {
          let randomGame;
          let attempts = 0;

          // 重複を避けつつランダム選択（最大10回試行）
          do {
            randomGame = games[Math.floor(Math.random() * games.length)];
            attempts++;
          } while (selectedGames.has(randomGame.id) && attempts < 10 && selectedGames.size < games.length);

          selectedGames.add(randomGame.id);

          const playTime = new Date(date);
          playTime.setHours(9 + Math.floor(Math.random() * 8)); // 9:00-17:00
          playTime.setMinutes(Math.floor(Math.random() * 60));

          gamePlayRecords.push({
            userId: testUser.id,
            gameId: randomGame.id,
            playedAt: playTime,
            sessionDuration: Math.floor(Math.random() * 90) + 30, // 30-120分
          });
        }
      }
    }

    // 既存のデータを削除
    await prisma.healthRecord.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.gamePlayRecord.deleteMany({
      where: { userId: testUser.id },
    });

    // 新しいデータを挿入
    await prisma.healthRecord.createMany({
      data: healthRecords,
    });
    await prisma.gamePlayRecord.createMany({
      data: gamePlayRecords,
    });

    return NextResponse.json({
      message: 'Health data seeded successfully',
      healthRecordsCount: healthRecords.length,
      gamePlayRecordsCount: gamePlayRecords.length,
      weatherDataUsed: weatherDataMap.size > 0,
      weatherDataCount: weatherDataMap.size,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/seed/health-data
 * 開発環境用: 体調記録とゲームプレイデータを削除
 */
export async function DELETE() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const testUser = await prisma.user.findUnique({
      where: { id: 'test-user-member-001' },
    });

    if (!testUser) {
      return NextResponse.json(
        { error: 'Test user not found' },
        { status: 404 }
      );
    }

    await prisma.healthRecord.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.gamePlayRecord.deleteMany({
      where: { userId: testUser.id },
    });

    return NextResponse.json({
      message: 'Health data deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
