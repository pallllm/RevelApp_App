"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { GAMES } from "@/lib/constants";

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
const getWeatherIcon = (weather: string) => {
  switch (weather) {
    case "sunny":
      return <Sun className="h-5 w-5 text-yellow-500" />;
    case "cloudy":
      return <Cloud className="h-5 w-5 text-gray-400" />;
    case "rainy":
      return <CloudRain className="h-5 w-5 text-blue-500" />;
    case "snow":
      return <CloudSnow className="h-5 w-5 text-blue-300" />;
    default:
      return <Sun className="h-5 w-5 text-yellow-500" />;
  }
};

// 利用者リスト
const users = [
  { id: "1", name: "HATARAKU T.O." },
  { id: "2", name: "山田 太郎" },
  { id: "3", name: "佐藤 花子" },
];

export default function HealthGraphPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMonth, setSelectedMonth] = useState<number>(12);
  const [selectedUserId, setSelectedUserId] = useState<string>("1");

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

  return (
    <div className="max-w-[594mm] mx-auto bg-gradient-to-br from-slate-50 to-blue-50 p-8 space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold">体調・行動ダッシュボード</h1>
        <div className="flex gap-4 items-center mt-4">
          <div>
            <p className="text-sm text-blue-100 mb-1">利用者</p>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-64 bg-white text-gray-900 border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="text-sm text-blue-100 mb-1">対象年月</p>
            <div className="flex gap-2">
              <Select
                value={selectedYear.toString()}
                onValueChange={(v) => setSelectedYear(parseInt(v))}
              >
                <SelectTrigger className="w-28 bg-white text-gray-900 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2023, 2024, 2025].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}年
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(v) => setSelectedMonth(parseInt(v))}
              >
                <SelectTrigger className="w-24 bg-white text-gray-900 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month}月
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* 第1行: サマリー指標とゲームメダル */}
      <div className="grid grid-cols-2 gap-6">
        {/* 左側: サマリー指標 */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                  <Gamepad2 className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-1">累計プレイ回数</p>
              <p className="text-3xl font-bold text-gray-900">230回</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-600 font-semibold">+14回</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-md">
                  <Moon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-1">平均睡眠時間</p>
              <p className="text-3xl font-bold text-gray-900">6.2時間</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="h-4 w-4 text-orange-600" />
                <p className="text-xs text-orange-600 font-semibold">-0.5時間</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md">
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-1">現在のランク</p>
              <p className="text-2xl font-bold text-gray-900">ゴールド</p>
              <p className="text-xs text-gray-600 mt-1">230回達成</p>
            </CardContent>
          </Card>
        </div>

        {/* 右側: プレイしたゲーム */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">プレイしたゲーム</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 justify-center flex-wrap">
              {playedGames.map((game) => {
                const gameInfo = GAMES.find((g) => g.id === game.id);
                if (!gameInfo) return null;
                return (
                  <div key={game.id} className="text-center relative">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
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
                          game.isRecent
                            ? "bg-gradient-to-r from-blue-500 to-purple-500"
                            : "bg-gray-400"
                        } text-white font-bold shadow-md`}
                      >
                        {game.playCount}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium mt-2 w-20">{gameInfo.name}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 第2行: 統合グラフと気圧変化グラフ、カレンダー */}
      <div className="grid grid-cols-3 gap-6">
        {/* 疲労度・睡眠時間・気温グラフ */}
        <Card className="col-span-2 shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">疲労度・睡眠時間・気温</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 天気アイコン */}
            <div className="flex gap-1 mb-2 justify-center">
              {dailyHealthData.slice(0, 15).map((data) => (
                <div key={data.day} className="flex flex-col items-center">
                  {getWeatherIcon(data.weather)}
                  <span className="text-xs text-gray-500">{data.day}</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={dailyHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" fontSize={10} />
                <YAxis yAxisId="left" domain={[0, 100]} fontSize={10} label={{ value: '疲労(%)/睡眠(h)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 30]} fontSize={10} label={{ value: '気温(℃)', angle: 90, position: 'insideRight', fontSize: 10 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "10px" }} />
                <Bar yAxisId="left" dataKey="fatigue" fill="#f97316" name="疲労度(%)" />
                <Bar yAxisId="left" dataKey="sleepHours" fill="#3b82f6" name="睡眠(h)" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="気温(℃)"
                  dot={{ fill: "#ef4444", r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* カレンダー */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedYear}年{selectedMonth}月
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["日", "月", "火", "水", "木", "金", "土"].map((day, i) => (
                <div
                  key={i}
                  className={`text-center text-xs font-bold ${
                    i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-700"
                  }`}
                >
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
                        className={`w-full h-full flex items-center justify-center text-xs font-medium rounded-lg transition-all ${
                          isTodayDate
                            ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg ring-2 ring-blue-300"
                            : hasRecord
                            ? "bg-gradient-to-br from-purple-400 to-pink-400 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {day}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 第3行: 気圧変化グラフとAIコメント */}
      <div className="grid grid-cols-2 gap-6">
        {/* 気圧変化グラフ */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">気圧変化</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={dailyHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" fontSize={10} />
                <YAxis domain={[990, 1030]} fontSize={10} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="pressure"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="気圧(hPa)"
                  dot={{ fill: "#8b5cf6", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AIコメント */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="text-5xl">🐻</div>
              <div>
                <p className="text-sm font-bold text-amber-900 mb-2">サポートメッセージ</p>
                <p className="text-sm leading-relaxed text-gray-700">
                  先月に比べて疲労感が安定してきたね。睡眠時間は少し減っているけど、ゲームへの集中が続いているのは素晴らしい！
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 記録一覧 */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">日々の記録</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 font-bold text-gray-700">日付</th>
                <th className="text-left py-2 font-bold text-gray-700">できたこと</th>
                <th className="text-left py-2 font-bold text-gray-700">難しかったこと</th>
                <th className="text-left py-2 font-bold text-gray-700">コメント</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
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
