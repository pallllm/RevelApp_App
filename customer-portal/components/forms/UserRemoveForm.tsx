"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, AlertCircle } from "lucide-react";

interface UserRemoveFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function UserRemoveForm({ onSubmit, onCancel }: UserRemoveFormProps) {
  const [initials, setInitials] = useState("");
  const [reason, setReason] = useState("");
  const [sheetType, setSheetType] = useState<"NORMAL" | "LIGHT">("NORMAL");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ initials, reason, sheetType }); }} className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <p className="text-sm text-orange-900">フレキシブルコースの最低利用人数は3名です</p>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">セルフモニタリングシート形式</label>
        <div className="flex gap-4">
          <Checkbox id="normal" label="通常版" checked={sheetType === "NORMAL"} onChange={() => setSheetType("NORMAL")} />
          <Checkbox id="light" label="簡易版" checked={sheetType === "LIGHT"} onChange={() => setSheetType("LIGHT")} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">登録削除する利用者イニシャル <span className="text-red-500">*</span></label>
        <Input placeholder="例：T.K" value={initials} onChange={(e) => setInitials(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">登録解除理由</label>
        <Textarea placeholder="解除理由をご記入ください" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>
      <div className="flex gap-3">
        <Button type="submit"><Send className="h-4 w-4 mr-2" />申請を送信</Button>
        <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
      </div>
    </form>
  );
}
