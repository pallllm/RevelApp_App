"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Wage phase data - soft, professional colors
const wagePhases = [
  {
    phase: "0〜3ヶ月",
    color: "from-blue-100 to-blue-200",
    textColor: "text-blue-700",
    levels: [
      { level: 1, wage: 50 },
      { level: 2, wage: 60 },
      { level: 3, wage: 70 },
      { level: 4, wage: 80 },
    ],
  },
  {
    phase: "4〜9ヶ月",
    color: "from-indigo-100 to-indigo-200",
    textColor: "text-indigo-700",
    levels: [
      { level: 1, wage: 60 },
      { level: 2, wage: 70 },
      { level: 3, wage: 80 },
      { level: 4, wage: 90 },
    ],
  },
  {
    phase: "9ヶ月以上",
    color: "from-purple-100 to-purple-200",
    textColor: "text-purple-700",
    levels: [
      { level: 1, wage: 70 },
      { level: 2, wage: 80 },
      { level: 3, wage: 90 },
      { level: 4, wage: 100 },
    ],
  },
];

const rewardHistory = [
  {
    id: 1,
    month: "2024年12月",
    amount: 78000,
    status: "confirmed",
    paymentDate: "2024-12-25",
    members: 25,
  },
  {
    id: 2,
    month: "2024年11月",
    amount: 76000,
    status: "paid",
    paymentDate: "2024-11-25",
    members: 22,
  },
  {
    id: 3,
    month: "2024年10月",
    amount: 74000,
    status: "paid",
    paymentDate: "2024-10-25",
    members: 20,
  },
  {
    id: 4,
    month: "2024年9月",
    amount: 72000,
    status: "paid",
    paymentDate: "2024-09-25",
    members: 18,
  },
];

const memberRewards = [
  { name: "田中 太郎", amount: 3600 },
  { name: "佐藤 花子", amount: 4160 },
  { name: "鈴木 一郎", amount: 3040 },
  { name: "高橋 美咲", amount: 2720 },
  { name: "渡辺 健太", amount: 2240 },
];

export default function RewardsPage() {
  const continuationMonths = 7; // 継続月数

  // Determine current phase
  const getCurrentPhase = () => {
    if (continuationMonths <= 3) return 0;
    if (continuationMonths <= 9) return 1;
    return 2;
  };

  const currentPhase = getCurrentPhase();

  // 前月の年月を取得
  const getCurrentYearMonth = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1); // 前月
    return `${now.getFullYear()}年${now.getMonth() + 1}月`;
  };

  const handleDownloadNotice = (month: string) => {
    // TODO: 報酬決定通知書のダウンロード処理
    console.log(`報酬決定通知書をダウンロード: ${month}`);
  };

  const handleDownloadInvoice = (month: string) => {
    // TODO: 請求書のダウンロード処理
    console.log(`請求書をダウンロード: ${month}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">工賃管理</h1>
        <p className="text-muted-foreground">
          月次工賃の確認と履歴を管理できます
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {getCurrentYearMonth()}分の工賃
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(78000)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              確定済み・振込予定日: 12/25
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">累計工賃</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(433000)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              サービス開始から
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">翌月への繰越金額</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(5000)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              次月に持ち越し
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Continuation Period & Wage Phase */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            継続期間と工賃フェーズ
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Current status */}
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-1">現在の継続月数</p>
              <p className="text-4xl font-bold text-primary">{continuationMonths}ヶ月</p>
              <p className="text-sm text-muted-foreground mt-2">
                {wagePhases[currentPhase].phase} フェーズ
              </p>
            </div>

            {/* Phase visualization */}
            <div className="space-y-3">
              {wagePhases.map((phase, index) => (
                <div key={index} className="relative">
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-r ${phase.color} ${
                      index === currentPhase ? "ring-2 ring-indigo-400 shadow-md" : "opacity-50"
                    } transition-all`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-semibold text-sm ${phase.textColor}`}>{phase.phase}</span>
                      {index === currentPhase && (
                        <Badge className="bg-indigo-600 text-white text-xs">現在</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {phase.levels.map((level) => (
                        <div
                          key={level.level}
                          className="bg-white rounded-lg p-2 text-center shadow-sm"
                        >
                          <div className="text-xs text-gray-500">Lv.{level.level}</div>
                          <div className={`text-sm font-bold ${phase.textColor}`}>{level.wage}円</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              ※1回プレイあたりの工賃額
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Reward History */}
        <Card>
          <CardHeader>
            <CardTitle>工賃履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rewardHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{record.month}</p>
                      {record.status === "confirmed" ? (
                        <Badge variant="warning">確定済み</Badge>
                      ) : (
                        <Badge variant="success">支払済み</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      振込日: {record.paymentDate}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      対象: {record.members}名
                    </p>
                    <p className="text-lg font-bold mt-2">
                      {formatCurrency(record.amount)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs h-8"
                      onClick={() => handleDownloadNotice(record.month)}
                    >
                      <FileText className="h-3 w-3" />
                      報酬決定通知書
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-xs h-8"
                      onClick={() => handleDownloadInvoice(record.month)}
                    >
                      <Download className="h-3 w-3" />
                      請求書
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Member Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{getCurrentYearMonth()}分の利用者別内訳</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberRewards.map((member, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(member.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Info */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">
                {getCurrentYearMonth()}分の工賃が確定しました
              </p>
              <p className="text-sm text-green-700 mt-1">
                ¥78,000 が 2024年12月25日 に登録口座へ振り込まれます。
              </p>
              <p className="text-xs text-green-600 mt-2">
                振込口座: ○○銀行 ○○支店 普通 1234567
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
