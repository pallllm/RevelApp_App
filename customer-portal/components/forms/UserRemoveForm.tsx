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

export function UserRemoveForm({ currentPlan = "FLEX", onSubmit, onCancel }: UserRemoveFormProps) {
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [initials, setInitials] = useState("");
  const [reason, setReason] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("confirm");
  };

  const handleConfirm = () => {
    onSubmit({ initials, reason });
  };

  const currentUsers = 5; // TODO: APIから取得
  const { currentPrice, newPrice } = calculateUserRemovePrice(currentPlan, currentUsers, 1);
  const effectiveDate = calculateEffectiveDate();

  if (step === "confirm") {
    return (
      <PricingConfirmation
        currentPrice={currentPrice}
        newPrice={newPrice}
        changeDescription={`利用者を1名削除します（イニシャル: ${initials}）`}
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
        <label className="text-sm font-medium mb-2 block">
          登録削除する利用者イニシャル <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="例：T.K"
          value={initials}
          onChange={(e) => setInitials(e.target.value)}
          required
        />
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
