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
import { getFacility } from "@/lib/api/client";

// Sample data - 1ヶ月分のデータ
const dailyHealthData = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  return {
    day,
    fatigue: Math.floor(Math.random() * 40) + 30,
    sleepHours: parseFloat((Math.random() * 3 + 5).toFixed(1)),
    temperature: parseFloat((Math.random() * 10 + 15).toFixed(1)),
    pressure: Math.floor(Math.random() * 30) + 1000,
    weather: ["sunny", "cloudy", "rainy", "snow"][Math.floor(Math.random() * 4)],
  };
});

// 気圧の大きな変化がある日を検出
const detectPressureChanges = () => {
  const changes = [];
  for (let i = 1; i < dailyHealthData.length; i++) {
    const diff = Math.abs(dailyHealthData[i].pressure - dailyHealthData[i - 1].pressure);
    if (diff > 15) {
      // 15hPa以上の変化
      changes.push(dailyHealthData[i].day);
    }
  }
  return changes;
};

const pressureChangeDays = detectPressureChanges();

// プレイしたゲーム（メダル表示用）
const playedGames = [
  { id: "gesoten", playCount: 50, isRecent: true },
  { id: "mcheroes", playCount: 73, isRecent: true },
  { id: "elf1", playCount: 23, isRecent: true },
  { id: "axie-tri", playCount: 16, isRecent: false },
  { id: "xeno", playCount: 12, isRecent: true },
  { id: "elf2", playCount: 8, isRecent: false },
];

// 記録がある日（カレンダー用）
const recordedDays = [1, 3, 5, 8, 9, 10, 11, 12, 15, 17, 19, 22, 24, 25, 29];

// 記録データ
const records = [
  {
    date: "2024-12-24",
    achievements: "ゲームを3回クリアできた",
    challenges: "集中力が続かなかった",
    notes: "朝から元気でした",
  },
  {
    date: "2024-12-23",
    achievements: "新しいゲームに挑戦した",
    challenges: "ルールの理解に時間がかかった",
    notes: "楽しかった",
  },
  {
    date: "2024-12-22",
    achievements: "早起きできた",
    challenges: "特になし",
    notes: "調子良かったです",
  },
];

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

// カスタムドット（気温の折れ線グラフ用 - 天気アイコンと気圧変化アイコンを表示）
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  const weatherData = dailyHealthData.find((d) => d.day === payload.day);
  const hasPressureChange = pressureChangeDays.includes(payload.day);

  return (
    <g>
      <circle cx={cx} cy={cy} r={3} fill="#3b82f6" />
      {/* 天気アイコン */}
      <foreignObject x={cx - 10} y={cy - 25} width={20} height={20}>
        <div className="flex items-center justify-center">
          {weatherData && getWeatherIcon(weatherData.weather, true)}
        </div>
      </foreignObject>
      {/* 気圧変化アイコン */}
      {hasPressureChange && (
        <foreignObject x={cx - 8} y={cy - 45} width={16} height={16}>
          <div className="flex items-center justify-center">
            <Activity className="h-4 w-4 text-red-500" />
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default function HealthGraphPage() {
  // API data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMonth, setSelectedMonth] = useState<number>(12);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

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

      {/* 第1行: サマリー指標とゲームメダル */}
      <div className="grid grid-cols-2 gap-6">
        {/* 左側: サマリー指標 */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-1">累計プレイ回数</p>
              <p className="text-3xl font-bold text-gray-900">230回</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-600 font-medium">+14回</p>
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
              <p className="text-3xl font-bold text-gray-900">6.2時間</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="h-4 w-4 text-orange-600" />
                <p className="text-xs text-orange-600 font-medium">-0.5時間</p>
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
              <p className="text-2xl font-bold text-gray-900">ゴールド</p>
              <p className="text-xs text-gray-600 mt-1">230回達成</p>
            </CardContent>
          </Card>
        </div>

        {/* 右側: プレイしたゲーム */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 bg-gray-50 border-b">
            <CardTitle className="text-base text-gray-900">プレイしたゲーム</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex gap-6 justify-center flex-wrap">
              {playedGames.map((game) => {
                const gameInfo = GAMES.find((g) => g.id === game.id);
                if (!gameInfo) return null;
                return (
                  <div key={game.id} className="text-center relative">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-gray-200 shadow-sm">
                        <Image
                          src={gameInfo.image}
                          alt={gameInfo.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                      <Badge
                        className={`absolute -top-1 -right-1 ${
                          game.isRecent ? "bg-blue-500" : "bg-gray-400"
                        } text-white font-bold text-xs`}
                      >
                        {game.playCount}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium mt-2 w-20 text-gray-700">{gameInfo.name}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 第2行: 統合グラフとカレンダー */}
      <div className="grid grid-cols-3 gap-6">
        {/* 疲労度・睡眠時間・気温グラフ */}
        <Card className="col-span-2 border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 bg-gray-50 border-b">
            <CardTitle className="text-base text-gray-900 flex items-center gap-2">
              疲労度・睡眠時間・気温
              <span className="text-xs font-normal text-gray-500">
                (気圧変化: <Activity className="h-3 w-3 inline text-red-500" />)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={dailyHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" fontSize={10} />
                <YAxis
                  yAxisId="left"
                  domain={[0, 100]}
                  fontSize={10}
                  label={{
                    value: "疲労(%)/睡眠(h)",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 10,
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 30]}
                  fontSize={10}
                  label={{ value: "気温(℃)", angle: 90, position: "insideRight", fontSize: 10 }}
                />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "10px" }} />
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

        {/* カレンダー */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3 bg-gray-50 border-b">
            <CardTitle className="text-base text-gray-900">
              {selectedYear}年{selectedMonth}月
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                <div key={i} className="text-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const hasRecord = day && recordedDays.includes(day);
                const isTodayDate = isCurrentMonth && day === today.getDate();

                return (
                  <div key={index} className="aspect-square flex items-center justify-center">
                    {day && (
                      <button
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          isTodayDate
                            ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg ring-2 ring-blue-300"
                            : hasRecord
                            ? "bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-md hover:shadow-lg"
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
              {records.map((record, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">{record.date}</td>
                  <td className="py-3 text-gray-700">{record.achievements}</td>
                  <td className="py-3 text-gray-700">{record.challenges}</td>
                  <td className="py-3 text-gray-700">{record.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
