"use client";

import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, AlertCircle } from "lucide-react";

interface PricingConfirmationProps {
  currentPrice: number;
  newPrice: number;
  changeDescription: string;
  effectiveDate: string;
  onConfirm: () => void;
  onBack: () => void;
}

export function PricingConfirmation({
  currentPrice,
  newPrice,
  changeDescription,
  effectiveDate,
  onConfirm,
  onBack,
}: PricingConfirmationProps) {
  const priceDifference = newPrice - currentPrice;
  const isIncrease = priceDifference > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">料金確認</p>
            <p>以下の内容で月額利用料が変更になります。ご確認の上、送信してください。</p>
          </div>
        </div>
      </div>

      {/* Change Description */}
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">変更内容</h3>
        <p className="text-sm text-muted-foreground">{changeDescription}</p>
      </div>

      {/* Pricing Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">現在の月額料金</p>
          <p className="text-2xl font-bold">¥{currentPrice.toLocaleString()}</p>
        </div>
        <div className="flex items-center justify-center">
          <div className="text-2xl font-bold text-muted-foreground">→</div>
        </div>
        <div className={`border-2 rounded-lg p-4 ${isIncrease ? 'border-orange-300 bg-orange-50' : 'border-green-300 bg-green-50'}`}>
          <p className="text-sm text-muted-foreground mb-1">変更後の月額料金</p>
          <p className="text-2xl font-bold">¥{newPrice.toLocaleString()}</p>
          <p className={`text-sm mt-1 font-medium ${isIncrease ? 'text-orange-700' : 'text-green-700'}`}>
            {isIncrease ? '+' : ''}¥{priceDifference.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Effective Date */}
      <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">変更反映日</p>
            <p className="text-lg font-bold text-purple-700 mt-1">{effectiveDate}</p>
            <p className="text-xs text-muted-foreground mt-1">
              毎月15日までの申請は、翌月1日から変更が反映されます
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button onClick={onConfirm} className="gap-2">
          <Send className="h-4 w-4" />
          この内容で申請を送信
        </Button>
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          入力内容を修正
        </Button>
      </div>
    </div>
  );
}
