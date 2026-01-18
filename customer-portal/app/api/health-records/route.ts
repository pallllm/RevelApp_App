export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth/verify';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { readHealthRecords, readDailyReflections, readGamePlayRecords } from '@/lib/google/spreadsheet-reader';
import { fetchWeatherData } from '@/lib/services/weather';

/**
 * GET /api/health-records?userId=xxx&year=2024&month=12
 * 指定ユーザーの指定月の体調記録を取得（スプレッドシートから読み込み）
 */
export async function GET(request: NextRequest) {
  try {
    // JWT認証
    const user = await verifyAuth(request);

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
        facility: {
          select: {
            latitude: true,
            longitude: true,
          },
        },
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

    // 月の開始日と終了日を計算
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0);
    const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    // スプレッドシートと天気データを並列取得
    const [healthRecords, dailyReflections, gamePlayRecords, weatherData] = await Promise.all([
      readHealthRecords(targetUser.spreadsheetUrl, year, month),
      readDailyReflections(targetUser.spreadsheetUrl, year, month),
      readGamePlayRecords(targetUser.spreadsheetUrl, year, month),
      // 施設の緯度経度がある場合のみ天気を取得
      targetUser.facility?.latitude && targetUser.facility?.longitude
        ? fetchWeatherData(
            targetUser.facility.latitude,
            targetUser.facility.longitude,
            startDate,
            endDateStr
          ).catch(() => []) // エラー時は空配列
        : Promise.resolve([]),
    ]);

    // 日次振り返りを日付でマップ化
    const reflectionMap = new Map(
      dailyReflections.map(r => [r.date.toISOString().split('T')[0], r])
    );

    // 天気データを日付でマップ化
    const weatherMap = new Map(
      weatherData.map(w => [w.date, w])
    );

    // ゲームプレイを日付でグループ化（除外対象を除く）
    const excludedGames = ['出来た事/達成した事', '難しかった事', '本日の通所', '出来たこと', '達成したこと', '難しかったこと', 'できたこと'];
    const gamesByDate = new Map<string, string[]>();
    for (const record of gamePlayRecords) {
      const dateStr = record.date.toISOString().split('T')[0];
      if (!excludedGames.some(name => record.gameName.includes(name) || name.includes(record.gameName))) {
        const games = gamesByDate.get(dateStr) || [];
        if (!games.includes(record.gameName)) {
          games.push(record.gameName);
        }
        gamesByDate.set(dateStr, games);
      }
    }

    // ゲーム振り返りデータを作成
    const gameReflections = dailyReflections
      .filter(r => r.achievedTasks || r.difficultTasks)
      .map(r => {
        const dateStr = r.date.toISOString().split('T')[0];
        return {
          date: dateStr,
          gamesPlayed: gamesByDate.get(dateStr) || [],
          achievedTasks: r.achievedTasks,
          difficultTasks: r.difficultTasks,
        };
      });

    return successResponse({
      records: healthRecords.map(record => {
        const dateStr = record.date.toISOString().split('T')[0];
        const weather = weatherMap.get(dateStr);
        return {
          date: dateStr,
          fatigueLevel: record.fatigueLevel,
          sleepHours: record.totalSleepHours || record.sleepHours,
          mood: record.mood,
          emotions: record.emotions,
          emotionContext: record.emotionContext,
          workReport: record.workReport,
          // 天気データ
          weather: weather?.weather || null,
          temperature: weather?.temperature || null,
          hasPressureChange: weather?.hasPressureChange || false,
        };
      }),
      gameReflections,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
