"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, AlertCircle } from "lucide-react";

interface OtherInquiryFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function OtherInquiryForm({ onSubmit, onCancel }: OtherInquiryFormProps) {
  const [inquiry, setInquiry] = useState("");
  const [anydeskIds, setAnydeskIds] = useState("");
  const [pinPassword, setPinPassword] = useState("");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ inquiry, anydeskIds, pinPassword }); }} className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">質問・問い合わせ内容 <span className="text-red-500">*</span></label>
        <Textarea placeholder="お問い合わせ内容を詳しくご記入ください" rows={5} value={inquiry} onChange={(e) => setInquiry(e.target.value)} required />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">環境変更が必要なゲーム変更の場合</p>
            <p>以下の情報もご記入ください。リモート環境変更作業は毎月25日〜の定期メンテに合わせて実施します。</p>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">対象PCのAnyDesk接続先アドレス</label>
        <Textarea placeholder="複数台の場合は改行で区切ってください" rows={3} value={anydeskIds} onChange={(e) => setAnydeskIds(e.target.value)} />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">PCのPINパスワード</label>
        <Input placeholder="無い場合は「無し」" value={pinPassword} onChange={(e) => setPinPassword(e.target.value)} />
      </div>
      <div className="flex gap-3">
        <Button type="submit"><Send className="h-4 w-4 mr-2" />送信</Button>
        <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
      </div>
    </form>
  );
}
