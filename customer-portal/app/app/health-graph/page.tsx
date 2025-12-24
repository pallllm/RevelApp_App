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
    fatigue: Math.floor(Math.random() * 40) + 30,
    sleepHours: parseFloat((Math.random() * 3 + 5).toFixed(1)),
    temperature: parseFloat((Math.random() * 10 + 15).toFixed(1)),
    pressure: Math.floor(Math.random() * 30) + 1000,
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
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">体調グラフ</h1>
        <p className="text-gray-600 mt-1 text-sm">
          日々の体調変化とゲームプレイ記録を確認できます
        </p>
      </div>

      {/* サマリー指標 - 横並び3つ */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* 累計プレイ回数 */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">累計プレイ回数</p>
            <p className="text-3xl font-bold text-gray-900">230回</p>
            <p className="text-xs text-green-600 mt-1">+14回 先月比</p>
          </CardContent>
        </Card>

        {/* 平均睡眠時間 */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">平均睡眠時間</p>
            <p className="text-3xl font-bold text-gray-900">6.2時間</p>
            <p className="text-xs text-red-600 mt-1">-0.5時間 先月比</p>
          </CardContent>
        </Card>

        {/* メダル/ランク */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">現在のランク</p>
            <p className="text-3xl font-bold text-gray-900">ゴールド</p>
            <p className="text-xs text-gray-500 mt-1">230回達成</p>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ：2カラム */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左: プレイしたゲーム + カレンダー */}
        <div className="lg:col-span-2 space-y-6">
          {/* プレイしたゲーム */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-lg text-gray-900">プレイしたゲーム</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {playedGames.slice(0, 6).map((game) => (
                  <div
                    key={game.id}
                    className={`flex-shrink-0 text-center ${
                      game.isRecent ? "" : "opacity-50"
                    }`}
                  >
                    <div
                      className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-xl font-bold shadow-md ${
                        game.isRecent
                          ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {game.playCount}
                    </div>
                    <p className="text-xs font-medium text-gray-700 w-20 truncate">
                      {game.name}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* カレンダー */}
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedYear}年{selectedMonth}月
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-gray-600"
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
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-gray-600"
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

              <div className="grid grid-cols-7 gap-2 mb-3">
                {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                  <div
                    key={i}
                    className="text-center text-xs font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
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
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                            isTodayDate
                              ? "bg-blue-500 text-white shadow-sm"
                              : hasRecord
                              ? "bg-green-100 text-green-700"
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

        {/* 右: AIコメント */}
        <div>
          <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl flex-shrink-0">
                  🐻
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-900 mb-1">
                    HATARAKU T.O. 様
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                先月に比べて疲労感が安定してきたね。睡眠時間は少し減っているけど、ゲームへの集中が続いているのは素晴らしい！
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* グラフエリア */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-lg text-gray-900">時系列コンディション</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={dailyHealthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                stroke="#f97316"
                fontSize={12}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 10]}
                stroke="#3b82f6"
                fontSize={12}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="fatigue"
                stroke="#f97316"
                strokeWidth={2}
                name="疲労度(%)"
                dot={{ r: 2 }}
              />
              <Bar yAxisId="right" dataKey="sleepHours" fill="#3b82f6" name="睡眠時間(h)" />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex gap-4 overflow-x-auto">
              {dailyHealthData.slice(0, 7).map((data) => (
                <div key={data.day} className="flex-shrink-0 text-center">
                  <p className="text-xs text-gray-500 mb-1">{data.day}日</p>
                  {getWeatherIcon(data.weather, "h-5 w-5 mx-auto")}
                  <p className="text-xs text-gray-600 mt-1">{data.temperature}℃</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 記録一覧 */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-lg text-gray-900">日々の記録</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {records.map((record, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-semibold text-gray-900 mb-3">{record.date}</h4>
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
