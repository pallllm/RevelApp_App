"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ACCOUNT_TYPES } from "@/lib/constants";
import { Send } from "lucide-react";

interface WageAccountFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function WageAccountForm({ onSubmit, onCancel }: WageAccountFormProps) {
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountType, setAccountType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [remarks, setRemarks] = useState("");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ bankName, branchName, accountType, accountNumber, accountHolder, remarks }); }} className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">銀行名 <span className="text-red-500">*</span></label>
        <Input placeholder="例：三菱UFJ銀行" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">支店名 <span className="text-red-500">*</span></label>
        <Input placeholder="例：渋谷支店" value={branchName} onChange={(e) => setBranchName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">口座種別 <span className="text-red-500">*</span></label>
          <Select value={accountType} onChange={(e) => setAccountType(e.target.value)} required>
            <option value="">選択</option>
            {Object.entries(ACCOUNT_TYPES).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">口座番号 <span className="text-red-500">*</span></label>
          <Input placeholder="1234567" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">口座名義（カナ） <span className="text-red-500">*</span></label>
        <Input placeholder="シャカイフクシホウジン ○○" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">備考</label>
        <Textarea placeholder="補足情報があればご記入ください" rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
      </div>
      <div className="flex gap-3">
        <Button type="submit"><Send className="h-4 w-4 mr-2" />申請を送信</Button>
        <Button type="button" variant="outline" onClick={onCancel}>キャンセル</Button>
      </div>
    </form>
  );
}
