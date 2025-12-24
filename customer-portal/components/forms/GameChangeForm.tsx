"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GAMES, Plan } from "@/lib/constants";
import { calculateEffectiveDate, isAfterDeadline } from "@/lib/utils";
import { Send, AlertCircle, Calendar, MessageCircle } from "lucide-react";

interface GameChangeFormProps {
  currentPlan: Plan;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function GameChangeForm({
  currentPlan,
  onSubmit,
  onCancel,
}: GameChangeFormProps) {
  // 現在契約中のゲーム（初期値：仮データ - 実際はAPIから取得）
  const activeGames = ["gesoten", "elf1", "mcheroes"]; // TODO: APIから取得

  const [userCount, setUserCount] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("");
  const [currentGames, setCurrentGames] = useState<string[]>([]);
  const [newGames, setNewGames] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");

  const handleCurrentGameToggle = (gameId: string) => {
    setCurrentGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleNewGameToggle = (gameId: string) => {
    setNewGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      userCount,
      userInitials: currentPlan === "FOCUS" ? userInitials : undefined,
      currentGames,
      newGames,
      notes,
    });
  };

  const hasAnyDeskGame = [...currentGames, ...newGames].some(
    (id) => GAMES.find((g) => g.id === id)?.requiresAnyDesk
  );

  const maxGamesPerUser = currentPlan === "FOCUS" ? 2 : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">ゲーム変更の期日について</p>
            <p>
              毎月15日までの申請は、翌月1日から変更が反映されます。
              {hasAnyDeskGame && (
                <span className="block mt-2 text-orange-700 font-medium">
                  ※選択されたゲームにはAnyDeskによる環境変更作業が必要です
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* User Count */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          作業利用者人数 <span className="text-red-500">*</span>
        </label>
        <Input
          type="number"
          min="1"
          placeholder="例：5"
          value={userCount}
          onChange={(e) => setUserCount(e.target.value)}
          required
        />
      </div>

      {/* User Initials (Focus only) */}
      {currentPlan === "FOCUS" && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            ゲーム変更対象の利用者イニシャル <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="例：T.K"
            value={userInitials}
            onChange={(e) => setUserInitials(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            フォーカスコースでは利用者ごとにゲームを管理します
          </p>
        </div>
      )}

      {/* Current Games to End */}
      <div>
        <label className="text-sm font-medium mb-3 block">
          現在プレイしている中で終了するゲーム（複数選択可）
          <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {GAMES.map((game) => {
            const isActive = activeGames.includes(game.id);
            const isSelectedToRemove = currentGames.includes(game.id);

            return (
              <div
                key={game.id}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelectedToRemove
                    ? "border-red-500 bg-red-50"
                    : isActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 opacity-40"
                }`}
                onClick={() => isActive && handleCurrentGameToggle(game.id)}
              >
                <div className="space-y-2">
                  <div className="relative w-full aspect-video rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      className="object-cover"
                    />
                    {isActive && !isSelectedToRemove && (
                      <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                        契約中
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{game.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Lv.{game.level}
                        {game.requiresAnyDesk && " *"}
                      </div>
                    </div>
                    {isSelectedToRemove && (
                      <div className="ml-2">
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Games to Add */}
      <div>
        <label className="text-sm font-medium mb-3 block">
          新しく追加するゲーム（複数選択可）
          <span className="text-red-500">*</span>
          {maxGamesPerUser && (
            <span className="text-xs text-muted-foreground ml-2">
              （フォーカスコースは1利用者につき最大{maxGamesPerUser}個）
            </span>
          )}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {GAMES.map((game) => (
            <div
              key={game.id}
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                newGames.includes(game.id)
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              } ${
                maxGamesPerUser &&
                !newGames.includes(game.id) &&
                newGames.length >= maxGamesPerUser
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={() => {
                if (
                  !maxGamesPerUser ||
                  newGames.includes(game.id) ||
                  newGames.length < maxGamesPerUser
                ) {
                  handleNewGameToggle(game.id);
                }
              }}
            >
              <div className="space-y-2">
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-gray-100">
                  <Image
                    src={game.image}
                    alt={game.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{game.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Lv.{game.level}
                      {game.requiresAnyDesk && " *"}
                    </div>
                  </div>
                  {newGames.includes(game.id) && (
                    <div className="ml-2">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          * 印のゲームはAnyDeskによる環境変更作業が必要です
        </p>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium mb-2 block">備考・補足情報</label>
        <Textarea
          placeholder="ゲーム変更の理由や補足情報があればご記入ください"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Effective Date */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">変更反映日</p>
            <p className="text-lg font-bold text-purple-700 mt-1">
              {calculateEffectiveDate()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              毎月15日までの申請は、翌月1日から変更が反映されます
            </p>
          </div>
        </div>
      </div>

      {/* Chat Support Notice (if after deadline) */}
      {isAfterDeadline() && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex gap-3">
            <MessageCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-900">
              <p className="font-semibold mb-1">急ぎの変更をご希望の場合</p>
              <p>
                期限を過ぎていますが、急ぎで変更したい場合はサポートページのチャットからご連絡ください。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="gap-2"
          disabled={currentGames.length === 0 && newGames.length === 0}
        >
          <Send className="h-4 w-4" />
          申請を送信
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
