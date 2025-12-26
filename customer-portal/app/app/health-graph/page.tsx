"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  Gamepad2,
  TrendingUp,
  TrendingDown,
  Moon,
  Activity,
  AlertCircle,
} from "lucide-react";
import { GAMES } from "@/lib/constants";
import { getFacility, getHealthRecords, getGameStats } from "@/lib/api/client";

// 型定義
type DailyHealthData = {
  day: number;
  fatigue: number | null;
  sleepHours: number | null;
  temperature: number | null;
  weather: string | null;
  hasPressureChange: boolean;
};

type GameStat = {
  gameId: string;
  gameName: string;
  gameLevel: number;
  gameImageUrl: string | null;
  playCount: number;
};

type HealthRecord = {
  date: string;
  achievedTasks: string | null;
  difficultTasks: string | null;
  freeNotes: string | null;
};

// 天気アイコンを取得
const getWeatherIcon = (weather: string, small = false) => {
  const size = small ? "h-4 w-4" : "h-5 w-5";
  switch (weather) {
    case "sunny":
      return <Sun className={`${size} text-yellow-500`} />;
    case "cloudy":
      return <Cloud className={`${size} text-gray-400`} />;
    case "rainy":
      return <CloudRain className={`${size} text-blue-500`} />;
    case "snow":
      return <CloudSnow className={`${size} text-blue-300`} />;
    default:
      return <Sun className={`${size} text-yellow-500`} />;
  }
};

// APIから取得したユーザーの型定義
interface User {
  id: string;
  name: string;
  initials: string;
  role: string;
}

export default function HealthGraphPage() {
  // API data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  // Health data state
  const [dailyHealthData, setDailyHealthData] = useState<DailyHealthData[]>([]);
  const [gameStats, setGameStats] = useState<GameStat[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [totalPlayCount, setTotalPlayCount] = useState<number>(0);
  const [playCountDifference, setPlayCountDifference] = useState<number>(0);
  const [averageSleep, setAverageSleep] = useState<number>(0);
  const [sleepDifference, setSleepDifference] = useState<number>(0);

  // Fetch users from API
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);

        const facilityData = await getFacility();

        // 利用者データを設定（MEMBERロールのみ）
        const memberUsers = facilityData.facility.members.filter(
          (m: any) => m.role === 'MEMBER'
        );
        setUsers(memberUsers);

        // 最初のユーザーをデフォルト選択
        if (memberUsers.length > 0 && !selectedUserId) {
          setSelectedUserId(memberUsers[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Fetch health data when user/year/month changes
  useEffect(() => {
    if (!selectedUserId) return;

    async function fetchHealthData() {
      try {
        setLoading(true);
        setError(null);

        // 体調記録を取得
        const healthData = await getHealthRecords(selectedUserId, selectedYear, selectedMonth);

        // ゲーム統計を取得
        const gameData = await getGameStats(selectedUserId, selectedYear, selectedMonth);

        // 日別データを変換
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const dailyData: DailyHealthData[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const record = healthData.records.find(r => r.date === dateStr);

          dailyData.push({
            day,
            fatigue: record?.fatigueLevel || null,
            sleepHours: record?.sleepHours || null,
            temperature: record?.temperature || null,
            weather: record?.weather || null,
            hasPressureChange: record?.hasPressureChange || false,
          });
        }

        setDailyHealthData(dailyData);
        setGameStats(gameData.gameStats);
        setHealthRecords(
          healthData.records
            .filter(r => r.achievedTasks || r.difficultTasks || r.freeNotes)
            .map(r => ({
              date: r.date,
              achievedTasks: r.achievedTasks,
              difficultTasks: r.difficultTasks,
              freeNotes: r.freeNotes,
            }))
        );
        setTotalPlayCount(gameData.totalAllTimePlayCount);
        setPlayCountDifference(gameData.playCountDifference);

        // 平均睡眠時間を計算
        const sleepRecords = dailyData.filter(d => d.sleepHours !== null);
        const avgSleep = sleepRecords.length > 0
          ? sleepRecords.reduce((sum, d) => sum + (d.sleepHours || 0), 0) / sleepRecords.length
          : 0;
        setAverageSleep(avgSleep);

        // TODO: 前月との睡眠時間差分を計算（現在は仮で0）
        setSleepDifference(0);
      } catch (err) {
        console.error('Failed to fetch health data:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchHealthData();
  }, [selectedUserId, selectedYear, selectedMonth]);

  // カレンダー生成
  const generateCalendarDays = () => {
    const year = selectedYear;
    const month = selectedMonth - 1;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === selectedYear && today.getMonth() + 1 === selectedMonth;

  const selectedUser = users.find((u) => u.id === selectedUserId);

  // 記録がある日を抽出
  const recordedDays = dailyHealthData
    .filter(d => d.fatigue !== null || d.sleepHours !== null || d.temperature !== null)
    .map(d => d.day);

  // カスタムドット（気温の折れ線グラフ用 - 天気アイコンと気圧変化アイコンを表示）
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const weatherData = dailyHealthData.find((d) => d.day === payload.day);

    return (
      <g>
        <circle cx={cx} cy={cy} r={3} fill="#3b82f6" />
        {/* 天気アイコン */}
        <foreignObject x={cx - 10} y={cy - 25} width={20} height={20}>
          <div className="flex items-center justify-center">
            {weatherData?.weather && getWeatherIcon(weatherData.weather, true)}
          </div>
        </foreignObject>
        {/* 気圧変化アイコン */}
        {weatherData?.hasPressureChange && (
          <foreignObject x={cx - 8} y={cy - 45} width={16} height={16}>
            <div className="flex items-center justify-center">
              <Activity className="h-4 w-4 text-red-500" />
            </div>
          </foreignObject>
        )}
      </g>
    );
  };

  // ローディング中の表示
  if (loading) {
    return (
      <div className="max-w-[594mm] mx-auto bg-white p-8 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">体調・行動ダッシュボード</h1>
          <p className="text-gray-600 mt-1">日々の体調変化とゲームプレイ記録を確認できます</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="max-w-[594mm] mx-auto bg-white p-8 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">体調・行動ダッシュボード</h1>
          <p className="text-gray-600 mt-1">日々の体調変化とゲームプレイ記録を確認できます</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">データの読み込みに失敗しました</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-[594mm] mx-auto bg-white p-8 space-y-6">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">体調・行動ダッシュボード</h1>
        <p className="text-gray-600 mt-1">日々の体調変化とゲームプレイ記録を確認できます</p>
        <div className="flex gap-4 items-center mt-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">利用者</p>
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-64 border-gray-300"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">対象年月</p>
            <div className="flex gap-2">
              <Select
                value={selectedYear.toString()}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-28 border-gray-300"
              >
                {[2023, 2024, 2025].map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}年
                  </option>
                ))}
              </Select>
              <Select
                value={selectedMonth.toString()}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-24 border-gray-300"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month.toString()}>
                    {month}月
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* 第1行: サマリー指標 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Gamepad2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">累計プレイ回数</p>
            <p className="text-3xl font-bold text-gray-900">{totalPlayCount}回</p>
            <div className="flex items-center gap-1 mt-1">
              {playCountDifference >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-600" />
              )}
              <p className={`text-xs font-medium ${playCountDifference >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {playCountDifference >= 0 ? '+' : ''}{playCountDifference}回
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Moon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">平均睡眠時間</p>
            <p className="text-3xl font-bold text-gray-900">{averageSleep.toFixed(1)}時間</p>
            <div className="flex items-center gap-1 mt-1">
              {sleepDifference >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-orange-600" />
              )}
              <p className={`text-xs font-medium ${sleepDifference >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                {sleepDifference >= 0 ? '+' : ''}{sleepDifference.toFixed(1)}時間
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">現在のランク</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalPlayCount >= 200 ? 'ゴールド' : totalPlayCount >= 100 ? 'シルバー' : totalPlayCount >= 50 ? 'ブロンズ' : 'ビギナー'}
            </p>
            <p className="text-xs text-gray-600 mt-1">{totalPlayCount}回達成</p>
          </CardContent>
        </Card>

        {/* カレンダー */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 bg-gray-50 border-b">
            <CardTitle className="text-sm text-gray-900">
              {selectedYear}年{selectedMonth}月
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                <div key={i} className="text-center text-[10px] font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const hasRecord = day && recordedDays.includes(day);
                const isTodayDate = isCurrentMonth && day === today.getDate();

                return (
                  <div key={index} className="aspect-square flex items-center justify-center">
                    {day && (
                      <button
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium transition-all ${
                          isTodayDate
                            ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg ring-1 ring-blue-300"
                            : hasRecord
                            ? "bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-sm hover:shadow-md"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {day}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 第2行: メイングラフ（疲労度・睡眠時間・気温） */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 bg-gray-50 border-b">
          <CardTitle className="text-base text-gray-900 flex items-center gap-2">
            疲労度・睡眠時間・気温
            <span className="text-xs font-normal text-gray-500">
              (気圧変化: <Activity className="h-3 w-3 inline text-red-500" />)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={dailyHealthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" fontSize={11} />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                fontSize={11}
                label={{
                  value: "疲労(%)/睡眠(h)",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 11,
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 30]}
                fontSize={11}
                label={{ value: "気温(℃)", angle: 90, position: "insideRight", fontSize: 11 }}
              />
              <Tooltip />
              <Legend iconSize={12} wrapperStyle={{ fontSize: "12px" }} />
              <Bar yAxisId="left" dataKey="fatigue" fill="#f97316" name="疲労度(%)" />
              <Bar yAxisId="left" dataKey="sleepHours" fill="#3b82f6" name="睡眠(h)" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                stroke="#3b82f6"
                strokeWidth={2}
                name="気温(℃)"
                dot={<CustomDot />}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 第3行: プレイしたゲーム */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 bg-gray-50 border-b">
          <CardTitle className="text-base text-gray-900">プレイしたゲーム</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {gameStats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              今月のゲームプレイデータがありません
            </p>
          ) : (
            <div className="flex gap-6 justify-center flex-wrap">
              {gameStats.map((game) => (
                <div key={game.gameId} className="text-center relative">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-gray-200 shadow-sm">
                      {game.gameImageUrl ? (
                        <Image
                          src={game.gameImageUrl}
                          alt={game.gameName}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                          {game.gameName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <Badge className="absolute -top-1 -right-1 bg-blue-500 text-white font-bold text-xs">
                      {game.playCount}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium mt-2 w-20 text-gray-700 truncate">{game.gameName}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 第3行: AIコメント */}
      <Card className="border border-blue-200 shadow-sm bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🐻</div>
            <div>
              <p className="text-sm font-bold text-blue-900 mb-2">サポートメッセージ</p>
              <p className="text-sm leading-relaxed text-gray-700">
                先月に比べて疲労感が安定してきたね。睡眠時間は少し減っているけど、ゲームへの集中が続いているのは素晴らしい！
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 記録一覧 */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3 bg-gray-50 border-b">
          <CardTitle className="text-base text-gray-900">日々の記録</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {healthRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              記録がありません
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 font-semibold text-gray-700">日付</th>
                  <th className="text-left py-2 font-semibold text-gray-700">できたこと</th>
                  <th className="text-left py-2 font-semibold text-gray-700">難しかったこと</th>
                  <th className="text-left py-2 font-semibold text-gray-700">コメント</th>
                </tr>
              </thead>
              <tbody>
                {healthRecords.map((record, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{record.date}</td>
                    <td className="py-3 text-gray-700">{record.achievedTasks || '-'}</td>
                    <td className="py-3 text-gray-700">{record.difficultTasks || '-'}</td>
                    <td className="py-3 text-gray-700">{record.freeNotes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
