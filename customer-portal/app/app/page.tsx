"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileEdit,
  Calendar as CalendarIcon,
  Bell,
  AlertCircle,
  Wrench,
  ChevronDown,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

// Announcements data
const announcements = [
  {
    id: 1,
    type: "important" as const,
    title: "変更申請の締切が近づいています",
    date: "2024-12-10",
    content: "12月15日までに変更申請を提出してください。期限を過ぎると翌々月からの反映となります。",
  },
  {
    id: 2,
    type: "maintenance" as const,
    title: "月末メンテナンスのお知らせ",
    date: "2024-12-08",
    content: "12月31日 2:00-4:00の間、システムメンテナンスを実施いたします。この間はサービスをご利用いただけません。",
  },
  {
    id: 3,
    type: "info" as const,
    title: "新しいゲームコンテンツが追加されました",
    date: "2024-12-05",
    content: "レベル3の新ゲーム「メモリーチャレンジ」が追加されました。ぜひお試しください。",
  },
  {
    id: 4,
    type: "info" as const,
    title: "工賃振込処理が完了しました",
    date: "2024-12-01",
    content: "11月分の工賃振込が完了しました。ご確認ください。",
  },
];

// Important dates for calendar
const importantDates = [
  { date: 15, title: "変更申請締切", type: "deadline" as const },
  { date: 25, title: "請求確定日", type: "billing" as const },
  { date: 31, title: "月末メンテナンス", type: "maintenance" as const },
];

// Wage phase data - soft, professional colors
const wagePhases = [
  {
    phase: "0〜3ヶ月",
    color: "from-blue-100 to-blue-200",
    textColor: "text-blue-700",
    levels: [
      { level: 1, wage: 50 },
      { level: 2, wage: 60 },
      { level: 3, wage: 70 },
      { level: 4, wage: 80 },
    ],
  },
  {
    phase: "4〜9ヶ月",
    color: "from-indigo-100 to-indigo-200",
    textColor: "text-indigo-700",
    levels: [
      { level: 1, wage: 60 },
      { level: 2, wage: 70 },
      { level: 3, wage: 80 },
      { level: 4, wage: 90 },
    ],
  },
  {
    phase: "9ヶ月以上",
    color: "from-purple-100 to-purple-200",
    textColor: "text-purple-700",
    levels: [
      { level: 1, wage: 70 },
      { level: 2, wage: 80 },
      { level: 3, wage: 90 },
      { level: 4, wage: 100 },
    ],
  },
];

export default function HomePage() {
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMonth, setSelectedMonth] = useState<number>(12);

  // TODO: 本番環境ではAPIから取得
  const currentPlan = "RevelAppコース A-フレキシブル";
  const userCount = 25;
  const nextDeadline = "2024年12月15日";
  const continuationMonths = 7; // 継続月数

  // Determine current phase
  const getCurrentPhase = () => {
    if (continuationMonths <= 3) return 0;
    if (continuationMonths <= 9) return 1;
    return 2;
  };

  const currentPhase = getCurrentPhase();

  // Calendar navigation
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

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = selectedYear;
    const month = selectedMonth - 1; // JS months are 0-indexed
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === selectedYear && today.getMonth() + 1 === selectedMonth;

  const getDateInfo = (day: number | null) => {
    if (!day) return null;
    return importantDates.find(d => d.date === day);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          ホーム
        </h1>
        <p className="text-muted-foreground mt-2">
          施設の運営状況を一目で確認できます
        </p>
      </div>

      {/* Announcements Block */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Bell className="h-5 w-5 text-purple-600" />
            お知らせ
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            {announcements.map((announcement) => (
              <div key={announcement.id}>
                <button
                  onClick={() => setExpandedAnnouncement(
                    expandedAnnouncement === announcement.id ? null : announcement.id
                  )}
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <div className="flex-shrink-0">
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
                      <p className="text-sm font-medium">{announcement.title}</p>
                    </div>
                  </div>
                  {expandedAnnouncement === announcement.id ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {expandedAnnouncement === announcement.id && (
                  <div className="ml-11 mr-3 mt-2 mb-3 p-3 bg-gray-50 rounded-lg text-sm text-muted-foreground">
                    {announcement.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
        <Card className="shadow-lg border-0">
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
        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50">
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
        {/* Left: Continuation Period & Wage Phase */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              継続期間と工賃フェーズ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Current status */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-1">現在の継続月数</p>
                <p className="text-4xl font-bold text-primary">{continuationMonths}ヶ月</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {wagePhases[currentPhase].phase} フェーズ
                </p>
              </div>

              {/* Phase visualization */}
              <div className="space-y-3">
                {wagePhases.map((phase, index) => (
                  <div key={index} className="relative">
                    <div
                      className={`p-4 rounded-xl bg-gradient-to-r ${phase.color} ${
                        index === currentPhase ? "ring-2 ring-indigo-400 shadow-md" : "opacity-50"
                      } transition-all`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`font-semibold text-sm ${phase.textColor}`}>{phase.phase}</span>
                        {index === currentPhase && (
                          <Badge className="bg-indigo-600 text-white text-xs">現在</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {phase.levels.map((level) => (
                          <div
                            key={level.level}
                            className="bg-white rounded-lg p-2 text-center shadow-sm"
                          >
                            <div className="text-xs text-gray-500">Lv.{level.level}</div>
                            <div className={`text-sm font-bold ${phase.textColor}`}>{level.wage}円</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                ※1回プレイあたりの工賃額
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right: Calendar */}
        <Card className="shadow-lg border-0">
          <CardContent className="pt-6">
            {/* Month/Year header */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedYear}年{selectedMonth}月
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePreviousMonth}
                  className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-purple-100 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-3 mb-4">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <div
                  key={i}
                  className="text-center text-xs font-medium text-gray-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-3 mb-8">
              {calendarDays.map((day, index) => {
                const dateInfo = day ? getDateInfo(day) : null;
                const isTodayDate = isCurrentMonth && day === today.getDate();

                return (
                  <div
                    key={index}
                    className="aspect-square flex items-center justify-center"
                  >
                    {day && (
                      <button
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                          isTodayDate
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
                            : dateInfo
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

            {/* Scheduled section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-800">Scheduled</h4>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {importantDates.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        item.type === "deadline"
                          ? "bg-gradient-to-r from-pink-400 to-pink-500"
                          : item.type === "billing"
                          ? "bg-gradient-to-r from-purple-400 to-purple-500"
                          : "bg-gradient-to-r from-blue-400 to-blue-500"
                      }`}
                    >
                      {item.type === "deadline" && "締切"}
                      {item.type === "billing" && "請求"}
                      {item.type === "maintenance" && "メンテ"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 mb-0.5">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedMonth}月{item.date}日
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expansion Free Space (Future Features) */}
      <Card className="border-dashed border-2 border-purple-200 bg-white/50 shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm font-medium">今後の機能追加エリア</p>
            <p className="text-xs mt-1">
              利用上限アラート・未対応タスク・最近の変更申請などを表示予定
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
