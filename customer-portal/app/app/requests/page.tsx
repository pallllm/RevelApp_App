"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  UserPlus,
  UserMinus,
  Gamepad2,
  Monitor,
  CreditCard,
  Landmark,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

const requestTypes = [
  {
    id: "add-member",
    icon: UserPlus,
    title: "利用者追加",
    description: "新しい利用者を追加します",
    color: "blue",
  },
  {
    id: "remove-member",
    icon: UserMinus,
    title: "利用者解除",
    description: "利用者の契約を解除します",
    color: "orange",
  },
  {
    id: "change-game",
    icon: Gamepad2,
    title: "ゲーム変更",
    description: "導入ゲームを変更します",
    color: "purple",
  },
  {
    id: "change-pc",
    icon: Monitor,
    title: "利用PC変更",
    description: "PCの変更や追加を申請します",
    color: "green",
  },
  {
    id: "change-payment",
    icon: CreditCard,
    title: "支払い方法変更",
    description: "お支払い方法を変更します",
    color: "red",
  },
  {
    id: "change-bank",
    icon: Landmark,
    title: "工賃振込口座変更",
    description: "振込先口座を変更します",
    color: "cyan",
  },
  {
    id: "other",
    icon: MessageSquare,
    title: "その他",
    description: "上記以外のお問い合わせ",
    color: "gray",
  },
];

const requestHistory = [
  {
    id: 1,
    type: "利用者追加",
    date: "2024-12-20",
    status: "approved",
    description: "新規利用者3名の追加",
  },
  {
    id: 2,
    type: "ゲーム変更",
    date: "2024-12-15",
    status: "pending",
    description: "フォーカスゲームの追加",
  },
  {
    id: 3,
    type: "振込口座変更",
    date: "2024-12-10",
    status: "approved",
    description: "工賃振込口座の変更",
  },
];

export default function RequestsPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("申請を送信しました");
    setShowForm(false);
    setSelectedType(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">変更申請</h1>
        <p className="text-muted-foreground">
          契約内容の変更申請を行えます
        </p>
      </div>

      {!showForm ? (
        <>
          {/* Request Types */}
          <Card>
            <CardHeader>
              <CardTitle>申請タイプを選択</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requestTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <div
                      className={`h-12 w-12 rounded-lg bg-${type.color}-500/10 flex items-center justify-center flex-shrink-0`}
                    >
                      <type.icon className={`h-6 w-6 text-${type.color}-600`} />
                    </div>
                    <div>
                      <p className="font-semibold">{type.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {type.description}
                      </p>
                    </div>
                  </button>
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
                          {request.status === "approved" ? (
                            <Badge variant="success">承認済み</Badge>
                          ) : request.status === "pending" ? (
                            <Badge variant="warning">確認中</Badge>
                          ) : (
                            <Badge variant="danger">却下</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {request.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {request.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {requestTypes.find((t) => t.id === selectedType)?.title}申請
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    申請者名
                  </label>
                  <Input
                    type="text"
                    placeholder="山田 太郎"
                    defaultValue="山田 太郎"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    希望反映日
                  </label>
                  <Input type="date" required />
                  <p className="text-xs text-muted-foreground mt-1">
                    ※通常、翌月1日から反映されます
                  </p>
                </div>

                {/* Type-specific fields */}
                {selectedType === "add-member" && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        追加人数
                      </label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="追加する人数を入力"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        利用者名（複数の場合は改行で区切る）
                      </label>
                      <Textarea
                        placeholder="例：&#10;田中 太郎&#10;佐藤 花子"
                        rows={4}
                        required
                      />
                    </div>
                  </>
                )}

                {selectedType === "change-game" && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        変更内容
                      </label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">選択してください</option>
                        <option value="add">ゲーム追加</option>
                        <option value="remove">ゲーム削除</option>
                        <option value="change">ゲーム入れ替え</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        対象ゲーム
                      </label>
                      <Input
                        type="text"
                        placeholder="例：フォーカス"
                        required
                      />
                    </div>
                  </>
                )}

                {selectedType === "change-bank" && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        銀行名
                      </label>
                      <Input
                        type="text"
                        placeholder="例：○○銀行"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        支店名
                      </label>
                      <Input
                        type="text"
                        placeholder="例：○○支店"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          口座種別
                        </label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          required
                        >
                          <option value="">選択</option>
                          <option value="ordinary">普通</option>
                          <option value="current">当座</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          口座番号
                        </label>
                        <Input
                          type="text"
                          placeholder="1234567"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        口座名義（カナ）
                      </label>
                      <Input
                        type="text"
                        placeholder="シャカイフクシホウジン ○○"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    詳細・備考
                  </label>
                  <Textarea
                    placeholder="申請内容の詳細や補足情報をご記入ください"
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="gap-2">
                  <Send className="h-4 w-4" />
                  申請を送信
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedType(null);
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">
                申請の処理について
              </p>
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
