"use client";

import Image from "next/image";
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
import { GAMES } from "@/lib/constants";

// プランタイプの定義
type PlanType = "focus" | "entry" | "flexible";

// TODO: 本番環境ではAPIから取得
const currentPlan: PlanType = "flexible"; // "focus", "entry", "flexible"

// 施設が選択しているゲーム（エントリー・フレキシブルの場合）
// TODO: 本番環境ではAPIから取得
// Flexibleの場合: 5ゲーム + 予備1ゲーム
// Entryの場合: 3ゲーム + 予備1ゲーム
const facilitySelectedGameIds = ["gesoten", "elf1", "mcheroes", "axie-tri", "elf2"]; // 5 games for Flexible
const facilityBackupGameId = "cryptospells"; // 1 backup game
const facilitySelectedGames = facilitySelectedGameIds
  .map((id) => GAMES.find((g) => g.id === id))
  .filter(Boolean);
const facilityBackupGame = GAMES.find((g) => g.id === facilityBackupGameId);

// Sample data
const members = [
  {
    id: 1,
    initials: "T.T",
    name: "田中 太郎",
    status: "active" as const,
    startDate: "2024-04-01",
    selectedGameIds: ["gesoten", "elf1"], // Focus plan: 2 games
  },
  {
    id: 2,
    initials: "S.H",
    name: "佐藤 花子",
    status: "active" as const,
    startDate: "2024-04-01",
    selectedGameIds: ["mcheroes", "axie-tri"],
  },
  {
    id: 3,
    initials: "S.I",
    name: "鈴木 一郎",
    status: "cancelled" as const,
    startDate: "2024-05-15",
    cancellationDate: "2024-11-30",
    selectedGameIds: ["elf2", "cryptospells"],
  },
  {
    id: 4,
    initials: "T.M",
    name: "高橋 美咲",
    status: "active" as const,
    startDate: "2024-06-01",
    selectedGameIds: ["axie-quest", "career"],
  },
  {
    id: 5,
    initials: "W.K",
    name: "渡辺 健太",
    status: "active" as const,
    startDate: "2024-07-10",
    selectedGameIds: ["axie-origin", "xeno"],
  },
];

export default function MembersPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            利用者管理
          </h1>
          <p className="text-gray-600 mt-1">
            施設の利用者情報を管理できます
          </p>
        </div>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4" />
          利用者追加申請
        </Button>
      </div>

      {/* Facility Game Section (Entry/Flexible plans only) */}
      {(currentPlan === "entry" || currentPlan === "flexible") && (
        <Card className="shadow-sm border border-gray-200 bg-blue-50/30">
          <CardHeader className="border-b bg-blue-50/50">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
              <Gamepad2 className="h-5 w-5 text-blue-500" />
              事業所選択ゲーム
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Main Games */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                メインゲーム（{facilitySelectedGames.length}個）
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {facilitySelectedGames.map((game) => (
                  <div
                    key={game!.id}
                    className="p-3 border-2 border-blue-200 bg-white rounded-lg"
                  >
                    <div className="space-y-2">
                      <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={game!.image}
                          alt={game!.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="font-semibold text-xs leading-tight">
                        {game!.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Lv.{game!.level}
                        {game!.requiresAnyDesk && " *"}
                      </div>
                      <div className="flex flex-col gap-1.5 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 gap-1 border-blue-200 hover:bg-blue-50 text-xs px-2"
                          onClick={() => window.open(`/manuals/${game!.id}`, "_blank")}
                        >
                          <BookOpen className="h-3 w-3" />
                          マニュアル
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 gap-1 border-purple-200 hover:bg-purple-50 text-xs px-2"
                          onClick={() => window.open(`/videos/${game!.id}`, "_blank")}
                        >
                          <Video className="h-3 w-3" />
                          動画
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Backup Game */}
            {facilityBackupGame && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  予備ゲーム（1個）
                </h3>
                <div className="w-full md:w-1/3 lg:w-1/5">
                  <div className="p-3 border-2 border-orange-200 bg-orange-50/50 rounded-lg">
                    <div className="space-y-2">
                      <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={facilityBackupGame.image}
                          alt={facilityBackupGame.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="font-semibold text-xs leading-tight">
                        {facilityBackupGame.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Lv.{facilityBackupGame.level}
                      </div>
                      <div className="flex flex-col gap-1.5 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 gap-1 border-blue-200 hover:bg-blue-50 text-xs px-2"
                          onClick={() => window.open(`/manuals/${facilityBackupGame.id}`, "_blank")}
                        >
                          <BookOpen className="h-3 w-3" />
                          マニュアル
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 gap-1 border-purple-200 hover:bg-purple-50 text-xs px-2"
                          onClick={() => window.open(`/videos/${facilityBackupGame.id}`, "_blank")}
                        >
                          <Video className="h-3 w-3" />
                          動画
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="border-b bg-blue-50/50">
          <CardTitle className="text-gray-900 text-base">利用者一覧</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {members.map((member) => {
              const memberGames = member.selectedGameIds
                .map((id) => GAMES.find((g) => g.id === id))
                .filter(Boolean);

              return (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 ${
                    member.status === "cancelled" ? "opacity-50" : ""
                  }`}
                >
                  {/* Left: Avatar and Info */}
                  <div className="flex items-center gap-4">
                    {/* Initials Avatar */}
                    <div className="h-14 w-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">
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

                  {/* Right: Game Icons (Focus) and Actions */}
                  <div className="flex items-center gap-4">
                    {/* Game Icons - Focus plan only */}
                    {currentPlan === "focus" && memberGames.length > 0 && (
                      <div className="flex gap-2">
                        {memberGames.map((game) => (
                          <div
                            key={game!.id}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className="relative w-20 h-14 rounded-lg overflow-hidden shadow-sm bg-gray-100 border border-gray-200">
                              <Image
                                src={game!.image}
                                alt={game!.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <p className="text-xs text-gray-500 font-medium max-w-[80px] truncate">
                              {game!.name}
                            </p>
                          </div>
                        ))}
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
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
