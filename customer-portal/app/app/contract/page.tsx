"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  Users,
  Gamepad2,
  CreditCard,
  Edit,
  CheckCircle,
  ExternalLink,
  Loader2,
  BookOpen,
  Video,
} from "lucide-react";
import { getFacility, formatPlanType } from "@/lib/api/client";

type PlanType = "FOCUS" | "ENTRY" | "FLEXIBLE";

interface Game {
  id: string;
  name: string;
  level: number;
  imageUrl: string | null;
  manualUrl: string | null;
  videoUrl: string | null;
  description: string | null;
  isBackup: boolean;
}

interface Member {
  id: string;
  name: string;
  initials: string;
}

export default function ContractPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [planType, setPlanType] = useState<PlanType>("FLEXIBLE");
  const [members, setMembers] = useState<Member[]>([]);
  const [facilityName, setFacilityName] = useState<string>("");
  const [memberCount, setMemberCount] = useState<number>(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const data = await getFacility();

        // 事業所情報を設定
        setFacilityName(data.facility.name);
        setPlanType(data.facility.planType);

        // メンバー情報を設定
        const memberUsers = data.facility.members.filter((m: any) => m.role === 'MEMBER');
        setMembers(memberUsers.map((m: any) => ({
          id: m.id,
          name: m.name,
          initials: m.initials,
        })));
        setMemberCount(memberUsers.length);

        // ゲーム情報を設定
        const facilityGames = data.facility.games.map((fg: any) => ({
          id: fg.id,
          name: fg.name,
          level: fg.level,
          imageUrl: fg.imageUrl,
          manualUrl: fg.manualUrl,
          videoUrl: fg.videoUrl,
          description: fg.description,
          isBackup: fg.isBackup,
        }));
        setGames(facilityGames);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // メインゲームと予備ゲームを分離
  const allMainGames = games.filter(g => !g.isBackup);
  const allBackupGames = games.filter(g => g.isBackup);

  // プランタイプに応じてゲーム数を制限
  const getGameLimits = () => {
    switch (planType) {
      case "FLEXIBLE":
        return { main: 5, backup: 1 };
      case "ENTRY":
        return { main: 3, backup: 1 };
      case "FOCUS":
        return { main: 2, backup: 1 }; // 利用者ごと
      default:
        return { main: 5, backup: 1 };
    }
  };

  const limits = getGameLimits();
  const mainGames = allMainGames.slice(0, limits.main);
  const backupGames = allBackupGames.slice(0, limits.backup);
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ご契約情報</h1>
          <p className="text-muted-foreground">
            現在のご契約内容と変更申請を行えます
          </p>
        </div>
        <Badge variant="success" className="text-sm px-3 py-1">
          <CheckCircle className="h-3 w-3 mr-1" />
          契約中
        </Badge>
      </div>

      {/* Contract Overview */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            契約概要
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">施設名</p>
            <p className="font-semibold text-lg">{facilityName || "読み込み中..."}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">契約プラン</p>
            <p className="font-semibold text-lg">{formatPlanType(planType)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">契約開始日</p>
            <p className="font-semibold">2024年4月1日</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">次回更新日</p>
            <p className="font-semibold">2025年4月1日</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">契約利用者数</p>
            <p className="font-semibold">{memberCount}名</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">連絡先</p>
            <p className="font-semibold">sample@facility.example.com</p>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Current Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                利用者数
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.location.href = '/app/requests'}
              >
                <Edit className="h-3 w-3" />
                変更申請
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  契約利用者数
                </p>
                <p className="text-3xl font-bold">{memberCount}名</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">稼働中</p>
                  <p className="text-xl font-semibold text-green-600">{memberCount}名</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    追加可能
                  </p>
                  <p className="text-xl font-semibold text-blue-600">-</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                お支払い情報
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.location.href = '/app/requests'}
              >
                <Edit className="h-3 w-3" />
                変更申請
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  お支払い方法
                </p>
                <p className="font-semibold">銀行振込</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  月額料金（税込）
                </p>
                <p className="text-3xl font-bold">¥125,000</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">次回請求日</p>
                <p className="font-semibold">2025年1月1日</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Games - Entry/Flexible Plans */}
      {(planType === "ENTRY" || planType === "FLEXIBLE") && (
        <Card className="shadow-sm border border-gray-200 bg-blue-50/30">
          <CardHeader className="border-b bg-blue-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
                <Gamepad2 className="h-5 w-5 text-blue-500" />
                導入ゲーム
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.location.href = '/app/requests'}
              >
                <Edit className="h-3 w-3" />
                変更申請
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : (
              <>
                {/* Main Games */}
                {mainGames.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      メインゲーム（{mainGames.length}個）
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {mainGames.map((game) => (
                        <div
                          key={game.id}
                          className="p-3 border-2 border-blue-200 bg-white rounded-lg"
                        >
                          <div className="space-y-2">
                            <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-gray-100">
                              {game.imageUrl ? (
                                <Image
                                  src={game.imageUrl}
                                  alt={game.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Gamepad2 className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="font-semibold text-xs leading-tight">
                              {game.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Lv.{game.level}
                            </div>
                            <div className="flex flex-col gap-1.5 pt-1">
                              {game.manualUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-7 gap-1 border-blue-200 hover:bg-blue-50 text-xs px-2"
                                  onClick={() => window.open(game.manualUrl!, "_blank")}
                                >
                                  <BookOpen className="h-3 w-3" />
                                  マニュアル
                                </Button>
                              )}
                              {game.videoUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-7 gap-1 border-purple-200 hover:bg-purple-50 text-xs px-2"
                                  onClick={() => window.open(game.videoUrl!, "_blank")}
                                >
                                  <Video className="h-3 w-3" />
                                  動画
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Backup Games */}
                {backupGames.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      予備ゲーム（{backupGames.length}個）
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {backupGames.map((game) => (
                        <div
                          key={game.id}
                          className="p-3 border-2 border-orange-200 bg-orange-50/50 rounded-lg"
                        >
                          <div className="space-y-2">
                            <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-gray-100">
                              {game.imageUrl ? (
                                <Image
                                  src={game.imageUrl}
                                  alt={game.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Gamepad2 className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="font-semibold text-xs leading-tight">
                              {game.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Lv.{game.level}
                            </div>
                            <div className="flex flex-col gap-1.5 pt-1">
                              {game.manualUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-7 gap-1 border-blue-200 hover:bg-blue-50 text-xs px-2"
                                  onClick={() => window.open(game.manualUrl!, "_blank")}
                                >
                                  <BookOpen className="h-3 w-3" />
                                  マニュアル
                                </Button>
                              )}
                              {game.videoUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full h-7 gap-1 border-purple-200 hover:bg-purple-50 text-xs px-2"
                                  onClick={() => window.open(game.videoUrl!, "_blank")}
                                >
                                  <Video className="h-3 w-3" />
                                  動画
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Games - Focus Plan (User-specific assignments) */}
      {planType === "FOCUS" && (
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
                <Gamepad2 className="h-5 w-5 text-purple-500" />
                導入ゲーム（利用者別）
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => window.location.href = '/app/requests'}
              >
                <Edit className="h-3 w-3" />
                変更申請
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">{error}</div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                登録されている利用者がありません
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  フォーカスプランでは、各利用者に2つのゲームと1つの予備ゲームを割り当てることができます。
                </p>
                <div className="text-center py-8 text-muted-foreground">
                  利用者ごとのゲーム割り当て機能は実装予定です
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reward Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            工賃振込情報
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-1">振込先銀行</p>
              <p className="font-semibold">○○銀行 ○○支店</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">口座種別</p>
              <p className="font-semibold">普通預金</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">口座番号</p>
              <p className="font-semibold">1234567</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">口座名義</p>
              <p className="font-semibold">シャカイフクシホウジン サンプルシセツ</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              振込先変更申請
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">
                契約内容の変更について
              </p>
              <p className="text-sm text-blue-700 mt-1">
                契約内容の変更は、各項目の「変更申請」ボタンから申請できます。
                申請後、運営チームが内容を確認し、反映日をご連絡いたします。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
