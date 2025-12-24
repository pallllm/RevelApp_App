"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface OtherInquiryFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function OtherInquiryForm({ onSubmit, onCancel }: OtherInquiryFormProps) {
  const [inquiry, setInquiry] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ inquiry });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">
          質問・問い合わせ内容 <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="お問い合わせ内容を詳しくご記入ください"
          rows={8}
          value={inquiry}
          onChange={(e) => setInquiry(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="gap-2">
          <Send className="h-4 w-4" />
          送信
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
