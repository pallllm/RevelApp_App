"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plan } from "@/lib/constants";
import { Send, AlertCircle, ArrowRight } from "lucide-react";
import { PricingConfirmation } from "./PricingConfirmation";

interface UserAddFormProps {
  currentPlan: Plan;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

// 料金計算（仮の計算ロジック - 実際はAPIから取得）
const calculateUserAddPrice = (currentPlan: Plan, currentUsers: number, addedUsers: number) => {
  const basePrice = currentPlan === "ENTRY" ? 50000 : currentPlan === "FLEX" ? 80000 : 100000;
  const pricePerUser = currentPlan === "ENTRY" ? 5000 : currentPlan === "FLEX" ? 8000 : 10000;

  const currentPrice = basePrice + (currentUsers * pricePerUser);
  const newPrice = basePrice + ((currentUsers + addedUsers) * pricePerUser);

  return { currentPrice, newPrice };
};

// 反映日の計算
const calculateEffectiveDate = () => {
  const today = new Date();
  const day = today.getDate();

  let effectiveDate = new Date(today);

  if (day <= 15) {
    // 15日以前の申請 → 翌月1日
    effectiveDate.setMonth(effectiveDate.getMonth() + 1);
    effectiveDate.setDate(1);
  } else {
    // 15日以降の申請 → 翌々月1日
    effectiveDate.setMonth(effectiveDate.getMonth() + 2);
    effectiveDate.setDate(1);
  }

  const year = effectiveDate.getFullYear();
  const month = String(effectiveDate.getMonth() + 1).padStart(2, '0');
  const date = String(effectiveDate.getDate()).padStart(2, '0');

  return `${year}年${month}月${date}日`;
};

export function UserAddForm({ currentPlan, onSubmit, onCancel }: UserAddFormProps) {
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [initials, setInitials] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [sheetType, setSheetType] = useState<"NORMAL" | "LIGHT">("NORMAL");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("confirm");
  };

  const handleConfirm = () => {
    onSubmit({
      initials,
      diagnosis,
      sheetType,
    });
  };

  // 料金計算（仮：現在3名、1名追加の場合）
  const currentUsers = 3; // TODO: APIから取得
  const { currentPrice, newPrice } = calculateUserAddPrice(currentPlan, currentUsers, 1);
  const effectiveDate = calculateEffectiveDate();

  if (step === "confirm") {
    return (
      <PricingConfirmation
        currentPrice={currentPrice}
        newPrice={newPrice}
        changeDescription={`利用者を1名追加します（イニシャル: ${initials}）`}
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
              利用者の追加により、サービス利用料が変わります。次のページで料金をご確認ください。
            </p>
          </div>
        </div>
      </div>

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
        <label className="text-sm font-medium mb-2 block">主な疾患名</label>
        <Input
          placeholder="例：ADHD、ASD など"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
      </div>

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
