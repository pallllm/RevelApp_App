"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileEdit,
  Calendar as CalendarIcon,
  TrendingUp,
  Bell,
  AlertCircle,
  Wrench,
} from "lucide-react";
import {
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
  { month: "7月", sessions: 240 },
  { month: "8月", sessions: 310 },
  { month: "9月", sessions: 380 },
  { month: "10月", sessions: 420 },
  { month: "11月", sessions: 465 },
  { month: "12月", sessions: 520 },
];

// Announcements data
const announcements = [
  {
    id: 1,
    type: "important" as const,
    title: "変更申請の締切が近づいています（12/15まで）",
    date: "2024-12-10",
  },
  {
    id: 2,
    type: "maintenance" as const,
    title: "月末メンテナンスのお知らせ（12/31 2:00-4:00）",
    date: "2024-12-08",
  },
  {
    id: 3,
    type: "info" as const,
    title: "新しいゲームコンテンツが追加されました",
    date: "2024-12-05",
  },
  {
    id: 4,
    type: "info" as const,
    title: "工賃振込処理が完了しました",
    date: "2024-12-01",
  },
];

// Important dates
const importantDates = [
  { date: "2024-12-15", title: "変更申請締切", type: "deadline" as const },
  { date: "2024-12-25", title: "請求確定日", type: "billing" as const },
  { date: "2024-12-31", title: "月末メンテナンス", type: "maintenance" as const },
];

export default function HomePage() {
  // TODO: 本番環境ではAPIから取得
  const currentPlan = "RevelAppコース A-フレキシブル";
  const userCount = 25;
  const nextDeadline = "2024年12月15日";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ホーム</h1>
        <p className="text-muted-foreground">
          施設の運営状況を一目で確認できます
        </p>
      </div>

      {/* Announcements Area (Horizontal Scroll) */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-5 w-5 text-purple-600" />
          <h2 className="font-semibold">お知らせ</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className="min-w-[350px] hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {announcement.type === "important" && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {announcement.type === "maintenance" && (
                      <Wrench className="h-5 w-5 text-orange-500" />
                    )}
                    {announcement.type === "info" && (
                      <Bell className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          announcement.type === "important"
                            ? "destructive"
                            : announcement.type === "maintenance"
                            ? "warning"
                            : "default"
                        }
                      >
                        {announcement.type === "important" && "重要"}
                        {announcement.type === "maintenance" && "メンテ"}
                        {announcement.type === "info" && "お知らせ"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {announcement.date}
                      </span>
                    </div>
                    <p className="text-sm font-medium line-clamp-2">
                      {announcement.title}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary Cards (3 Cards) */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Left: User Count */}
        <StatCard
          title="利用者登録数"
          value={userCount}
          icon={Users}
          description="現在稼働中の利用者"
          color="purple"
        />

        {/* Center: Current Plan */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <FileEdit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">契約プラン</p>
                  <p className="text-lg font-bold">{currentPlan}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Next Action */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">次回アクション</p>
                <p className="text-lg font-bold text-orange-900">
                  変更申請締切
                </p>
              </div>
            </div>
            <p className="text-sm text-orange-700 mt-2">
              {nextDeadline}まで
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Information Area (2 Columns) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left: Monthly Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              月別利用状況
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
            <p className="text-xs text-muted-foreground mt-2">
              総セッション数の推移（過去6ヶ月）
            </p>
          </CardContent>
        </Card>

        {/* Right: Important Dates Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
              重要な日程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {importantDates.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`h-12 w-12 rounded-lg flex flex-col items-center justify-center text-white ${
                        item.type === "deadline"
                          ? "bg-gradient-to-br from-red-500 to-orange-500"
                          : item.type === "billing"
                          ? "bg-gradient-to-br from-green-500 to-emerald-500"
                          : "bg-gradient-to-br from-blue-500 to-purple-500"
                      }`}
                    >
                      <span className="text-xs">
                        {new Date(item.date).getMonth() + 1}月
                      </span>
                      <span className="text-lg font-bold">
                        {new Date(item.date).getDate()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.type === "deadline"
                        ? "destructive"
                        : item.type === "billing"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {item.type === "deadline" && "締切"}
                    {item.type === "billing" && "請求"}
                    {item.type === "maintenance" && "メンテ"}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              クリックで詳細を確認できます
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expansion Free Space (Future Features) */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">今後の機能追加エリア</p>
            <p className="text-xs mt-1">
              利用上限アラート・未対応タスク・最近の変更申請などを表示予定
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
