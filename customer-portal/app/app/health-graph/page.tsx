"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

// Sample data - 1ヶ月分のデータ
const dailyHealthData = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  return {
    day,
    fatigue: Math.floor(Math.random() * 40) + 30, // 30-70%
    sleepHours: parseFloat((Math.random() * 3 + 5).toFixed(1)), // 5.0-8.0時間
    temperature: parseFloat((Math.random() * 10 + 15).toFixed(1)), // 15-25度
    pressure: Math.floor(Math.random() * 30) + 1000, // 1000-1030hPa
    weather: ["sunny", "cloudy", "rainy", "snow"][Math.floor(Math.random() * 4)],
  };
});

// プレイしたゲーム（メダル表示用）
const playedGames = [
  { id: "gesoten", name: "ゲソテンバース", playCount: 50, isRecent: true },
  { id: "mcheroes", name: "マイクリプトヒーローズ", playCount: 73, isRecent: true },
  { id: "elf1", name: "エルフの森 Lv1", playCount: 23, isRecent: true },
  { id: "axie-tri", name: "Axie トライフォース", playCount: 16, isRecent: false },
  { id: "xeno", name: "XENO", playCount: 12, isRecent: true },
  { id: "elf2", name: "エルフの森 Lv2", playCount: 8, isRecent: false },
  { id: "axie-quest", name: "Axie クエスト", playCount: 6, isRecent: false },
  { id: "cryptospells", name: "クリプトスペルズ", playCount: 4, isRecent: false },
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
const getWeatherIcon = (weather: string, size: string = "h-4 w-4") => {
  switch (weather) {
    case "sunny":
      return <Sun className={`${size} text-yellow-500`} />;
    case "cloudy":
      return <Cloud className={`${size} text-gray-500`} />;
    case "rainy":
      return <CloudRain className={`${size} text-blue-500`} />;
    case "snow":
      return <CloudSnow className={`${size} text-blue-300`} />;
    default:
      return <Sun className={size} />;
  }
};

export default function HealthGraphPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMonth, setSelectedMonth] = useState<number>(12);

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

  // カレンダーナビゲーション
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          体調グラフ
        </h1>
        <p className="text-muted-foreground mt-2">
          日々の体調変化とゲームプレイ記録を確認できます
        </p>
      </div>

      {/* 3カラムレイアウト：左（サマリー）、中央（ゲーム一覧）、右（カレンダー+コメント） */}
      <div className="grid gap-4 md:grid-cols-12">
        {/* 左カラム：サマリー指標 */}
        <div className="md:col-span-3 space-y-4">
          {/* 累計プレイ回数 */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-md">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">累計プレイ回数</p>
                  <p className="text-3xl font-bold text-gray-800">230回</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-orange-200">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">+14回</span>
                <span className="text-xs text-gray-600">先月比</span>
              </div>
            </CardContent>
          </Card>

          {/* 平均睡眠時間 */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
                  <Cloud className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">平均睡眠時間</p>
                  <p className="text-3xl font-bold text-gray-800">6.2時間</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-purple-200">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm font-semibold text-red-600">-0.5時間</span>
                <span className="text-xs text-gray-600">先月比</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 中央カラム：プレイしたゲーム一覧 */}
        <div className="md:col-span-5">
          <Card className="shadow-lg border-0 h-full">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-purple-900">プレイしたゲーム</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {playedGames.map((game) => (
                  <div
                    key={game.id}
                    className={`relative p-3 rounded-xl transition-all ${
                      game.isRecent
                        ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 shadow-md"
                        : "bg-gray-100 border-2 border-gray-300 opacity-60"
                    }`}
                  >
                    {/* メダル風円形 */}
                    <div
                      className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ${
                        game.isRecent
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                          : "bg-gray-400 text-gray-200"
                      }`}
                    >
                      {game.playCount}
                    </div>
                    <p
                      className={`text-xs text-center font-semibold leading-tight ${
                        game.isRecent ? "text-gray-800" : "text-gray-500"
                      }`}
                    >
                      {game.name}
                    </p>
                    {game.isRecent && (
                      <Badge className="absolute top-1 right-1 bg-green-500 text-xs px-1.5 py-0">
                        NEW
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右カラム：カレンダー + AIコメント */}
        <div className="md:col-span-4 space-y-4">
          {/* カレンダー */}
          <Card className="shadow-lg border-0">
            <CardContent className="pt-6">
              {/* Month/Year header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {selectedYear}年{selectedMonth}月
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePreviousMonth}
                    className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-xs font-medium text-gray-400"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const hasRecord = day && recordedDays.includes(day);
                  const isTodayDate = isCurrentMonth && day === today.getDate();

                  return (
                    <div
                      key={index}
                      className="aspect-square flex items-center justify-center"
                    >
                      {day && (
                        <button
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                            isTodayDate
                              ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg ring-2 ring-blue-300"
                              : hasRecord
                              ? "bg-gradient-to-br from-green-400 to-emerald-400 text-white shadow-md"
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

          {/* AIキャラクターコメント */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-pink-50 to-purple-50">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                  🐻
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-purple-900 mb-1">
                    HATARAKU T.O. 様
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    先月に比べて疲労感が安定してきたね。睡眠時間は少し減っているけど、ゲームへの集中が続いているのは素晴らしい！
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 下段：時系列コンディショングラフ */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-purple-50">
          <CardTitle className="text-purple-900">時系列コンディション</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={dailyHealthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" domain={[0, 100]} label={{ value: "疲労度(%)", angle: -90, position: "insideLeft" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 10]}
                label={{ value: "睡眠時間(h)", angle: 90, position: "insideRight" }}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="fatigue"
                stroke="#f97316"
                strokeWidth={2}
                name="疲労度"
                dot={{ r: 3 }}
              />
              <Bar yAxisId="right" dataKey="sleepHours" fill="#3b82f6" name="睡眠時間" />
            </ComposedChart>
          </ResponsiveContainer>

          {/* 天気・気温表示 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-7 gap-2">
              {dailyHealthData.slice(0, 7).map((data) => (
                <div key={data.day} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium">{data.day}日</span>
                  {getWeatherIcon(data.weather, "h-5 w-5")}
                  <span className="text-xs text-gray-600">{data.temperature}℃</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 記録一覧 */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-green-900">日々の記録</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {records.map((record, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800">{record.date}</h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-green-700">
                      ✓ できたこと：
                    </span>
                    <p className="text-sm text-gray-700 ml-4">
                      {record.achievements}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-orange-700">
                      ⚠ 難しかったこと：
                    </span>
                    <p className="text-sm text-gray-700 ml-4">
                      {record.challenges}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-700">
                      📝 一言コメント：
                    </span>
                    <p className="text-sm text-gray-700 ml-4">{record.notes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
