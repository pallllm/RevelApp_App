"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IconTile } from "@/components/ui/icon-tile";
import { PLANS, Plan } from "@/lib/constants";
import {
  ArrowLeft,
  Building2,
  FileEdit,
  UserPlus,
  UserMinus,
  Gamepad2,
  Monitor,
  MonitorUp,
  CreditCard,
  Landmark,
  MessageSquare,
  FileText,
  Send,
  Clock,
} from "lucide-react";
import {
  PlanChangeForm,
  GameChangeForm,
  UserAddForm,
  UserRemoveForm,
  PcAddForm,
  PcChangeForm,
  PaymentChangeForm,
  WageAccountForm,
  OtherInquiryForm,
} from "@/components/forms";

// 申請タイプの定義
const REQUEST_TYPES = {
  ENTRY: [
    { id: 'plan-change', icon: FileEdit, title: 'プランを変更したい', color: 'purple' as const },
    { id: 'pc-change', icon: Monitor, title: '利用しているPCを変更したい', color: 'blue' as const },
    { id: 'payment-change', icon: CreditCard, title: '支払い方法の変更がしたい', color: 'green' as const },
    { id: 'wage-account', icon: Landmark, title: '工賃振込先口座の登録・変更・修正をしたい', color: 'orange' as const },
    { id: 'other', icon: MessageSquare, title: 'その他のお問い合わせ', color: 'cyan' as const },
  ],
  FLEX: [
    { id: 'plan-change', icon: FileEdit, title: 'プランを変更したい', color: 'purple' as const },
    { id: 'game-change', icon: Gamepad2, title: 'ゲームの種類を変更したい', color: 'purple' as const },
    { id: 'user-add', icon: UserPlus, title: '作業担当利用者の追加をしたい', color: 'blue' as const },
    { id: 'user-remove', icon: UserMinus, title: '作業担当利用者の取り消しをしたい', color: 'orange' as const },
    { id: 'pc-add', icon: MonitorUp, title: '利用するPCを追加したい', color: 'green' as const },
    { id: 'pc-change', icon: Monitor, title: '利用しているPCを変更したい', color: 'blue' as const },
    { id: 'payment-change', icon: CreditCard, title: '支払い方法の変更がしたい', color: 'green' as const },
    { id: 'wage-account', icon: Landmark, title: '工賃振込先口座の登録・変更・修正をしたい', color: 'orange' as const },
    { id: 'other', icon: MessageSquare, title: 'その他のお問い合わせ', color: 'cyan' as const },
  ],
  FOCUS: [
    { id: 'plan-change', icon: FileEdit, title: 'プランを変更したい', color: 'purple' as const },
    { id: 'game-change', icon: Gamepad2, title: 'ゲームの種類を変更したい', color: 'purple' as const },
    { id: 'user-add', icon: UserPlus, title: '作業担当利用者の追加をしたい', color: 'blue' as const },
    { id: 'user-remove', icon: UserMinus, title: '作業担当利用者の取り消しをしたい', color: 'orange' as const },
    { id: 'pc-add', icon: MonitorUp, title: '利用するPCを追加したい', color: 'green' as const },
    { id: 'pc-change', icon: Monitor, title: '利用しているPCを変更したい', color: 'blue' as const },
    { id: 'payment-change', icon: CreditCard, title: '支払い方法の変更がしたい', color: 'green' as const },
    { id: 'wage-account', icon: Landmark, title: '工賃振込先口座の登録・変更・修正をしたい', color: 'orange' as const },
    { id: 'other', icon: MessageSquare, title: 'その他のお問い合わせ', color: 'cyan' as const },
  ],
};

// 申請履歴（サンプル）
const requestHistory = [
  {
    id: 1,
    type: '利用者追加',
    date: '2024-12-20',
    status: 'approved',
    description: '新規利用者3名の追加',
  },
  {
    id: 2,
    type: 'ゲーム変更',
    date: '2024-12-15',
    status: 'pending',
    description: 'フォーカスゲームの追加',
  },
  {
    id: 3,
    type: '振込口座変更',
    date: '2024-12-10',
    status: 'approved',
    description: '工賃振込口座の変更',
  },
];

export default function RequestsPage() {
  // 本番環境ではAPIから取得
  const currentPlan: Plan = 'FLEX'; // TODO: ログイン情報から取得
  const facilityName = '社会福祉法人 サンプル施設'; // TODO: ログイン情報から取得

  const [step, setStep] = useState<'request' | 'form'>('request');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const handleRequestSelect = (requestId: string) => {
    setSelectedRequest(requestId);
    setStep('form');
  };

  const handleBack = () => {
    setStep('request');
    setSelectedRequest(null);
  };

  const resetForm = () => {
    setStep('request');
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">変更申請</h1>
          <p className="text-muted-foreground">
            契約内容の変更申請を行えます
          </p>
        </div>
        {step === 'form' && (
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        )}
      </div>

      {/* Current Plan Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">現在のプラン</p>
              <p className="text-lg font-semibold">{PLANS[currentPlan].name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">事業所名</p>
              <p className="text-lg font-semibold">{facilityName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Type Selection */}
      {step === 'request' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>申請内容を選択してください</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {REQUEST_TYPES[currentPlan].map((type) => (
                <IconTile
                  key={type.id}
                  icon={type.icon}
                  title={type.title}
                  color={type.color}
                  onClick={() => handleRequestSelect(type.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Request History */}
        <Card>
          <CardHeader>
            <CardTitle>申請履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requestHistory.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{request.type}</p>
                        {request.status === 'approved' ? (
                          <Badge variant="success">承認済み</Badge>
                        ) : (
                          <Badge variant="warning">確認中</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {request.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{request.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </>
      )}

      {/* Form */}
      {step === 'form' && selectedRequest && (
        <Card>
          <CardHeader>
            <CardTitle>
              {REQUEST_TYPES[currentPlan].find((t) => t.id === selectedRequest)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRequest === 'plan-change' && (
              <PlanChangeForm
                currentPlan={currentPlan}
                onSubmit={(data) => {
                  console.log('Plan change submitted:', data);
                  alert('プラン変更申請を送信しました');
                  resetForm();
                }}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'game-change' && (
              <GameChangeForm
                currentPlan={currentPlan}
                onSubmit={(data) => {
                  console.log('Game change submitted:', data);
                  alert('ゲーム変更申請を送信しました');
                  resetForm();
                }}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'user-add' && (
              <UserAddForm
                currentPlan={currentPlan}
                onSubmit={(data) => {
                  console.log('User add submitted:', data);
                  alert('利用者追加申請を送信しました');
                  resetForm();
                }}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'user-remove' && (
              <UserRemoveForm
                onSubmit={(data) => {
                  console.log('User remove submitted:', data);
                  alert('利用者削除申請を送信しました');
                  resetForm();
                }}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'pc-add' && (
              <PcAddForm
                onSubmit={(data) => {
                  console.log('PC add submitted:', data);
                  alert('PC追加申請を送信しました');
                  resetForm();
                }}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'pc-change' && (
              <PcChangeForm
                onSubmit={(data) => {
                  console.log('PC change submitted:', data);
                  alert('PC変更申請を送信しました');
                  resetForm();
                }}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'payment-change' && (
              <PaymentChangeForm
                onSubmit={(data) => {
                  console.log('Payment change submitted:', data);
                  alert('支払い方法変更申請を送信しました');
                  resetForm();
                }}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'wage-account' && (
              <WageAccountForm
                onSubmit={(data) => {
                  console.log('Wage account submitted:', data);
                  alert('工賃振込先口座申請を送信しました');
                  resetForm();
                }}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'other' && (
              <OtherInquiryForm
                onSubmit={(data) => {
                  console.log('Other inquiry submitted:', data);
                  alert('お問い合わせを送信しました');
                  resetForm();
                }}
                onCancel={resetForm}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">申請の処理について</p>
              <p className="text-sm text-blue-700 mt-1">
                申請は通常1-2営業日以内に確認いたします。承認後、ご希望の反映日に変更が適用されます。
                緊急の場合は、サポートページから直接ご連絡ください。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
