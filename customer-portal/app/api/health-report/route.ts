import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { verifyAuth } from '@/lib/auth/verify';
import { prisma } from '@/lib/prisma';
import { errorResponse } from '@/lib/utils/response';
import { readHealthRecords, readDailyReflections, readGamePlayRecords } from '@/lib/google/spreadsheet-reader';
import { fetchWeatherData } from '@/lib/services/weather';
import {
  generateHealthReportPdf,
  HealthReportData,
  HealthReportGame,
  HealthReportMoodDistribution,
  HealthReportEmotionDistribution,
  HealthReportDailyData,
  HealthReportDailyRecord,
  HealthReportGameReflection,
} from '@/lib/services/health-report-generator';

// 除外するゲーム名
const EXCLUDED_GAME_NAMES = [
  '出来た事/達成した事',
  '難しかった事',
  '本日の通所',
  'できたこと',
  '達成したこと',
  '難しかったこと',
  '出来たこと',
];

// 画像キャッシュ（メモリ内）
const imageCache = new Map<string, string | null>();

// 画像URLをBase64に変換する関数（キャッシュ対応）
async function fetchImageAsBase64(imageUrl: string): Promise<string | null> {
  // キャッシュチェック
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl)!;
  }

  try {
    let result: string | null = null;

    // 相対パスの場合はpublicフォルダから読み込む（非同期）
    if (imageUrl.startsWith('/')) {
      const publicPath = path.join(process.cwd(), 'public', imageUrl);
      try {
        const buffer = await fs.promises.readFile(publicPath);
        const ext = path.extname(imageUrl).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
        };
        const contentType = mimeTypes[ext] || 'image/png';
        result = `data:${contentType};base64,${buffer.toString('base64')}`;
      } catch {
        result = null;
      }
    } else {
      // 絶対URLの場合はfetch
      const response = await fetch(imageUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/png';
        result = `data:${contentType};base64,${buffer.toString('base64')}`;
      }
    }

    // キャッシュに保存
    imageCache.set(imageUrl, result);
    return result;
  } catch (error) {
    console.error('Failed to fetch image:', imageUrl, error);
    imageCache.set(imageUrl, null);
    return null;
  }
}

/**
 * GET /api/health-report?userId=xxx&year=2025&month=1
 * 体調レポートPDFを生成してダウンロード
 */
export async function GET(request: NextRequest) {
  try {
    // 認証
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

    // ユーザー情報と施設のゲーム一覧を並列で取得
    const [targetUser, facilityGameRelations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          facilityId: true,
          spreadsheetUrl: true,
          facility: {
            select: {
              latitude: true,
              longitude: true,
            },
          },
        },
      }),
      prisma.facilityGame.findMany({
        where: { facilityId: user.facilityId },
        include: {
          game: {
            select: {
              id: true,
              name: true,
              level: true,
              imageUrl: true,
            },
          },
        },
      }),
    ]);

    if (!targetUser || targetUser.facilityId !== user.facilityId) {
      return errorResponse(new Error('Unauthorized'), 403);
    }

    if (!targetUser.spreadsheetUrl) {
      return errorResponse(
        new Error('User does not have a spreadsheet URL configured'),
        400
      );
    }

    const facilityGames = facilityGameRelations.map(fg => fg.game);

    // 月の開始日と終了日を計算（天気データ取得用）
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0);
    const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    // スプレッドシート、ゲームプレイ回数、天気データを並列で取得
    const [healthRecords, dailyReflections, gamePlayRecords, cumulativePlayCounts, weatherData] = await Promise.all([
      readHealthRecords(targetUser.spreadsheetUrl, year, month),
      readDailyReflections(targetUser.spreadsheetUrl, year, month),
      readGamePlayRecords(targetUser.spreadsheetUrl, year, month),
      prisma.gamePlayRecord.groupBy({
        by: ['gameId'],
        where: {
          userId: userId,
        },
        _count: {
          id: true,
        },
      }),
      // 施設の緯度経度がある場合のみ天気を取得
      targetUser.facility?.latitude && targetUser.facility?.longitude
        ? fetchWeatherData(
            targetUser.facility.latitude,
            targetUser.facility.longitude,
            startDate,
            endDateStr
          ).catch(() => [])
        : Promise.resolve([]),
    ]);

    // 天気データを日付でマップ化
    const weatherMap = new Map(
      weatherData.map(w => [w.date, w])
    );

    // ゲームデータを整形（画像をBase64に変換）
    const filteredGames = facilityGames.filter(g => !EXCLUDED_GAME_NAMES.some(name =>
      g.name.includes(name) || name.includes(g.name)
    ));

    const games: HealthReportGame[] = await Promise.all(
      filteredGames.map(async game => {
        const cumulative = cumulativePlayCounts.find(c => c.gameId === game.id);
        const imageBase64 = game.imageUrl ? await fetchImageAsBase64(game.imageUrl) : null;
        return {
          id: game.id,
          name: game.name,
          level: game.level,
          imageUrl: game.imageUrl,
          imageBase64,
          playCount: cumulative?._count.id || 0,
        };
      })
    );

    // 気分の分布を集計
    const moodCounts: Record<string, number> = {};
    for (const record of healthRecords) {
      if (record.mood) {
        moodCounts[record.mood] = (moodCounts[record.mood] || 0) + 1;
      }
    }
    const totalMoodRecords = Object.values(moodCounts).reduce((a, b) => a + b, 0);
    const moodDistribution: HealthReportMoodDistribution[] = Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        count,
        percentage: totalMoodRecords > 0 ? Math.round((count / totalMoodRecords) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 感情の分布を集計
    const emotionCounts: Record<string, number> = {};
    for (const record of healthRecords) {
      if (record.emotions) {
        emotionCounts[record.emotions] = (emotionCounts[record.emotions] || 0) + 1;
      }
    }
    const totalEmotionRecords = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
    const emotionDistribution: HealthReportEmotionDistribution[] = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: totalEmotionRecords > 0 ? Math.round((count / totalEmotionRecords) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 日次記録データを整形
    const dailyRecords: HealthReportDailyRecord[] = healthRecords
      .filter(r => r.emotions || r.emotionContext || r.workReport)
      .map(record => ({
        date: record.date.toISOString().split('T')[0],
        emotion: record.emotions,
        emotionContext: record.emotionContext,
        workReport: record.workReport,
      }));

    // ゲームプレイを日付でグループ化（除外対象を除く）
    const gamesByDate = new Map<string, string[]>();
    for (const record of gamePlayRecords) {
      const dateStr = record.date.toISOString().split('T')[0];
      if (!EXCLUDED_GAME_NAMES.some(name => record.gameName.includes(name) || name.includes(record.gameName))) {
        const games = gamesByDate.get(dateStr) || [];
        if (!games.includes(record.gameName)) {
          games.push(record.gameName);
        }
        gamesByDate.set(dateStr, games);
      }
    }

    // ゲーム振り返りデータを整形
    const gameReflections: HealthReportGameReflection[] = dailyReflections
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

    // 日別データ（疲労度・睡眠・気温・天気チャート用）
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyData: HealthReportDailyData[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = healthRecords.find(r => r.date.toISOString().split('T')[0] === dateStr);
      const weather = weatherMap.get(dateStr);
      dailyData.push({
        day,
        fatigue: record?.fatigueLevel ? Math.round(record.fatigueLevel * 100) : null,
        sleepHours: record?.totalSleepHours || record?.sleepHours || null,
        temperature: weather?.temperature || null,
        weather: weather?.weather || null,
        hasPressureChange: weather?.hasPressureChange || false,
      });
    }

    // レポートデータを構築
    const reportData: HealthReportData = {
      userName: targetUser.name,
      year,
      month,
      games,
      moodDistribution,
      emotionDistribution,
      dailyData,
      dailyRecords,
      gameReflections,
      outputDate: new Date().toLocaleDateString('ja-JP'),
    };

    // PDF生成
    const pdfBuffer = await generateHealthReportPdf(reportData);

    // ファイル名を生成
    const filename = `体調レポート_${targetUser.name}_${year}年${month}月.pdf`;

    // PDFレスポンスを返す
    const uint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Health report generation error:', error);
    return errorResponse(error);
  }
}
