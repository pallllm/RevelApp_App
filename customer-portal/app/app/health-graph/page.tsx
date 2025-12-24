"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Activity, TrendingUp, Calendar } from "lucide-react";

// Sample data
const weeklyHealthData = [
  { date: "12/18", mood: 4, energy: 3, focus: 4, stress: 2 },
  { date: "12/19", mood: 5, energy: 4, focus: 5, stress: 1 },
  { date: "12/20", mood: 4, energy: 4, focus: 4, stress: 2 },
  { date: "12/21", mood: 3, energy: 3, focus: 3, stress: 3 },
  { date: "12/22", mood: 4, energy: 4, focus: 4, stress: 2 },
  { date: "12/23", mood: 5, energy: 5, focus: 5, stress: 1 },
  { date: "12/24", mood: 5, energy: 4, focus: 5, stress: 1 },
];

const radarData = [
  { subject: "気分", value: 4.3, fullMark: 5 },
  { subject: "エネルギー", value: 3.9, fullMark: 5 },
  { subject: "集中力", value: 4.3, fullMark: 5 },
  { subject: "ストレス", value: 1.7, fullMark: 5 },
  { subject: "睡眠", value: 4.0, fullMark: 5 },
  { subject: "体調", value: 4.2, fullMark: 5 },
];

const members = [
  "全体平均",
  "田中 太郎",
  "佐藤 花子",
  "鈴木 一郎",
  "高橋 美咲",
];

export default function HealthGraphPage() {
  const [selectedMember, setSelectedMember] = useState("全体平均");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">体調グラフ</h1>
          <p className="text-muted-foreground">
            利用者の体調変化を視覚化して確認できます
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          期間を変更
        </Button>
      </div>

      {/* Member Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            {members.map((member) => (
              <Button
                key={member}
                variant={selectedMember === member ? "default" : "outline"}
                onClick={() => setSelectedMember(member)}
              >
                {member}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均気分スコア</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.3 / 5.0</div>
            <p className="text-xs text-muted-foreground mt-1">
              安定した推移
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">集中力</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.3 / 5.0</div>
            <p className="text-xs text-muted-foreground mt-1">
              高水準を維持
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">エネルギー</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.9 / 5.0</div>
            <p className="text-xs text-muted-foreground mt-1">
              良好な状態
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ストレスレベル</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.7 / 5.0</div>
            <p className="text-xs text-muted-foreground mt-1">
              低く抑えられています
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>週間推移（{selectedMember}）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={weeklyHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="気分"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  stroke="#f97316"
                  strokeWidth={2}
                  name="エネルギー"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="focus"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="集中力"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="ストレス"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>総合評価（{selectedMember}）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis domain={[0, 5]} />
                <Radar
                  name="スコア"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>最近の記録</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                date: "2024-12-24",
                member: "田中 太郎",
                mood: "とても良い",
                note: "ゲームに集中できました",
              },
              {
                date: "2024-12-24",
                member: "佐藤 花子",
                mood: "良い",
                note: "朝から元気です",
              },
              {
                date: "2024-12-23",
                member: "鈴木 一郎",
                mood: "とても良い",
                note: "新しいゲームが楽しかった",
              },
            ].map((log, index) => (
              <div
                key={index}
                className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {log.member.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{log.member}</p>
                      <span className="text-xs text-muted-foreground">
                        {log.date}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      気分: {log.mood}
                    </p>
                    <p className="text-sm mt-1">{log.note}</p>
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
