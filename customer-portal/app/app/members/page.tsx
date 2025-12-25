"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  Edit,
} from "lucide-react";
import { GAMES } from "@/lib/constants";
import { getFacility, formatPlanType } from "@/lib/api/client";
import { MemberFormDialog } from "@/components/member-form-dialog";

// プランタイプの定義
type PlanType = "focus" | "entry" | "flexible";

// APIから取得したメンバーの型定義
interface Member {
  id: string;
  name: string;
  email?: string;
  initials: string;
  role: string;
  startDate: string;
}

// APIから取得したゲームの型定義
interface FacilityGame {
  id: string;
  name: string;
  level: number;
  isBackup: boolean;
  imageUrl: string | null;
  manualUrl: string | null;
  videoUrl: string | null;
}

export default function MembersPage() {
  // API data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanType>("flexible");
  const [members, setMembers] = useState<Member[]>([]);
  const [facilityGames, setFacilityGames] = useState<FacilityGame[]>([]);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const facilityData = await getFacility();

        // プランタイプを設定（簡易マッピング）
        const planTypeMap: Record<string, PlanType> = {
          'FLEXIBLE': 'flexible',
          'STANDARD': 'entry',
          'PREMIUM': 'focus',
        };
        setCurrentPlan(planTypeMap[facilityData.facility.planType] || 'flexible');

        // 利用者データを設定（MEMBERロールのみ）
        const memberUsers = facilityData.facility.members.filter(
          (m: any) => m.role === 'MEMBER'
        );
        setMembers(memberUsers);

        // ゲームデータを設定
        setFacilityGames(facilityData.facility.games || []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // データ再取得関数
  const refreshData = async () => {
    try {
      const facilityData = await getFacility();
      const memberUsers = facilityData.facility.members.filter(
        (m: any) => m.role === 'MEMBER'
      );
      setMembers(memberUsers);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  // ダイアログハンドラー
  const handleAddMember = () => {
    setSelectedMember(null);
    setIsDialogOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedMember(null);
  };

  const handleSuccess = () => {
    refreshData();
  };

  // メインゲームと予備ゲームを分離
  const facilityMainGames = facilityGames.filter(g => !g.isBackup);
  const facilityBackupGame = facilityGames.find(g => g.isBackup);

  // ローディング中の表示
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">利用者管理</h1>
          <p className="text-gray-600 mt-1">施設の利用者情報を管理できます</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">利用者管理</h1>
          <p className="text-gray-600 mt-1">施設の利用者情報を管理できます</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">データの読み込みに失敗しました</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
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
        <Button
          className="gap-2 bg-blue-600 hover:bg-blue-700"
          onClick={handleAddMember}
        >
          <UserPlus className="h-4 w-4" />
          利用者追加申請
        </Button>
      </div>

      {/* Facility Game Section (Entry/Flexible plans only) */}
      {(currentPlan === "entry" || currentPlan === "flexible") && facilityMainGames.length > 0 && (
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
                メインゲーム（{facilityMainGames.length}個）
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {facilityMainGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-3 border-2 border-blue-200 bg-white rounded-lg"
                  >
                    <div className="space-y-2">
                      <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-gray-100">
                        {game.imageUrl && (
                          <Image
                            src={game.imageUrl}
                            alt={game.name}
                            fill
                            className="object-cover"
                          />
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
                        {facilityBackupGame.imageUrl && (
                          <Image
                            src={facilityBackupGame.imageUrl}
                            alt={facilityBackupGame.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="font-semibold text-xs leading-tight">
                        {facilityBackupGame.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Lv.{facilityBackupGame.level}
                      </div>
                      <div className="flex flex-col gap-1.5 pt-1">
                        {facilityBackupGame.manualUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 gap-1 border-blue-200 hover:bg-blue-50 text-xs px-2"
                            onClick={() => window.open(facilityBackupGame.manualUrl!, "_blank")}
                          >
                            <BookOpen className="h-3 w-3" />
                            マニュアル
                          </Button>
                        )}
                        {facilityBackupGame.videoUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-7 gap-1 border-purple-200 hover:bg-purple-50 text-xs px-2"
                            onClick={() => window.open(facilityBackupGame.videoUrl!, "_blank")}
                          >
                            <Video className="h-3 w-3" />
                            動画
                          </Button>
                        )}
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
          <CardTitle className="text-gray-900 text-base">
            利用者一覧（{members.length}名）
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {members.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>登録されている利用者がいません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  {/* Left: Avatar and Info */}
                  <div className="flex items-center gap-4">
                    {/* Initials Avatar */}
                    <div className="h-14 w-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                      {member.initials}
                    </div>

                    {/* Member Info */}
                    <div className="space-y-2">
                      {/* Name */}
                      <p className="text-base font-semibold text-gray-900">
                        {member.name}
                      </p>

                      {/* Status and Dates */}
                      <div className="flex items-center gap-3">
                        <Badge variant="success">利用中</Badge>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">開始:</span>{" "}
                          {new Date(member.startDate).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-4">
                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      className="gap-2 border-blue-300 hover:bg-blue-50"
                      onClick={() => handleEditMember(member)}
                    >
                      <Edit className="h-4 w-4" />
                      編集
                    </Button>

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
          )}
        </CardContent>
      </Card>

      {/* Member Form Dialog */}
      <MemberFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        member={selectedMember}
      />
    </div>
  );
}
