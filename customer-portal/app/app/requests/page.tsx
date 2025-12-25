"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  CheckCircle,
  XCircle,
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

// 申請タイプの日本語表示
const REQUEST_TYPE_LABELS: Record<string, string> = {
  member_add: "利用者追加",
  member_edit: "利用者情報変更",
  member_delete: "利用者削除",
  facility_info: "事業所情報変更",
  plan_change: "プラン変更",
  game_change: "ゲーム変更",
  user_add: "利用者追加",
  user_remove: "利用者削除",
  pc_add: "PC追加",
  pc_change: "PC変更",
  payment_change: "支払い方法変更",
  wage_account: "工賃振込口座変更",
  other: "その他のお問い合わせ",
};

// ステータスのマッピング
const STATUS_CONFIG = {
  PENDING: { label: "確認中", variant: "warning" as const, icon: Clock },
  APPROVED: { label: "承認済み", variant: "success" as const, icon: CheckCircle },
  REJECTED: { label: "却下", variant: "destructive" as const, icon: XCircle },
};

interface ChangeRequest {
  id: string;
  requestType: string;
  status: string;
  requestData: any;
  notes: string | null;
  submittedAt: string;
  processedAt: string | null;
}

export default function RequestsPage() {
  // 本番環境ではAPIから取得
  const currentPlan: Plan = 'FLEX'; // TODO: ログイン情報から取得
  const facilityName = '社会福祉法人 サンプル施設'; // TODO: ログイン情報から取得

  const [step, setStep] = useState<'request' | 'form'>('request');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  // 申請履歴のstate
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<ChangeRequest[]>([]);

  // 申請履歴を取得
  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/change-requests');

        if (!response.ok) {
          throw new Error('申請一覧の取得に失敗しました');
        }

        const data = await response.json();
        setRequests(data.changeRequests);
      } catch (err) {
        console.error('Failed to fetch requests:', err);
        setError(err instanceof Error ? err.message : '申請一覧の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

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

  // 申請を送信する共通関数
  const submitRequest = async (requestType: string, requestData: any, notes?: string) => {
    try {
      const response = await fetch('/api/change-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType,
          requestData,
          notes: notes || `${REQUEST_TYPE_LABELS[requestType] || requestType}の申請`,
        }),
      });

      if (!response.ok) {
        throw new Error('申請の送信に失敗しました');
      }

      // 成功したら申請履歴を再取得
      const data = await fetch('/api/change-requests').then(r => r.json());
      setRequests(data.changeRequests);

      alert('申請を送信しました。承認をお待ちください。');
      resetForm();
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('申請の送信に失敗しました。もう一度お試しください。');
    }
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 text-red-700 py-4">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">申請履歴がありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => {
                  const statusConfig = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG];
                  const StatusIcon = statusConfig?.icon || Clock;

                  return (
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
                            <p className="font-semibold">
                              {REQUEST_TYPE_LABELS[request.requestType] || request.requestType}
                            </p>
                            <Badge variant={statusConfig?.variant || "warning"}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig?.label || request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.notes || (
                              request.requestType === 'member_add' ? `新規利用者: ${request.requestData.name}` :
                              request.requestType === 'member_edit' ? `利用者情報変更: ${request.requestData.name}` :
                              '詳細を確認してください'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.submittedAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                onSubmit={(data) => submitRequest('plan_change', data)}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'game-change' && (
              <GameChangeForm
                currentPlan={currentPlan}
                onSubmit={(data) => submitRequest('game_change', data)}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'user-add' && (
              <UserAddForm
                currentPlan={currentPlan}
                onSubmit={(data) => submitRequest('user_add', data)}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'user-remove' && (
              <UserRemoveForm
                onSubmit={(data) => submitRequest('user_remove', data)}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'pc-add' && (
              <PcAddForm
                onSubmit={(data) => submitRequest('pc_add', data)}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'pc-change' && (
              <PcChangeForm
                onSubmit={(data) => submitRequest('pc_change', data)}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'payment-change' && (
              <PaymentChangeForm
                onSubmit={(data) => submitRequest('payment_change', data)}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'wage-account' && (
              <WageAccountForm
                onSubmit={(data) => submitRequest('wage_account', data)}
                onCancel={resetForm}
              />
            )}
            {selectedRequest === 'other' && (
              <OtherInquiryForm
                onSubmit={(data) => submitRequest('other', data)}
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
