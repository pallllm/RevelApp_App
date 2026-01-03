"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Gamepad2, AlertCircle, ExternalLink } from "lucide-react";

interface Game {
  id: string;
  name: string;
  level: number;
  requiresAnydesk: boolean;
  imageUrl: string | null;
  manualUrl: string | null;
  videoUrl: string | null;
  description: string | null;
  isBackup: boolean;
}

export default function GamesPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<number | null>(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('認証トークンが見つかりません');
        }

        const response = await fetch('/api/games', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('ゲーム一覧の取得に失敗しました');
        }

        const data = await response.json();
        setGames(data.games);
      } catch (err) {
        console.error('Failed to fetch games:', err);
        setError(err instanceof Error ? err.message : 'ゲーム一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  // レベルでフィルタリング
  const filteredGames = levelFilter
    ? games.filter((game) => game.level === levelFilter)
    : games;

  // レベルごとにゲームをグループ化
  const gamesByLevel = filteredGames.reduce((acc, game) => {
    if (!acc[game.level]) {
      acc[game.level] = [];
    }
    acc[game.level].push(game);
    return acc;
  }, {} as Record<number, Game[]>);

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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">ゲーム管理</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">ゲーム管理</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
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
          <h1 className="text-3xl font-bold tracking-tight">ゲーム管理</h1>
          <p className="text-muted-foreground">
            利用中のゲーム一覧とプレイ記録
          </p>
        </div>
      </div>

      {/* Level Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">レベルで絞り込み:</span>
            <Button
              variant={levelFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setLevelFilter(null)}
            >
              全て
            </Button>
            {[1, 2, 3, 4].map((level) => (
              <Button
                key={level}
                variant={levelFilter === level ? "default" : "outline"}
                size="sm"
                onClick={() => setLevelFilter(level)}
              >
                レベル {level}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Games Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{games.length}</div>
            <p className="text-xs text-muted-foreground">利用中のゲーム</p>
          </CardContent>
        </Card>
        {[1, 2, 3, 4].map((level) => (
          <Card key={level}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {games.filter((g) => g.level === level).length}
              </div>
              <p className="text-xs text-muted-foreground">レベル {level}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Games by Level */}
      {Object.keys(gamesByLevel)
        .sort((a, b) => Number(a) - Number(b))
        .map((level) => (
          <div key={level}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                レベル {level}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gamesByLevel[Number(level)].map((game) => (
                <Card
                  key={game.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/app/games/${game.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Game Image */}
                      <div className="relative w-full aspect-video rounded-md overflow-hidden bg-gray-100">
                        {game.imageUrl ? (
                          <Image
                            src={game.imageUrl}
                            alt={game.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Gamepad2 className="h-12 w-12 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Game Info */}
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {game.name}
                        </h3>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getLevelColor(game.level)}>
                          Lv.{game.level}
                        </Badge>
                        {game.requiresAnydesk && (
                          <Badge variant="outline" className="text-xs">
                            AnyDesk
                          </Badge>
                        )}
                        {game.isBackup && (
                          <Badge variant="secondary" className="text-xs">
                            予備
                          </Badge>
                        )}
                      </div>

                      {/* External Links */}
                      {(game.manualUrl || game.videoUrl) && (
                        <div className="flex gap-2 pt-2 border-t">
                          {game.manualUrl && (
                            <a
                              href={game.manualUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              マニュアル
                            </a>
                          )}
                          {game.videoUrl && (
                            <a
                              href={game.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              動画
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

      {/* Empty State */}
      {filteredGames.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Gamepad2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {levelFilter
                  ? `レベル ${levelFilter} のゲームはありません`
                  : 'ゲームが登録されていません'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
