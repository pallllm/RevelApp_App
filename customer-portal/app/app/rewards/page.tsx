"use client";

import { useState, useEffect } from "react";
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
  AlertCircle,
  Loader2,
  Eye,
  ChevronRight,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getFacilityStats,
  formatWagePhase,
  getWageHistory,
  getMemberWages,
  getWageCarryover,
  getWagePreview,
  confirmWage,
  downloadWageNotice,
  downloadWageInvoice,
} from "@/lib/api/client";

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

// 工賃履歴とメンバー内訳の型定義
type WageHistoryItem = {
  id: string;
  year: number;
  month: number;
  totalAmount: number;
  memberCount: number;
  status: string;
  paymentDate: string | null;
};

type MemberWage = {
  name: string;
  initials: string | null;
  amount: number;
  playCount: number;
};

type WagePreviewMember = {
  userId: string;
  userName: string;
  totalWage: number;
  validPlayCount: number;
};

export default function RewardsPage() {
  // API data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [continuationMonths, setContinuationMonths] = useState(0);
  const [totalWages, setTotalWages] = useState(0);
  const [previousMonthWage, setPreviousMonthWage] = useState<number | null>(null);
  const [currentWagePhase, setCurrentWagePhase] = useState<{
    phase: string;
    levels: Array<{ level: number; wage: number }>;
  } | null>(null);
  const [wageHistory, setWageHistory] = useState<WageHistoryItem[]>([]);
  const [memberWages, setMemberWages] = useState<MemberWage[]>([]);
  const [carryoverAmount, setCarryoverAmount] = useState<number>(0);

  // 今月の工賃プレビュー関連
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    totalAmount: number;
    members: WagePreviewMember[];
    carryover: { previousCarryover: number; nextCarryover: number; paymentAmount: number };
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);

  // 履歴一覧モーダル関連
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [allHistory, setAllHistory] = useState<WageHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);

  // 今月の年月を取得
  const getCurrentYearMonth = () => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  };

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // 統計情報を取得
        const statsData = await getFacilityStats();
        setContinuationMonths(statsData.stats.continuationMonths);
        setTotalWages(statsData.stats.totalWages);
        setPreviousMonthWage(
          statsData.stats.previousMonthWage?.totalAmount || null
        );
        setCurrentWagePhase(formatWagePhase(statsData.stats.wagePhase));

        // 工賃履歴を取得
        const historyData = await getWageHistory();
        setWageHistory(historyData.history);
        setHasMoreHistory(historyData.hasMore);

        // 前月の利用者別工賃内訳を取得
        const now = new Date();
        const previousMonth = now.getMonth() === 0 ? 12 : now.getMonth();
        const previousYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        const memberData = await getMemberWages(previousYear, previousMonth);
        setMemberWages(memberData.members);

        // 繰越金額を取得
        const carryoverData = await getWageCarryover();
        setCarryoverAmount(carryoverData.carryover?.amount || 0);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Determine current phase
  const getCurrentPhase = () => {
    if (continuationMonths <= 3) return 0;
    if (continuationMonths <= 9) return 1;
    return 2;
  };

  const currentPhase = getCurrentPhase();

  // Merge API wage data with hardcoded phase structure
  const displayWagePhases = wagePhases.map((phase, index) => {
    if (index === currentPhase && currentWagePhase) {
      return {
        ...phase,
        phase: currentWagePhase.phase,
        levels: currentWagePhase.levels,
      };
    }
    return phase;
  });

  // 前月の年月を取得
  const getPreviousYearMonth = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1); // 前月
    return `${now.getFullYear()}年${now.getMonth() + 1}月`;
  };

  // 今月の工賃プレビューを取得
  const handleShowPreview = async () => {
    try {
      setPreviewLoading(true);
      const { year, month } = getCurrentYearMonth();
      const data = await getWagePreview(year, month);
      setPreviewData({
        totalAmount: data.result.summary.totalWage,
        members: data.result.members,
        carryover: data.result.carryover,
      });
      setShowPreview(true);
    } catch (err) {
      console.error('Failed to fetch preview:', err);
      alert(err instanceof Error ? err.message : 'プレビューの取得に失敗しました');
    } finally {
      setPreviewLoading(false);
    }
  };

  // 工賃を確定
  const handleConfirmWage = async () => {
    if (!confirm('工賃を確定しますか？確定後は変更できません。')) {
      return;
    }

    try {
      setConfirmLoading(true);
      const { year, month } = getCurrentYearMonth();
      await confirmWage(year, month);
      alert('工賃を確定しました');
      // 履歴を再取得
      const historyData = await getWageHistory();
      setWageHistory(historyData.history);
      setShowPreview(false);
    } catch (err) {
      console.error('Failed to confirm wage:', err);
      alert(err instanceof Error ? err.message : '工賃の確定に失敗しました');
    } finally {
      setConfirmLoading(false);
    }
  };

  // 報酬決定通知書をダウンロード
  const handleDownloadNotice = async (year: number, month: number) => {
    try {
      setDownloadLoading(`notice-${year}-${month}`);
      await downloadWageNotice(year, month);
    } catch (err) {
      console.error('Failed to download notice:', err);
      alert(err instanceof Error ? err.message : '報酬決定通知書のダウンロードに失敗しました');
    } finally {
      setDownloadLoading(null);
    }
  };

  // 請求書をダウンロード
  const handleDownloadInvoice = async (year: number, month: number) => {
    try {
      setDownloadLoading(`invoice-${year}-${month}`);
      await downloadWageInvoice(year, month);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      alert(err instanceof Error ? err.message : '請求書のダウンロードに失敗しました');
    } finally {
      setDownloadLoading(null);
    }
  };

  // 全履歴を表示
  const handleShowAllHistory = async () => {
    try {
      setHistoryLoading(true);
      const historyData = await getWageHistory(true);
      setAllHistory(historyData.history);
      setShowHistoryModal(true);
    } catch (err) {
      console.error('Failed to fetch all history:', err);
      alert(err instanceof Error ? err.message : '履歴の取得に失敗しました');
    } finally {
      setHistoryLoading(false);
    }
  };

  // 今月の履歴があるかチェック
  const { year: currentYear, month: currentMonth } = getCurrentYearMonth();
  const currentMonthWage = wageHistory.find(
    (w) => w.year === currentYear && w.month === currentMonth
  );

  // ローディング中の表示
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">工賃管理</h1>
          <p className="text-gray-600 mt-1">月次工賃の確認と履歴を管理できます</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">工賃管理</h1>
          <p className="text-gray-600 mt-1">月次工賃の確認と履歴を管理できます</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">データの読み込みに失敗しました</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">工賃管理</h1>
        <p className="text-gray-600 mt-1">
          月次工賃の確認と履歴を管理できます
        </p>
      </div>

      {/* 今月の工賃確認セクション */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {currentYear}年{currentMonth}月の工賃
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentMonthWage ? (
            // 既に計算済みの場合
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(currentMonthWage.totalAmount)}</p>
                  <p className="text-sm text-muted-foreground">
                    対象: {currentMonthWage.memberCount}名
                  </p>
                </div>
                <Badge
                  variant={
                    currentMonthWage.status === 'CONFIRMED'
                      ? 'warning'
                      : currentMonthWage.status === 'PAID'
                      ? 'success'
                      : 'default'
                  }
                >
                  {currentMonthWage.status === 'CONFIRMED'
                    ? '確定済み'
                    : currentMonthWage.status === 'PAID'
                    ? '支払済み'
                    : '計算中'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadNotice(currentYear, currentMonth)}
                  disabled={downloadLoading === `notice-${currentYear}-${currentMonth}`}
                >
                  {downloadLoading === `notice-${currentYear}-${currentMonth}` ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-1" />
                  )}
                  報酬決定通知書
                </Button>
                {(currentMonthWage.status === 'CONFIRMED' || currentMonthWage.status === 'PAID') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadInvoice(currentYear, currentMonth)}
                    disabled={downloadLoading === `invoice-${currentYear}-${currentMonth}`}
                  >
                    {downloadLoading === `invoice-${currentYear}-${currentMonth}` ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    請求書
                  </Button>
                )}
                {currentMonthWage.status === 'CALCULATING' && (
                  <Button
                    size="sm"
                    onClick={handleConfirmWage}
                    disabled={confirmLoading}
                  >
                    {confirmLoading ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    工賃を確定
                  </Button>
                )}
              </div>
            </div>
          ) : showPreview && previewData ? (
            // プレビュー表示中
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">今月の工賃合計</p>
                    <p className="text-2xl font-bold">{formatCurrency(previewData.totalAmount)}</p>
                  </div>
                  <Badge variant="default">プレビュー</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>前月からの繰越</span>
                    <span>{formatCurrency(previewData.carryover.previousCarryover)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>翌月への繰越</span>
                    <span>-{formatCurrency(previewData.carryover.nextCarryover)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>お支払い金額</span>
                    <span>{formatCurrency(previewData.carryover.paymentAmount)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">利用者別内訳</p>
                  <div className="space-y-2">
                    {previewData.members.map((member) => (
                      <div key={member.userId} className="flex justify-between text-sm">
                        <span>{member.userName} ({member.validPlayCount}回)</span>
                        <span>{formatCurrency(member.totalWage)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  閉じる
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmWage}
                  disabled={confirmLoading}
                >
                  {confirmLoading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  )}
                  工賃を確定
                </Button>
              </div>
            </div>
          ) : (
            // プレビュー前
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                今月の工賃はまだ計算されていません
              </p>
              <Button onClick={handleShowPreview} disabled={previewLoading}>
                {previewLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                今月の工賃を確認
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats & Wage Phase - 2 Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Stats Cards */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {getPreviousYearMonth()}分の工賃
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {previousMonthWage !== null ? formatCurrency(previousMonthWage) : 'データなし'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {previousMonthWage !== null ? '確定済み' : '前月のデータがありません'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">累計工賃</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalWages)}</div>
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
              <div className="text-2xl font-bold">{formatCurrency(carryoverAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                次月に持ち越し
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Continuation Period & Wage Phase */}
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
                  {displayWagePhases[currentPhase].phase} フェーズ
                </p>
              </div>

              {/* Phase visualization */}
              <div className="space-y-3">
                {displayWagePhases.map((phase, index) => (
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
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Reward History */}
        <Card>
          <CardHeader>
            <CardTitle>工賃履歴</CardTitle>
          </CardHeader>
          <CardContent>
            {wageHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                工賃履歴がありません
              </p>
            ) : (
              <div className="space-y-4">
                {wageHistory.map((record) => {
                  const monthLabel = `${record.year}年${record.month}月`;
                  const formattedPaymentDate = record.paymentDate
                    ? new Date(record.paymentDate).toLocaleDateString('ja-JP')
                    : '未定';
                  const isConfirmedOrPaid = record.status === 'CONFIRMED' || record.status === 'PAID';

                  return (
                    <div
                      key={record.id}
                      className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{monthLabel}</p>
                          {record.status === "CONFIRMED" ? (
                            <Badge variant="warning">確定済み</Badge>
                          ) : record.status === "PAID" ? (
                            <Badge variant="success">支払済み</Badge>
                          ) : (
                            <Badge variant="default">計算中</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          振込日: {formattedPaymentDate}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          対象: {record.memberCount}名
                        </p>
                        <p className="text-lg font-bold mt-2">
                          {formatCurrency(record.totalAmount)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs h-8"
                          onClick={() => handleDownloadNotice(record.year, record.month)}
                          disabled={downloadLoading === `notice-${record.year}-${record.month}`}
                        >
                          {downloadLoading === `notice-${record.year}-${record.month}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <FileText className="h-3 w-3" />
                          )}
                          報酬決定通知書
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs h-8"
                          onClick={() => handleDownloadInvoice(record.year, record.month)}
                          disabled={!isConfirmedOrPaid || downloadLoading === `invoice-${record.year}-${record.month}`}
                          title={!isConfirmedOrPaid ? '工賃確定後にダウンロードできます' : ''}
                        >
                          {downloadLoading === `invoice-${record.year}-${record.month}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          請求書
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {/* もっと見るボタン */}
                {hasMoreHistory && (
                  <Button
                    variant="ghost"
                    className="w-full mt-2"
                    onClick={handleShowAllHistory}
                    disabled={historyLoading}
                  >
                    {historyLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )}
                    もっと見る
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{getPreviousYearMonth()}分の利用者別内訳</CardTitle>
          </CardHeader>
          <CardContent>
            {memberWages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                利用者別の工賃データがありません
              </p>
            ) : (
              <div className="space-y-4">
                {memberWages.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                        {member.initials || member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          プレイ回数: {member.playCount}回
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Info - 確定済みの工賃がある場合のみ表示 */}
      {wageHistory.length > 0 && wageHistory[0].status === 'CONFIRMED' && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">
                  {wageHistory[0].year}年{wageHistory[0].month}月分の工賃が確定しました
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {formatCurrency(wageHistory[0].totalAmount)} が{' '}
                  {wageHistory[0].paymentDate
                    ? new Date(wageHistory[0].paymentDate).toLocaleDateString('ja-JP')
                    : '近日中'}
                  {' '}に登録口座へ振り込まれます。
                </p>
                <p className="text-xs text-green-600 mt-2">
                  振込口座は契約情報ページでご確認いただけます。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 履歴一覧モーダル */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">工賃履歴一覧</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistoryModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-medium text-sm">年月</th>
                    <th className="text-right p-3 font-medium text-sm">金額</th>
                    <th className="text-center p-3 font-medium text-sm">対象人数</th>
                    <th className="text-center p-3 font-medium text-sm">ステータス</th>
                    <th className="text-center p-3 font-medium text-sm">振込日</th>
                    <th className="text-center p-3 font-medium text-sm">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allHistory.map((record) => {
                    const isConfirmedOrPaid = record.status === 'CONFIRMED' || record.status === 'PAID';
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">
                          {record.year}年{record.month}月
                        </td>
                        <td className="p-3 text-right font-bold">
                          {formatCurrency(record.totalAmount)}
                        </td>
                        <td className="p-3 text-center text-sm text-muted-foreground">
                          {record.memberCount}名
                        </td>
                        <td className="p-3 text-center">
                          {record.status === "CONFIRMED" ? (
                            <Badge variant="warning">確定済み</Badge>
                          ) : record.status === "PAID" ? (
                            <Badge variant="success">支払済み</Badge>
                          ) : (
                            <Badge variant="default">計算中</Badge>
                          )}
                        </td>
                        <td className="p-3 text-center text-sm text-muted-foreground">
                          {record.paymentDate
                            ? new Date(record.paymentDate).toLocaleDateString('ja-JP')
                            : '-'}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleDownloadNotice(record.year, record.month)}
                              disabled={downloadLoading === `notice-${record.year}-${record.month}`}
                            >
                              {downloadLoading === `notice-${record.year}-${record.month}` ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <FileText className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleDownloadInvoice(record.year, record.month)}
                              disabled={!isConfirmedOrPaid || downloadLoading === `invoice-${record.year}-${record.month}`}
                            >
                              {downloadLoading === `invoice-${record.year}-${record.month}` ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Download className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {allHistory.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  履歴がありません
                </p>
              )}
            </div>
            <div className="p-4 border-t text-sm text-muted-foreground text-center">
              全{allHistory.length}件
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
