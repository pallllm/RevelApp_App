/**
 * Weather Service - Open-Meteo API Integration
 * 天気データ取得サービス（Open-Meteo API使用）
 */

export type WeatherData = {
  date: string;
  temperature: number; // 平均気温（℃）
  weatherCode: number; // WMO Weather code
  pressure: number; // 海面気圧（hPa）
};

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'snow';

/**
 * WMO Weather Codeを天気状態に変換
 * https://open-meteo.com/en/docs
 */
function weatherCodeToCondition(code: number): WeatherCondition {
  if (code === 0 || code === 1) return 'sunny'; // Clear sky, Mainly clear
  if (code === 2 || code === 3) return 'cloudy'; // Partly cloudy, Overcast
  if (code >= 51 && code <= 67) return 'rainy'; // Drizzle and Rain
  if (code >= 71 && code <= 77) return 'snow'; // Snow
  if (code >= 80 && code <= 82) return 'rainy'; // Rain showers
  if (code >= 85 && code <= 86) return 'snow'; // Snow showers
  if (code >= 95 && code <= 99) return 'rainy'; // Thunderstorm
  return 'cloudy'; // Default
}

/**
 * 気圧の大きな変化を検出（前日との差分が15hPa以上）
 */
function detectPressureChange(currentPressure: number, previousPressure: number | null): boolean {
  if (previousPressure === null) return false;
  return Math.abs(currentPressure - previousPressure) >= 15;
}

/**
 * Open-Meteo Historical APIから過去の天気データを取得
 * @param latitude 緯度
 * @param longitude 経度
 * @param startDate 開始日 (YYYY-MM-DD)
 * @param endDate 終了日 (YYYY-MM-DD)
 */
export async function fetchHistoricalWeather(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<WeatherData[]> {
  const url = new URL('https://archive-api.open-meteo.com/v1/archive');
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);
  url.searchParams.set('daily', 'temperature_2m_mean,weather_code,pressure_msl_mean');
  url.searchParams.set('timezone', 'Asia/Tokyo');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();

  const weatherData: WeatherData[] = [];
  for (let i = 0; i < data.daily.time.length; i++) {
    weatherData.push({
      date: data.daily.time[i],
      temperature: data.daily.temperature_2m_mean[i],
      weatherCode: data.daily.weather_code[i],
      pressure: data.daily.pressure_msl_mean[i],
    });
  }

  return weatherData;
}

/**
 * Open-Meteo Forecast APIから現在〜直近の天気データを取得
 * @param latitude 緯度
 * @param longitude 経度
 * @param startDate 開始日 (YYYY-MM-DD)
 * @param endDate 終了日 (YYYY-MM-DD)
 */
export async function fetchForecastWeather(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<WeatherData[]> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('start_date', startDate);
  url.searchParams.set('end_date', endDate);
  url.searchParams.set('daily', 'temperature_2m_mean,weather_code,pressure_msl_mean');
  url.searchParams.set('timezone', 'Asia/Tokyo');
  url.searchParams.set('past_days', '7'); // 過去7日間も取得

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();

  const weatherData: WeatherData[] = [];
  for (let i = 0; i < data.daily.time.length; i++) {
    weatherData.push({
      date: data.daily.time[i],
      temperature: data.daily.temperature_2m_mean[i],
      weatherCode: data.daily.weather_code[i],
      pressure: data.daily.pressure_msl_mean[i],
    });
  }

  return weatherData;
}

/**
 * 日付に応じて適切なAPIを選択して天気データを取得
 * @param latitude 緯度
 * @param longitude 経度
 * @param startDate 開始日 (YYYY-MM-DD)
 * @param endDate 終了日 (YYYY-MM-DD)
 */
export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<{
  date: string;
  temperature: number;
  weather: WeatherCondition;
  pressure: number;
  hasPressureChange: boolean;
}[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const daysDiff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  let rawData: WeatherData[];

  // 2日以上前 → Historical API、それ以外 → Forecast API
  if (daysDiff >= 2) {
    rawData = await fetchHistoricalWeather(latitude, longitude, startDate, endDate);
  } else {
    rawData = await fetchForecastWeather(latitude, longitude, startDate, endDate);
  }

  // 気圧変化を検出し、データを整形
  const result = rawData.map((data, index) => {
    const previousPressure = index > 0 ? rawData[index - 1].pressure : null;
    return {
      date: data.date,
      temperature: Math.round(data.temperature * 10) / 10, // 小数点1桁
      weather: weatherCodeToCondition(data.weatherCode),
      pressure: Math.round(data.pressure),
      hasPressureChange: detectPressureChange(data.pressure, previousPressure),
    };
  });

  return result;
}
