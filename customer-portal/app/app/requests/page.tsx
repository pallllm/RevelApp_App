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
  const [step, setStep] = useState<'facility' | 'plan' | 'request' | 'form'>('facility');
  const [facilityName, setFacilityName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const handleFacilitySubmit = () => {
    if (facilityName.trim()) {
      setStep('plan');
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setStep('request');
  };

  const handleRequestSelect = (requestId: string) => {
    setSelectedRequest(requestId);
    setStep('form');
  };

  const handleBack = () => {
    if (step === 'plan') {
      setStep('facility');
      setSelectedPlan(null);
    } else if (step === 'request') {
      setStep('plan');
      setSelectedRequest(null);
    } else if (step === 'form') {
      setStep('request');
    }
  };

  const resetForm = () => {
    setStep('facility');
    setFacilityName('');
    setSelectedPlan(null);
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
        {step !== 'facility' && (
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {[
              { id: 'facility', label: '事業所情報' },
              { id: 'plan', label: 'プラン選択' },
              { id: 'request', label: '申請内容' },
              { id: 'form', label: '詳細入力' },
            ].map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step === s.id
                        ? 'bg-primary text-white'
                        : ['facility', 'plan', 'request'].indexOf(step) >
                          ['facility', 'plan', 'request'].indexOf(s.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-1 text-center">{s.label}</span>
                </div>
                {index < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      ['facility', 'plan', 'request'].indexOf(step) > index
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Facility Name */}
      {step === 'facility' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                事業所情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  事業所名 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="例：社会福祉法人 サンプル施設"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  required
                />
              </div>
              <Button onClick={handleFacilitySubmit} className="gap-2">
                次へ進む
                <Send className="h-4 w-4" />
              </Button>
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

      {/* Step 2: Plan Selection */}
      {step === 'plan' && (
        <Card>
          <CardHeader>
            <CardTitle>現在契約しているプランを選択してください</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <IconTile
                icon={FileEdit}
                title={PLANS.ENTRY.name}
                description="シンプルなエントリープラン"
                color="blue"
                onClick={() => handlePlanSelect('ENTRY')}
              />
              <IconTile
                icon={Gamepad2}
                title={PLANS.FLEX.name}
                description="柔軟なゲーム選択が可能"
                color="purple"
                onClick={() => handlePlanSelect('FLEX')}
              />
              <IconTile
                icon={UserPlus}
                title={PLANS.FOCUS.name}
                description="利用者ごとにカスタマイズ"
                color="green"
                onClick={() => handlePlanSelect('FOCUS')}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Request Type Selection */}
      {step === 'request' && selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle>申請内容を選択してください</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              現在のプラン: <Badge>{PLANS[selectedPlan].name}</Badge>
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {REQUEST_TYPES[selectedPlan].map((type) => (
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
      )}

      {/* Step 4: Form (Placeholder for now) */}
      {step === 'form' && selectedRequest && (
        <Card>
          <CardHeader>
            <CardTitle>
              {REQUEST_TYPES[selectedPlan!].find((t) => t.id === selectedRequest)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                フォームの詳細実装は次のステップで行います
              </p>
              <Button onClick={resetForm}>最初から入力し直す</Button>
            </div>
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
