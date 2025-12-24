"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  FileText,
  ExternalLink,
  BookOpen,
  Video,
  Gamepad2,
} from "lucide-react";

// プランタイプの定義
type PlanType = "focus" | "entry" | "flexible";

// TODO: 本番環境ではAPIから取得
const currentPlan: PlanType = "focus"; // "focus", "entry", "flexible"

// 施設が選択しているゲーム（エントリー・フレキシブルの場合）
const facilityGame = {
  name: "フォーカスゲーム",
  icon: "🎯",
  manualUrl: "/manuals/focus-game",
  videoUrl: "/videos/focus-game-tutorial",
};

// ゲームアイコンのマッピング
const gameIcons: { [key: string]: string } = {
  "フォーカス": "🎯",
  "メモリー": "🧠",
  "パズル": "🧩",
  "スピード": "⚡",
  "リズム": "🎵",
};

// Sample data
const members = [
  {
    id: 1,
    initials: "T.T",
    name: "田中 太郎",
    status: "active" as const,
    startDate: "2024-04-01",
    selectedGame: "フォーカス",
  },
  {
    id: 2,
    initials: "S.H",
    name: "佐藤 花子",
    status: "active" as const,
    startDate: "2024-04-01",
    selectedGame: "メモリー",
  },
  {
    id: 3,
    initials: "S.I",
    name: "鈴木 一郎",
    status: "cancelled" as const,
    startDate: "2024-05-15",
    cancellationDate: "2024-11-30",
    selectedGame: "フォーカス",
  },
  {
    id: 4,
    initials: "T.M",
    name: "高橋 美咲",
    status: "active" as const,
    startDate: "2024-06-01",
    selectedGame: "パズル",
  },
  {
    id: 5,
    initials: "W.K",
    name: "渡辺 健太",
    status: "active" as const,
    startDate: "2024-07-10",
    selectedGame: "フォーカス",
  },
];

export default function MembersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            利用者管理
          </h1>
          <p className="text-muted-foreground mt-2">
            施設の利用者情報を管理できます
          </p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <UserPlus className="h-4 w-4" />
          利用者追加申請
        </Button>
      </div>

      {/* Facility Game Section (Entry/Flexible plans only) */}
      {(currentPlan === "entry" || currentPlan === "flexible") && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Gamepad2 className="h-5 w-5 text-blue-600" />
              事業所選択ゲーム
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl shadow-lg">
                  {facilityGame.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {facilityGame.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    全利用者が使用するゲーム
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="gap-2 border-blue-300 hover:bg-blue-50"
                  onClick={() => window.open(facilityGame.manualUrl, "_blank")}
                >
                  <BookOpen className="h-4 w-4" />
                  マニュアル
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-purple-300 hover:bg-purple-50"
                  onClick={() => window.open(facilityGame.videoUrl, "_blank")}
                >
                  <Video className="h-4 w-4" />
                  プレイ動画
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="text-purple-900">利用者一覧</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                {/* Left: Avatar and Info */}
                <div className="flex items-center gap-4">
                  {/* Initials Avatar */}
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
                    {member.initials}
                  </div>

                  {/* Member Info */}
                  <div className="space-y-2">
                    {/* Name and Status */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          member.status === "active" ? "success" : "secondary"
                        }
                      >
                        {member.status === "active" ? "利用中" : "解除"}
                      </Badge>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">利用開始:</span>{" "}
                        {member.startDate}
                      </p>
                      {member.cancellationDate && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">登録解除:</span>{" "}
                          {member.cancellationDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Game Icon (Focus) and Actions */}
                <div className="flex items-center gap-4">
                  {/* Game Icon - Focus plan only */}
                  {currentPlan === "focus" && member.selectedGame && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-2xl shadow-sm">
                        {gameIcons[member.selectedGame] || "🎮"}
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {member.selectedGame}
                      </p>
                    </div>
                  )}

                  {/* Self-monitoring Sheet Button */}
                  <Button
                    variant="outline"
                    className="gap-2 border-purple-300 hover:bg-purple-50"
                    onClick={() =>
                      window.open(`/monitoring-sheet/${member.id}`, "_blank")
                    }
                  >
                    <FileText className="h-4 w-4" />
                    モニタリングシート
                    <ExternalLink className="h-3 w-3" />
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
