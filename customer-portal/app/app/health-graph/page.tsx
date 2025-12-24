"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  Calendar as CalendarIcon,
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  Medal,
  TrendingUp,
  Gamepad2,
} from "lucide-react";

// Sample data - 1ヶ月分のデータ
const dailyHealthData = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  return {
    day,
    fatigue: Math.floor(Math.random() * 40) + 30, // 30-70%
    sleepHours: (Math.random() * 3 + 5).toFixed(1), // 5.0-8.0時間
    temperature: (Math.random() * 10 + 15).toFixed(1), // 15-25度
    pressure: Math.floor(Math.random() * 30) + 1000, // 1000-1030hPa
    weather: ["sunny", "cloudy", "rainy", "snow"][Math.floor(Math.random() * 4)],
  };
});

// 気分・感情データ（円グラフ用）
const emotionData = [
  { name: "とても良い", value: 12, color: "#22c55e" },
  { name: "良い", value: 10, color: "#3b82f6" },
  { name: "普通", value: 6, color: "#f59e0b" },
  { name: "悪い", value: 2, color: "#ef4444" },
  { name: "とても悪い", value: 1, color: "#991b1b" },
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
const getWeatherIcon = (weather: string) => {
  switch (weather) {
    case "sunny":
      return <Sun className="h-4 w-4 text-yellow-500" />;
    case "cloudy":
      return <Cloud className="h-4 w-4 text-gray-500" />;
    case "rainy":
      return <CloudRain className="h-4 w-4 text-blue-500" />;
    case "snow":
      return <CloudSnow className="h-4 w-4 text-blue-300" />;
    default:
      return <Sun className="h-4 w-4" />;
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

      {/* サマリーカード */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* 累計プレイ回数 */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Gamepad2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">累計プレイ回数</p>
                  <p className="text-2xl font-bold">230回</p>
                </div>
              </div>
              <Badge className="bg-green-500">+14回</Badge>
            </div>
          </CardContent>
        </Card>

        {/* 平均睡眠時間 */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">平均睡眠時間</p>
                  <p className="text-2xl font-bold">6.2時間</p>
                </div>
              </div>
              <Badge variant="destructive">-0.5時間</Badge>
            </div>
          </CardContent>
        </Card>

        {/* メダル */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-pink-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                  <Medal className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">現在のランク</p>
                  <p className="text-2xl font-bold">ゴールド</p>
                </div>
              </div>
              <div className="text-4xl">🥇</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* カレンダーと気分円グラフ */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* カレンダー */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="text-purple-900">記録カレンダー</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Month/Year header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">
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
            <div className="grid grid-cols-7 gap-2 mb-3">
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
                      <div className="relative w-full h-full flex items-center justify-center">
                        <button
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                            isTodayDate
                              ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg"
                              : hasRecord
                              ? "bg-gradient-to-br from-green-400 to-emerald-400 text-white shadow-md"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {day}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-400"></div>
                <span>記録あり</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500"></div>
                <span>今日</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 気分・感情の円グラフ */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="text-purple-900">今月の気分</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* グラフエリア */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 疲労度グラフ */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-red-50">
            <CardTitle className="text-orange-900">疲労度（%）</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="fatigue"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 睡眠時間グラフ */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="text-blue-900">睡眠時間（時間）</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="sleepHours" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 天気・気温・気圧グラフ */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-gradient-to-r from-sky-50 to-blue-50">
          <CardTitle className="text-sky-900">天気・気温・気圧</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={dailyHealthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" label={{ value: "気温(℃)", angle: -90, position: "insideLeft" }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "気圧(hPa)", angle: 90, position: "insideRight" }}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#ef4444"
                strokeWidth={2}
                name="気温"
                dot={{ r: 3 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="pressure"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="気圧"
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* 天気アイコン表示 */}
          <div className="mt-4 grid grid-cols-7 gap-2">
            {dailyHealthData.slice(0, 7).map((data) => (
              <div key={data.day} className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{data.day}日</span>
                {getWeatherIcon(data.weather)}
              </div>
            ))}
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
