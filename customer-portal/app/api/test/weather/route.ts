import { NextResponse } from 'next/server';
import { fetchWeatherData } from '@/lib/services/weather';

/**
 * GET /api/test/weather
 * 天気API接続テスト用エンドポイント
 */
export async function GET() {
  try {
    // 東京の座標でテスト（東京タワー付近）
    const latitude = 35.6586;
    const longitude = 139.7454;

    // 過去7日間のデータを取得
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    console.log('Fetching weather data...');
    console.log('Coordinates:', { latitude, longitude });
    console.log('Date range:', {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    });

    const weatherData = await fetchWeatherData(
      latitude,
      longitude,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    return NextResponse.json({
      success: true,
      message: '天気API接続成功！',
      testLocation: '東京（東京タワー付近）',
      coordinates: { latitude, longitude },
      dataCount: weatherData.length,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      sampleData: weatherData.slice(0, 3), // 最初の3日分のサンプル
      allData: weatherData, // 全データ
    });
  } catch (error) {
    console.error('Weather API test failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: '天気API接続失敗',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
