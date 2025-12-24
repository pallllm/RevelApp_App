"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Activity,
  DollarSign,
  Calendar,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Sample data
const monthlyData = [
  { month: "7月", users: 12, sessions: 240 },
  { month: "8月", users: 15, sessions: 310 },
  { month: "9月", users: 18, sessions: 380 },
  { month: "10月", users: 20, sessions: 420 },
  { month: "11月", users: 22, sessions: 465 },
  { month: "12月", users: 25, sessions: 520 },
];

const recentActivities = [
  {
    id: 1,
    user: "田中 太郎",
    action: "ゲームセッション完了",
    time: "2時間前",
    game: "フォーカス",
  },
  {
    id: 2,
    user: "佐藤 花子",
    action: "体調記録を登録",
    time: "3時間前",
    game: null,
  },
  {
    id: 3,
    user: "鈴木 一郎",
    action: "ゲームセッション完了",
    time: "5時間前",
    game: "メモリー",
  },
  {
    id: 4,
    user: "高橋 美咲",
    action: "ゲームセッション完了",
    time: "昨日",
    game: "フォーカス",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ホーム</h1>
        <p className="text-muted-foreground">
          施設の利用状況と統計情報をご確認いただけます
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="今月の利用者数"
          value={25}
          icon={Users}
          description="契約中の利用者"
          color="purple"
        />
        <StatCard
          title="累計セッション数"
          value={520}
          icon={Activity}
          description="今月の利用回数"
          color="blue"
        />
        <StatCard
          title="今月の工賃"
          value="¥78,000"
          icon={DollarSign}
          description="確定工賃"
          color="green"
        />
        <StatCard
          title="継続利用日数"
          value={145}
          icon={Calendar}
          description="サービス開始から"
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              月別利用者推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: "#8b5cf6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              月別セッション数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            最近のアクティビティ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                    {activity.user.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{activity.user}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.action}
                      {activity.game && (
                        <span className="ml-1 text-primary">
                          ({activity.game})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
