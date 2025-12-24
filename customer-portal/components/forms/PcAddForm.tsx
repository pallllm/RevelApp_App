"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";
import { PricingConfirmation } from "./PricingConfirmation";
import { Plan } from "@/lib/constants";

interface PcAddFormProps {
  currentPlan?: Plan;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

// 料金計算（PC追加の場合は1台あたり3,000円追加）
const calculatePcAddPrice = (currentPcs: number, addedPcs: number, currentPrice: number) => {
  const pricePerPc = 3000;
  const newPrice = currentPrice + (addedPcs * pricePerPc);

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

export function PcAddForm({ currentPlan = "FLEX", onSubmit, onCancel }: PcAddFormProps) {
  const [step, setStep] = useState<"input" | "confirm">("input");
  const [anydeskId, setAnydeskId] = useState("");
  const [anydeskPassword, setAnydeskPassword] = useState("");
  const [pinPassword, setPinPassword] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("confirm");
  };

  const handleConfirm = () => {
    onSubmit({ anydeskId, anydeskPassword, pinPassword });
  };

  const currentPcs = 2; // TODO: APIから取得
  const basePrice = 83000; // TODO: APIから取得
  const { currentPrice, newPrice } = calculatePcAddPrice(currentPcs, 1, basePrice);
  const effectiveDate = calculateEffectiveDate();

  if (step === "confirm") {
    return (
      <PricingConfirmation
        currentPrice={currentPrice}
        newPrice={newPrice}
        changeDescription={`PCを1台追加します（AnyDesk ID: ${anydeskId}）`}
        effectiveDate={effectiveDate}
        onConfirm={handleConfirm}
        onBack={() => setStep("input")}
      />
    );
  }

  return (
    <form onSubmit={handleNext} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">PC追加について</p>
            <p>
              1台あたり3,000円（+税）のメンテナンス費用が発生します。次のページで料金をご確認ください。
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          【新しいPC】AnyDesk接続先アドレス <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="9〜10桁の数字（スペースなし）"
          value={anydeskId}
          onChange={(e) => setAnydeskId(e.target.value)}
          pattern="[0-9]{9,10}"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          AnyDesk接続先パスワード <span className="text-red-500">*</span>
        </label>
        <Input
          type="password"
          value={anydeskPassword}
          onChange={(e) => setAnydeskPassword(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          PCのPINパスワード <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="無い場合は「無し」と入力"
          value={pinPassword}
          onChange={(e) => setPinPassword(e.target.value)}
          required
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
