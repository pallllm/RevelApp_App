"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import {
  PLANS,
  GAMES,
  Plan,
} from "@/lib/constants";
import { Gamepad2, Users, Send } from "lucide-react";

interface PlanChangeFormProps {
  currentPlan: Plan;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function PlanChangeForm({
  currentPlan,
  onSubmit,
  onCancel,
}: PlanChangeFormProps) {
  const [targetPlan, setTargetPlan] = useState<Plan | null>(null);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [backupGame, setBackupGame] = useState<string>("");
  const [userCount, setUserCount] = useState<number>(3);
  const [users, setUsers] = useState<any[]>([]);

  const availablePlans = Object.entries(PLANS)
    .filter(([key]) => key !== currentPlan)
    .map(([key, value]) => ({ key: key as Plan, ...value }));

  const handleTargetPlanSelect = (plan: Plan) => {
    setTargetPlan(plan);
    setSelectedGames([]);
    setBackupGame("");
    setUsers([]);
  };

  const handleGameToggle = (gameId: string) => {
    setSelectedGames((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleUserCountChange = (count: number) => {
    setUserCount(count);
    // Initialize user data (simplified for both Focus and Flex)
    const newUsers = Array.from({ length: count }, (_, i) => ({
      id: i,
      initials: "",
      diagnosis: "",
      sheetType: "NORMAL" as const,
      selectedGames: [] as string[],
      backupGame: "",
    }));
    setUsers(newUsers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      currentPlan,
      targetPlan,
      selectedGames,
      backupGame,
      userCount,
      users,
    });
  };

  const getMaxGames = () => {
    if (targetPlan === "ENTRY") return 3;
    if (targetPlan === "FLEX") return 5;
    return 0;
  };

  const showUserInfo =
    (currentPlan === "ENTRY" && targetPlan === "FLEX") ||
    (currentPlan === "ENTRY" && targetPlan === "FOCUS") ||
    (currentPlan === "FLEX" && targetPlan === "FOCUS") ||
    (currentPlan === "FOCUS" && targetPlan === "FLEX");

  // Check if form is valid for submission
  const isFormValid = () => {
    if (!targetPlan) return false;

    // Entry/Flex plan validation
    if (targetPlan === "ENTRY" || targetPlan === "FLEX") {
      if (selectedGames.length !== getMaxGames()) return false;
      if (!backupGame) return false;
    }

    // User info validation (if required)
    if (showUserInfo && users.length > 0) {
      for (const user of users) {
        // Common fields for both Focus and Flex
        if (!user.initials || !user.sheetType) return false;

        // Focus-specific validation
        if (targetPlan === "FOCUS") {
          if (user.selectedGames.length !== 2) return false;
          if (!user.backupGame) return false;
        }
      }
    }

    return true;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Target Plan Selection */}
      <div>
        <label className="text-sm font-medium mb-3 block">
          変更先のプランを選択してください <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availablePlans.map((plan) => (
            <IconTile
              key={plan.key}
              icon={Gamepad2}
              title={plan.name}
              color={plan.key === "FLEX" ? "purple" : plan.key === "FOCUS" ? "green" : "blue"}
              selected={targetPlan === plan.key}
              onClick={() => handleTargetPlanSelect(plan.key)}
            />
          ))}
        </div>
      </div>

      {/* Game Selection (for Entry and Flex) */}
      {targetPlan && (targetPlan === "ENTRY" || targetPlan === "FLEX") && (
        <div>
          <label className="text-sm font-medium mb-3 block">
            ゲームを選択してください（{selectedGames.length}/{getMaxGames()}個）
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {GAMES.map((game) => (
              <button
                key={game.id}
                type="button"
                onClick={() => handleGameToggle(game.id)}
                disabled={
                  !selectedGames.includes(game.id) &&
                  selectedGames.length >= getMaxGames()
                }
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  selectedGames.includes(game.id)
                    ? "border-primary bg-primary/10"
                    : "border-gray-200 hover:border-gray-300"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
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
                  <div className="font-semibold text-sm">{game.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Lv.{game.level}
                    {game.requiresAnyDesk && " *"}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * 印のゲームはAnyDeskによる環境変更作業が必要です
          </p>
        </div>
      )}

      {/* Backup Game (for Entry and Flex only) */}
      {targetPlan && (targetPlan === "ENTRY" || targetPlan === "FLEX") && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            予備ゲーム（1個） <span className="text-red-500">*</span>
          </label>
          <Select
            value={backupGame}
            onChange={(e) => setBackupGame(e.target.value)}
            required
          >
            <option value="">選択してください</option>
            {GAMES.filter((g) => !selectedGames.includes(g.id)).map((game) => (
              <option key={game.id} value={game.id}>
                {game.name} (Lv.{game.level})
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* User Count (for Flex and Focus) */}
      {showUserInfo && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            利用者人数 <span className="text-red-500">*</span>
          </label>
          <Select
            value={userCount}
            onChange={(e) => handleUserCountChange(Number(e.target.value))}
            required
          >
            <option value={3}>3名</option>
            <option value={4}>4名</option>
            <option value={5}>5名</option>
            <option value={6}>6名</option>
          </Select>
        </div>
      )}

      {/* User Information */}
      {showUserInfo && users.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            利用者情報
          </div>
          {users.map((user, index) => (
            <div key={user.id} className="p-4 border rounded-lg space-y-4">
              <h4 className="font-semibold">利用者 {index + 1}</h4>

              {/* Focus plan - with game selection */}
              {targetPlan === "FOCUS" ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      イニシャル <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="例：T.K"
                      value={user.initials}
                      onChange={(e) => {
                        const newUsers = [...users];
                        newUsers[index].initials = e.target.value;
                        setUsers(newUsers);
                      }}
                      required
                    />
                  </div>

                  {/* Main Games (2 required) */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      メインゲーム（2個選択）
                      <span className="text-red-500">*</span>
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        （{user.selectedGames.length}/2個選択済み）
                      </span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {GAMES.map((game) => {
                        const isSelected = user.selectedGames.includes(game.id);
                        const isDisabled = !isSelected && user.selectedGames.length >= 2;

                        return (
                          <button
                            key={game.id}
                            type="button"
                            onClick={() => {
                              const newUsers = [...users];
                              if (isSelected) {
                                newUsers[index].selectedGames = user.selectedGames.filter(
                                  (g: string) => g !== game.id
                                );
                              } else if (user.selectedGames.length < 2) {
                                newUsers[index].selectedGames = [...user.selectedGames, game.id];
                              }
                              setUsers(newUsers);
                            }}
                            disabled={isDisabled}
                            className={`p-3 border-2 rounded-lg text-left transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10"
                                : "border-gray-200 hover:border-gray-300"
                            } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
                              <div className="font-semibold text-sm">{game.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Lv.{game.level}
                                {game.requiresAnyDesk && " *"}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Backup Game (1 required) */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      予備ゲーム（1個） <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={user.backupGame || ""}
                      onChange={(e) => {
                        const newUsers = [...users];
                        newUsers[index].backupGame = e.target.value;
                        setUsers(newUsers);
                      }}
                      required
                    >
                      <option value="">選択してください</option>
                      {GAMES.filter((g) => !user.selectedGames.includes(g.id)).map((game) => (
                        <option key={game.id} value={game.id}>
                          {game.name} (Lv.{game.level})
                        </option>
                      ))}
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      メインゲーム以外から選択してください
                    </p>
                  </div>

                  {/* Sheet Type */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      セルフモニタリングシート形式 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <Checkbox
                        id={`sheet-normal-${index}`}
                        label="通常版"
                        checked={user.sheetType === "NORMAL"}
                        onChange={() => {
                          const newUsers = [...users];
                          newUsers[index].sheetType = "NORMAL";
                          setUsers(newUsers);
                        }}
                      />
                      <Checkbox
                        id={`sheet-light-${index}`}
                        label="簡易版"
                        checked={user.sheetType === "LIGHT"}
                        onChange={() => {
                          const newUsers = [...users];
                          newUsers[index].sheetType = "LIGHT";
                          setUsers(newUsers);
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Flex plan - simplified form */
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      イニシャル <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="例：T.K"
                      value={user.initials}
                      onChange={(e) => {
                        const newUsers = [...users];
                        newUsers[index].initials = e.target.value;
                        setUsers(newUsers);
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      主な疾患名
                    </label>
                    <Input
                      placeholder="例：ADHD、ASD など"
                      value={user.diagnosis}
                      onChange={(e) => {
                        const newUsers = [...users];
                        newUsers[index].diagnosis = e.target.value;
                        setUsers(newUsers);
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      セルフモニタリングシート形式 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <Checkbox
                        id={`sheet-normal-${index}`}
                        label="通常版"
                        checked={user.sheetType === "NORMAL"}
                        onChange={() => {
                          const newUsers = [...users];
                          newUsers[index].sheetType = "NORMAL";
                          setUsers(newUsers);
                        }}
                      />
                      <Checkbox
                        id={`sheet-light-${index}`}
                        label="簡易版"
                        checked={user.sheetType === "LIGHT"}
                        onChange={() => {
                          const newUsers = [...users];
                          newUsers[index].sheetType = "LIGHT";
                          setUsers(newUsers);
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="text-sm font-medium mb-2 block">備考・補足情報</label>
        <Textarea placeholder="その他ご要望などがあればご記入ください" rows={3} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" className="gap-2" disabled={!isFormValid()}>
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
