"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  ArrowLeft,
  Gamepad2,
  Users,
  Clock,
  BarChart3,
  ExternalLink,
  AlertCircle,
  Calendar,
} from "lucide-react";

interface Game {
  id: string;
  name: string;
  level: number;
  requiresAnydesk: boolean;
  imageUrl: string | null;
  manualUrl: string | null;
  videoUrl: string | null;
  description: string | null;
}

interface Statistics {
  totalPlayCount: number;
  totalPlayTime: number;
  averagePlayTime: number;
  memberCount: number;
}

interface MemberStat {
  userId: string;
  userName: string;
  userInitials: string | null;
  playCount: number;
  totalPlayTime: number;
  averagePlayTime: number;
}

interface PlayRecord {
  id: string;
  playedAt: string;
  sessionDuration: number | null;
  notes: string | null;
  user: {
    id: string;
    name: string;
    initials: string | null;
  };
}

interface GameDetail {
  game: Game;
  statistics: Statistics;
  members: MemberStat[];
  recentPlays: PlayRecord[];
}

export default function GameDetailPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = params.gameId as string;

  const [gameDetail, setGameDetail] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGameDetail() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('認証トークンが見つかりません');
        }

        const response = await fetch(`/api/games/${gameId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('ゲーム詳細の取得に失敗しました');
        }

        const data = await response.json();
        setGameDetail(data);
      } catch (err) {
        console.error('Failed to fetch game detail:', err);
        setError(err instanceof Error ? err.message : 'ゲーム詳細の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchGameDetail();
  }, [gameId]);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '---';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}時間${mins}分`;
    }
    return `${mins}分`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-green-100 text-green-800';
      case 2:
        return 'bg-blue-100 text-blue-800';
      case 3:
        return 'bg-purple-100 text-purple-800';
      case 4:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/app/games')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          ゲーム一覧に戻る
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !gameDetail) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/app/games')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          ゲーム一覧に戻る
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error || 'ゲームが見つかりません'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { game, statistics, members, recentPlays } = gameDetail;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.push('/app/games')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        ゲーム一覧に戻る
      </Button>

      {/* Game Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Game Image */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
              {game.imageUrl ? (
                <Image
                  src={game.imageUrl}
                  alt={game.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Gamepad2 className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </div>

            {/* Game Info */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{game.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getLevelColor(game.level)}>
                    レベル {game.level}
                  </Badge>
                  {game.requiresAnydesk && (
                    <Badge variant="outline">AnyDesk必要</Badge>
                  )}
                </div>
              </div>

              {game.description && (
                <p className="text-muted-foreground">{game.description}</p>
              )}

              {/* External Links */}
              {(game.manualUrl || game.videoUrl) && (
                <div className="flex gap-3">
                  {game.manualUrl && (
                    <a
                      href={game.manualUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      マニュアルを見る
                    </a>
                  )}
                  {game.videoUrl && (
                    <a
                      href={game.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      動画を見る
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{statistics.totalPlayCount}</div>
                <p className="text-xs text-muted-foreground">総プレイ回数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatDuration(statistics.totalPlayTime)}
                </div>
                <p className="text-xs text-muted-foreground">総プレイ時間</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatDuration(statistics.averagePlayTime)}
                </div>
                <p className="text-xs text-muted-foreground">平均プレイ時間</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{statistics.memberCount}</div>
                <p className="text-xs text-muted-foreground">担当利用者数</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            担当利用者
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">利用者</th>
                    <th className="text-right py-3 px-4">プレイ回数</th>
                    <th className="text-right py-3 px-4">総プレイ時間</th>
                    <th className="text-right py-3 px-4">平均プレイ時間</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.userId} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{member.userName}</div>
                          {member.userInitials && (
                            <div className="text-sm text-muted-foreground">
                              {member.userInitials}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{member.playCount}回</td>
                      <td className="text-right py-3 px-4">
                        {formatDuration(member.totalPlayTime)}
                      </td>
                      <td className="text-right py-3 px-4">
                        {formatDuration(member.averagePlayTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              このゲームを担当している利用者はいません
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Play Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            最近のプレイ記録
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPlays.length > 0 ? (
            <div className="space-y-3">
              {recentPlays.map((play) => (
                <div
                  key={play.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">{play.user.name}</span>
                      {play.user.initials && (
                        <span className="text-sm text-muted-foreground">
                          ({play.user.initials})
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(play.playedAt)}
                    </div>
                    {play.notes && (
                      <div className="text-sm mt-2 text-muted-foreground">
                        {play.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatDuration(play.sessionDuration)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              プレイ記録がありません
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
