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
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

// Sample data
const monthlyRewards = [
  { month: "7月", amount: 65000 },
  { month: "8月", amount: 68000 },
  { month: "9月", amount: 72000 },
  { month: "10月", amount: 74000 },
  { month: "11月", amount: 76000 },
  { month: "12月", amount: 78000 },
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
  { name: "田中 太郎", sessions: 45, amount: 3600 },
  { name: "佐藤 花子", sessions: 52, amount: 4160 },
  { name: "鈴木 一郎", sessions: 38, amount: 3040 },
  { name: "高橋 美咲", sessions: 34, amount: 2720 },
  { name: "渡辺 健太", sessions: 28, amount: 2240 },
];

export default function RewardsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">工賃管理</h1>
          <p className="text-muted-foreground">
            月次工賃の確認と履歴を管理できます
          </p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          明細をダウンロード
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月の工賃</CardTitle>
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
            <CardTitle className="text-sm font-medium">1名あたり平均</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(3120)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              今月の平均工賃
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            月次工賃推移
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRewards}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="amount" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
                  className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                >
                  <div>
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
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {formatCurrency(record.amount)}
                    </p>
                    <Button variant="ghost" size="sm" className="mt-1">
                      詳細
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
            <CardTitle>今月の利用者別内訳</CardTitle>
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
                      <p className="text-sm text-muted-foreground">
                        {member.sessions}セッション
                      </p>
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
                12月分の工賃が確定しました
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
