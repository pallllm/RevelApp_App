"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, AlertCircle } from "lucide-react";

interface PcChangeFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function PcChangeForm({ onSubmit, onCancel }: PcChangeFormProps) {
  const [currentAnydeskId, setCurrentAnydeskId] = useState("");
  const [newAnydeskId, setNewAnydeskId] = useState("");
  const [anydeskPassword, setAnydeskPassword] = useState("");
  const [pinPassword, setPinPassword] = useState("");
  const [preferredDate1, setPreferredDate1] = useState("");
  const [preferredDate2, setPreferredDate2] = useState("");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ currentAnydeskId, newAnydeskId, anydeskPassword, pinPassword, preferredDate1, preferredDate2 }); }} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold">PC変更作業について</p>
            <p className="mt-1">作業希望日は翌々営業日以降で、施設営業時間外（営業終了〜翌営業開始）にリモート設定を行います</p>
          </div>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">【現在のPC】AnyDesk接続先アドレス <span className="text-red-500">*</span></label>
        <Input placeholder="9〜10桁の数字" value={currentAnydeskId} onChange={(e) => setCurrentAnydeskId(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">【新しいPC】AnyDesk接続先アドレス <span className="text-red-500">*</span></label>
        <Input placeholder="9〜10桁の数字" value={newAnydeskId} onChange={(e) => setNewAnydeskId(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">AnyDesk接続先パスワード <span className="text-red-500">*</span></label>
        <Input type="password" value={anydeskPassword} onChange={(e) => setAnydeskPassword(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">PCのPINパスワード <span className="text-red-500">*</span></label>
        <Input placeholder="無い場合は「無し」" value={pinPassword} onChange={(e) => setPinPassword(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">希望作業日程1 <span className="text-red-500">*</span></label>
          <Input type="date" value={preferredDate1} onChange={(e) => setPreferredDate1(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">希望作業日程2 <span className="text-red-500">*</span></label>
          <Input type="date" value={preferredDate2} onChange={(e) => setPreferredDate2(e.target.value)} required />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="submit"><Send className="h-4 w-4 mr-2" />申請を送信</Button>
        <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
      </div>
    </form>
  );
}
