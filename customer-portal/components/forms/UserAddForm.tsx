"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  GAMES,
  AGE_BANDS,
  ATTENDANCE_DAYS,
  SHEET_TYPES,
  INTRODUCTION_REASONS,
  USAGE_GOALS,
  Plan,
} from "@/lib/constants";
import { Send, AlertCircle } from "lucide-react";

interface UserAddFormProps {
  currentPlan: Plan;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function UserAddForm({ currentPlan, onSubmit, onCancel }: UserAddFormProps) {
  const [initials, setInitials] = useState("");
  const [age, setAge] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [attendanceDays, setAttendanceDays] = useState("");
  const [reasons, setReasons] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [sheetType, setSheetType] = useState<"NORMAL" | "LIGHT">("NORMAL");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [backupGame, setBackupGame] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      initials,
      age,
      diagnosis,
      attendanceDays,
      reasons,
      goals,
      sheetType,
      selectedGames: currentPlan === "FOCUS" ? selectedGames : undefined,
      backupGame: currentPlan === "FOCUS" ? backupGame : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-900">
            <p className="font-semibold mb-1">ご注意</p>
            <p>
              利用者の追加により、サービス利用料が変わる可能性があります。詳細はサポートサイトまたはチャットでご確認ください。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            追加する利用者のイニシャル <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="例：T.K"
            value={initials}
            onChange={(e) => setInitials(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">
            年齢 <span className="text-red-500">*</span>
          </label>
          <Select value={age} onChange={(e) => setAge(e.target.value)} required>
            <option value="">選択</option>
            {AGE_BANDS.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">主な疾患名</label>
        <Input
          placeholder="例：ADHD、ASD など"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          1週間の通所日数 <span className="text-red-500">*</span>
        </label>
        <Select
          value={attendanceDays}
          onChange={(e) => setAttendanceDays(e.target.value)}
          required
        >
          <option value="">選択</option>
          {ATTENDANCE_DAYS.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          導入理由（複数選択可）
        </label>
        <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
          {INTRODUCTION_REASONS.map((reason) => (
            <Checkbox
              key={reason}
              id={`reason-${reason}`}
              label={reason}
              checked={reasons.includes(reason)}
              onChange={(e) => {
                if (e.target.checked) {
                  setReasons([...reasons, reason]);
                } else {
                  setReasons(reasons.filter((r) => r !== reason));
                }
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          ご利用の目的（複数選択可）
        </label>
        <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
          {USAGE_GOALS.map((goal) => (
            <Checkbox
              key={goal}
              id={`goal-${goal}`}
              label={goal}
              checked={goals.includes(goal)}
              onChange={(e) => {
                if (e.target.checked) {
                  setGoals([...goals, goal]);
                } else {
                  setGoals(goals.filter((g) => g !== goal));
                }
              }}
            />
          ))}
        </div>
      </div>

      {currentPlan === "FOCUS" && (
        <>
          <div>
            <label className="text-sm font-medium mb-3 block">
              ゲーム選択（1〜2個） <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {GAMES.map((game) => (
                <Checkbox
                  key={game.id}
                  id={`game-${game.id}`}
                  label={`${game.name} (Lv.${game.level})`}
                  checked={selectedGames.includes(game.id)}
                  onChange={(e) => {
                    if (e.target.checked && selectedGames.length < 2) {
                      setSelectedGames([...selectedGames, game.id]);
                    } else if (!e.target.checked) {
                      setSelectedGames(selectedGames.filter((g) => g !== game.id));
                    }
                  }}
                  disabled={
                    !selectedGames.includes(game.id) && selectedGames.length >= 2
                  }
                />
              ))}
            </div>
          </div>

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
        </>
      )}

      <div>
        <label className="text-sm font-medium mb-2 block">
          セルフモニタリングシート形式 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <Checkbox
            id="sheet-normal"
            label="通常版"
            checked={sheetType === "NORMAL"}
            onChange={() => setSheetType("NORMAL")}
          />
          <Checkbox
            id="sheet-light"
            label="簡易版"
            checked={sheetType === "LIGHT"}
            onChange={() => setSheetType("LIGHT")}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="gap-2">
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
