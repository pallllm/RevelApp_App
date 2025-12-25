"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { getFacility } from "@/lib/api/client";

interface Game {
  id: string;
  name: string;
  level: number;
  imageUrl: string | null;
  manualUrl: string | null;
  description: string | null;
  isBackup: boolean;
}

export default function ContractPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    async function fetchGames() {
      try {
        setLoading(true);
        setError(null);
        const data = await getFacility();

        // facilityGamesからゲーム情報を取得
        const facilityGames = data.facility.games.map((fg: any) => ({
          id: fg.id,
          name: fg.name,
          level: fg.level,
          imageUrl: fg.imageUrl,
          manualUrl: fg.manualUrl,
          description: fg.description,
          isBackup: fg.isBackup,
        }));

        setGames(facilityGames);
      } catch (err) {
        console.error('Failed to fetch games:', err);
        setError(err instanceof Error ? err.message : 'ゲーム情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);
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
            <p className="font-semibold text-lg">社会福祉法人 サンプル施設</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">契約プラン</p>
            <p className="font-semibold text-lg">スタンダードプラン</p>
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
            <p className="text-sm text-muted-foreground mb-1">ご契約担当者</p>
            <p className="font-semibold">山田 太郎 様</p>
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
              <Button variant="outline" size="sm" className="gap-2">
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
                <p className="text-3xl font-bold">25名</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">稼働中</p>
                  <p className="text-xl font-semibold text-green-600">25名</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    追加可能
                  </p>
                  <p className="text-xl font-semibold text-blue-600">5名</p>
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
              <Button variant="outline" size="sm" className="gap-2">
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

      {/* Games */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-blue-600" />
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
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              登録されているゲームがありません
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    {game.imageUrl ? (
                      <img
                        src={game.imageUrl}
                        alt={game.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                        <Gamepad2 className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="success">有効</Badge>
                      {game.isBackup && (
                        <Badge variant="outline" className="text-xs">
                          バックアップ
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{game.name}</p>
                    <Badge variant="outline" className="text-xs">
                      Lv.{game.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {game.description || 'レベル' + game.level + 'のゲーム'}
                  </p>
                  {game.manualUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-xs h-7 px-2"
                      onClick={() => window.open(game.manualUrl!, '_blank')}
                    >
                      マニュアル
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
