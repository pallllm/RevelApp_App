"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PAYMENT_CHANGE_TYPES } from "@/lib/constants";
import { Send } from "lucide-react";

interface PaymentChangeFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function PaymentChangeForm({ onSubmit, onCancel }: PaymentChangeFormProps) {
  const [changeType, setChangeType] = useState("");
  const [other, setOther] = useState("");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ changeType, other }); }} className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">変更内容 <span className="text-red-500">*</span></label>
        <Select value={changeType} onChange={(e) => setChangeType(e.target.value)} required>
          <option value="">選択してください</option>
          {PAYMENT_CHANGE_TYPES.map((type) => (
            <option key={type.id} value={type.id}>{type.label}</option>
          ))}
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">その他・補足情報</label>
        <Textarea placeholder="詳細や補足情報があればご記入ください" rows={4} value={other} onChange={(e) => setOther(e.target.value)} />
        <p className="text-xs text-muted-foreground mt-1">フォーム確認後、担当者がGoogleチャットでご案内いたします</p>
      </div>
      <div className="flex gap-3">
        <Button type="submit"><Send className="h-4 w-4 mr-2" />申請を送信</Button>
        <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
      </div>
    </form>
  );
}
