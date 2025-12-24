"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Activity,
  Calendar,
} from "lucide-react";

// Sample data
const members = [
  {
    id: 1,
    name: "田中 太郎",
    status: "active",
    joinDate: "2024-04-01",
    lastSession: "2024-12-24",
    totalSessions: 45,
    favoriteGame: "フォーカス",
  },
  {
    id: 2,
    name: "佐藤 花子",
    status: "active",
    joinDate: "2024-04-01",
    lastSession: "2024-12-23",
    totalSessions: 52,
    favoriteGame: "メモリー",
  },
  {
    id: 3,
    name: "鈴木 一郎",
    status: "active",
    joinDate: "2024-05-15",
    lastSession: "2024-12-24",
    totalSessions: 38,
    favoriteGame: "フォーカス",
  },
  {
    id: 4,
    name: "高橋 美咲",
    status: "active",
    joinDate: "2024-06-01",
    lastSession: "2024-12-22",
    totalSessions: 34,
    favoriteGame: "パズル",
  },
  {
    id: 5,
    name: "渡辺 健太",
    status: "active",
    joinDate: "2024-07-10",
    lastSession: "2024-12-24",
    totalSessions: 28,
    favoriteGame: "フォーカス",
  },
];

export default function MembersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">利用者管理</h1>
          <p className="text-muted-foreground">
            施設の利用者情報を管理できます
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          利用者追加申請
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">契約中</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}名</div>
            <p className="text-xs text-muted-foreground">
              全ての利用者が稼働中
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の総セッション</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">197回</div>
            <p className="text-xs text-muted-foreground">
              1人あたり平均 39回
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均継続日数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145日</div>
            <p className="text-xs text-muted-foreground">
              サービス開始からの平均
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="利用者名で検索..."
                className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
              />
            </div>
            <Button variant="outline">フィルター</Button>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>利用者一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0 hover:bg-accent/50 -mx-4 px-4 py-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-semibold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{member.name}</p>
                      <Badge variant="success">稼働中</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-muted-foreground">
                        入所日: {member.joinDate}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        最終利用: {member.lastSession}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {member.totalSessions}回
                    </p>
                    <p className="text-xs text-muted-foreground">
                      総セッション
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{member.favoriteGame}</p>
                    <p className="text-xs text-muted-foreground">
                      よく使うゲーム
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
