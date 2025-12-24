"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, AlertCircle } from "lucide-react";

interface PcAddFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function PcAddForm({ onSubmit, onCancel }: PcAddFormProps) {
  const [anydeskId, setAnydeskId] = useState("");
  const [anydeskPassword, setAnydeskPassword] = useState("");
  const [pinPassword, setPinPassword] = useState("");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ anydeskId, anydeskPassword, pinPassword }); }} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold">PC追加について</p>
            <p className="mt-1">1台あたり3,000円（+税）のメンテナンス費用が発生します</p>
          </div>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">【新しいPC】AnyDesk接続先アドレス <span className="text-red-500">*</span></label>
        <Input placeholder="9〜10桁の数字（スペースなし）" value={anydeskId} onChange={(e) => setAnydeskId(e.target.value)} pattern="[0-9]{9,10}" required />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">AnyDesk接続先パスワード <span className="text-red-500">*</span></label>
        <Input type="password" value={anydeskPassword} onChange={(e) => setAnydeskPassword(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">PCのPINパスワード <span className="text-red-500">*</span></label>
        <Input placeholder="無い場合は「無し」と入力" value={pinPassword} onChange={(e) => setPinPassword(e.target.value)} required />
      </div>
      <div className="flex gap-3">
        <Button type="submit"><Send className="h-4 w-4 mr-2" />申請を送信</Button>
        <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
      </div>
    </form>
  );
}
