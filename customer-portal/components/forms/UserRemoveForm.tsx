"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import { PricingConfirmation } from "./PricingConfirmation";
import { Plan } from "@/lib/constants";

interface UserRemoveFormProps {
  currentPlan?: Plan;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

// 料金計算（削除の場合は料金が減る）
const calculateUserRemovePrice = (currentPlan: Plan, currentUsers: number, removedUsers: number) => {
  const basePrice = currentPlan === "ENTRY" ? 50000 : currentPlan === "FLEX" ? 80000 : 100000;
  const pricePerUser = currentPlan === "ENTRY" ? 5000 : currentPlan === "FLEX" ? 8000 : 10000;

  const currentPrice = basePrice + (currentUsers * pricePerUser);
  const newPrice = basePrice + ((currentUsers - removedUsers) * pricePerUser);

  return { currentPrice, newPrice };
};

// 反映日の計算
const calculateEffectiveDate = () => {
  const today = new Date();
  const day = today.getDate();

  let effectiveDate = new Date(today);

  if (day <= 15) {
    effectiveDate.setMonth(effectiveDate.getMonth() + 1);
    effectiveDate.setDate(1);
  } else {
    effectiveDate.setMonth(effectiveDate.getMonth() + 2);
    effectiveDate.setDate(1);
  }

  const year = effectiveDate.getFullYear();
  const month = String(effectiveDate.getMonth() + 1).padStart(2, '0');
  const date = String(effectiveDate.getDate()).padStart(2, '0');

  return `${year}年${month}月${date}日`;
};

// 登録済み利用者の型定義
interface RegisteredUser {
  id: string;
  initials: string;
  diagnosis?: string;
  sheetType: "NORMAL" | "LIGHT";
}

export function UserRemoveForm({ currentPlan = "FLEX", onSubmit, onCancel }: UserRemoveFormProps) {
  // 登録済み利用者リスト（仮データ - 実際はAPIから取得）
  const registeredUsers: RegisteredUser[] = [
    { id: "1", initials: "T.K", diagnosis: "ADHD", sheetType: "NORMAL" },
    { id: "2", initials: "S.M", diagnosis: "ASD", sheetType: "NORMAL" },
    { id: "3", initials: "H.Y", diagnosis: "発達障害", sheetType: "LIGHT" },
    { id: "4", initials: "K.T", diagnosis: "精神障害", sheetType: "NORMAL" },
    { id: "5", initials: "A.N", diagnosis: "ADHD、ASD", sheetType: "LIGHT" },
  ]; // TODO: APIから取得

  const [step, setStep] = useState<"input" | "confirm">("input");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [reason, setReason] = useState("");

  const selectedUser = registeredUsers.find(u => u.id === selectedUserId);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("confirm");
  };

  const handleConfirm = () => {
    onSubmit({ userId: selectedUserId, initials: selectedUser?.initials, reason });
  };

  const currentUsers = registeredUsers.length;
  const { currentPrice, newPrice } = calculateUserRemovePrice(currentPlan, currentUsers, 1);
  const effectiveDate = calculateEffectiveDate();

  if (step === "confirm") {
    return (
      <PricingConfirmation
        currentPrice={currentPrice}
        newPrice={newPrice}
        changeDescription={`利用者を1名削除します（イニシャル: ${selectedUser?.initials}）`}
        effectiveDate={effectiveDate}
        onConfirm={handleConfirm}
        onBack={() => setStep("input")}
      />
    );
  }

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-900">
            <p className="font-semibold mb-1">ご注意</p>
            <p>
              フレキシブルコースの最低利用人数は3名です。利用者の削除により、サービス利用料が変わります。
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">
          登録削除する利用者を選択 <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {registeredUsers.map((user) => (
            <label
              key={user.id}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedUserId === user.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="user"
                value={user.id}
                checked={selectedUserId === user.id}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="mt-1"
                required
              />
              <div className="flex-1">
                <div className="font-semibold">{user.initials}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {user.diagnosis && `疾患名: ${user.diagnosis}`}
                  {user.diagnosis && " / "}
                  シート: {user.sheetType === "NORMAL" ? "通常版" : "簡易版"}
                </div>
              </div>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          現在登録されている利用者: {registeredUsers.length}名
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">登録解除理由</label>
        <Textarea
          placeholder="解除理由をご記入ください"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          次へ（料金確認）
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
