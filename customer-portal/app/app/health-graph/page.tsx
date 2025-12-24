"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const icons = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "🌧️",
    snow: "❄️",
  };
  return icons[weather as keyof typeof icons] || "☀️";
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
    <div className="max-w-[210mm] mx-auto bg-white p-8 space-y-6">
      {/* ヘッダー */}
      <div className="border-b-2 border-gray-900 pb-3">
        <h1 className="text-2xl font-bold text-gray-900">体調・行動ダッシュボード</h1>
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-600">HATARAKU T.O. 様</p>
          <p className="text-sm text-gray-600">
            {selectedYear}年{selectedMonth}月度
          </p>
        </div>
      </div>

      {/* サマリー指標 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border-2 border-gray-300 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 className="h-5 w-5" />
            <p className="text-xs font-semibold text-gray-700">累計プレイ回数</p>
          </div>
          <p className="text-3xl font-bold">230回</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-4 w-4 text-gray-600" />
            <p className="text-xs text-gray-600">+14回</p>
          </div>
        </div>

        <div className="border-2 border-gray-300 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="h-5 w-5" />
            <p className="text-xs font-semibold text-gray-700">平均睡眠時間</p>
          </div>
          <p className="text-3xl font-bold">6.2時間</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingDown className="h-4 w-4 text-gray-600" />
            <p className="text-xs text-gray-600">-0.5時間</p>
          </div>
        </div>

        <div className="border-2 border-gray-300 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🏆</span>
            <p className="text-xs font-semibold text-gray-700">現在のランク</p>
          </div>
          <p className="text-3xl font-bold">ゴールド</p>
          <p className="text-xs text-gray-600 mt-1">230回達成</p>
        </div>
      </div>

      {/* プレイしたゲーム */}
      <div className="border-2 border-gray-300">
        <div className="bg-gray-100 border-b-2 border-gray-300 px-4 py-2">
          <h2 className="font-bold text-sm">プレイしたゲーム</h2>
        </div>
        <div className="p-4">
          <div className="flex gap-6">
            {playedGames.map((game) => (
              <div key={game.id} className="text-center">
                <div
                  className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-lg font-bold mb-1 ${
                    game.isRecent
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-400 bg-white text-gray-400"
                  }`}
                >
                  {game.playCount}
                </div>
                <p className="text-xs font-medium w-20 truncate">{game.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-2 gap-4">
        {/* 疲労度・睡眠時間 */}
        <div className="border-2 border-gray-300">
          <div className="bg-gray-100 border-b-2 border-gray-300 px-4 py-2">
            <h2 className="font-bold text-sm">疲労度・睡眠時間</h2>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={dailyHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis dataKey="day" fontSize={10} />
                <YAxis yAxisId="left" domain={[0, 100]} fontSize={10} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} fontSize={10} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "10px" }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="fatigue"
                  stroke="#000"
                  strokeWidth={2}
                  name="疲労度(%)"
                  dot={false}
                />
                <Bar yAxisId="right" dataKey="sleepHours" fill="#666" name="睡眠(h)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* カレンダー */}
        <div className="border-2 border-gray-300">
          <div className="bg-gray-100 border-b-2 border-gray-300 px-4 py-2">
            <h2 className="font-bold text-sm">
              {selectedYear}年{selectedMonth}月
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                <div key={i} className="text-center text-xs font-bold">
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
                      <div
                        className={`w-full h-full flex items-center justify-center text-xs font-medium border ${
                          isTodayDate
                            ? "bg-gray-900 text-white border-gray-900"
                            : hasRecord
                            ? "bg-gray-300 border-gray-400"
                            : "border-gray-200"
                        }`}
                      >
                        {day}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 天気データ */}
      <div className="border-2 border-gray-300">
        <div className="bg-gray-100 border-b-2 border-gray-300 px-4 py-2">
          <h2 className="font-bold text-sm">天気・気温（直近7日間）</h2>
        </div>
        <div className="p-4">
          <div className="flex gap-4">
            {dailyHealthData.slice(0, 7).map((data) => (
              <div key={data.day} className="text-center border border-gray-300 p-2 flex-1">
                <p className="text-xs font-bold mb-1">{data.day}日</p>
                <p className="text-lg mb-1">{getWeatherIcon(data.weather)}</p>
                <p className="text-sm font-medium">{data.temperature}℃</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AIコメント */}
      <div className="border-2 border-gray-900 bg-gray-50">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🐻</div>
            <div>
              <p className="text-xs font-bold mb-1">サポートメッセージ</p>
              <p className="text-sm leading-relaxed">
                先月に比べて疲労感が安定してきたね。睡眠時間は少し減っているけど、ゲームへの集中が続いているのは素晴らしい！
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 記録一覧 */}
      <div className="border-2 border-gray-300">
        <div className="bg-gray-100 border-b-2 border-gray-300 px-4 py-2">
          <h2 className="font-bold text-sm">日々の記録</h2>
        </div>
        <div className="p-4">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-gray-400">
                <th className="text-left py-2 font-bold">日付</th>
                <th className="text-left py-2 font-bold">できたこと</th>
                <th className="text-left py-2 font-bold">難しかったこと</th>
                <th className="text-left py-2 font-bold">コメント</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="py-2 font-medium">{record.date}</td>
                  <td className="py-2">{record.achievements}</td>
                  <td className="py-2">{record.challenges}</td>
                  <td className="py-2">{record.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
