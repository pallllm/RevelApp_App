"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  Line,
  Bar,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Download,
  AlertCircle,
  FileText,
  CheckCircle,
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  Activity,
} from "lucide-react";
import { getFacility, getHealthRecords, getGameStats, downloadHealthReport } from "@/lib/api/client";

// 除外するゲーム名（ゲームではないもの）
const EXCLUDED_GAME_NAMES = [
  "出来た事/達成した事",
  "難しかった事",
  "本日の通所",
  "できたこと",
  "達成したこと",
];

// 型定義
type DailyHealthData = {
  day: number;
  fatigue: number | null;
  sleepHours: number | null;
  temperature: number | null;
  weather: string | null;
  hasPressureChange: boolean;
};

type GameStat = {
  gameId: string;
  gameName: string;
  gameLevel: number;
  gameImageUrl: string | null;
  playCount: number;
};

type FacilityGame = {
  id: string;
  name: string;
  level: number;
  isBackup: boolean;
  imageUrl: string | null;
};

type HealthRecord = {
  date: string;
  fatigueLevel: number | null;
  sleepHours: number | null;
  mood: string | null;
  emotions: string | null;
  emotionContext: string | null;  // 感情の理由
  workReport: string | null;       // 業務報告
  weather: string | null;
  temperature: number | null;
  hasPressureChange: boolean;
};

type GameReflection = {
  date: string;
  gamesPlayed: string[];
  achievedTasks: string | null;
  difficultTasks: string | null;
};

// 天気アイコンを取得
const getWeatherIcon = (weather: string | null, small = false) => {
  if (!weather) return null;
  const size = small ? "h-3 w-3" : "h-4 w-4";
  switch (weather) {
    case "sunny":
      return <Sun className={`${size} text-yellow-500`} />;
    case "cloudy":
      return <Cloud className={`${size} text-gray-400`} />;
    case "rainy":
      return <CloudRain className={`${size} text-blue-500`} />;
    case "snow":
      return <CloudSnow className={`${size} text-blue-300`} />;
    default:
      return null;
  }
};

// カスタムドット（天気・気圧表示）
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!payload || payload.temperature === null) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
      {payload.weather && (
        <foreignObject x={cx - 8} y={cy - 24} width={16} height={16}>
          <div className="flex items-center justify-center">
            {getWeatherIcon(payload.weather, true)}
          </div>
        </foreignObject>
      )}
      {payload.hasPressureChange && (
        <foreignObject x={cx - 6} y={cy + 8} width={12} height={12}>
          <div className="flex items-center justify-center">
            <Activity className="h-3 w-3 text-red-500" />
          </div>
        </foreignObject>
      )}
    </g>
  );
};

// 気分の日本語マッピング
const MOOD_LABELS: Record<string, string> = {
  "絶好調": "絶好調",
  "好調": "好調",
  "普通": "普通",
  "不調": "不調",
  "絶不調": "絶不調",
};

// 気分の色
const MOOD_COLORS: Record<string, string> = {
  "絶好調": "#22c55e",
  "好調": "#84cc16",
  "普通": "#eab308",
  "不調": "#f97316",
  "絶不調": "#ef4444",
};

// 感情の色（よく使われる感情用）
const EMOTION_COLORS: Record<string, string> = {
  "落ち着き": "#22c55e",
  "嬉しい": "#84cc16",
  "楽しい": "#a3e635",
  "悲しみ": "#3b82f6",
  "不安": "#f97316",
  "怒り": "#ef4444",
  "イライラ": "#dc2626",
  "緊張": "#8b5cf6",
  "疲労": "#6b7280",
};

// APIから取得したユーザーの型定義
interface User {
  id: string;
  name: string;
  initials: string;
  role: string;
}

// メダルの種類を取得
const getMedalType = (playCount: number): 'gold' | 'silver' | 'bronze' | 'none' => {
  if (playCount >= 100) return 'gold';
  if (playCount >= 50) return 'silver';
  if (playCount >= 10) return 'bronze';
  return 'none';
};

// メダルの色設定
const MEDAL_STYLES = {
  gold: {
    border: 'border-yellow-400',
    bg: 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500',
    shadow: 'shadow-yellow-300/50',
    ring: 'ring-yellow-300',
  },
  silver: {
    border: 'border-gray-300',
    bg: 'bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400',
    shadow: 'shadow-gray-300/50',
    ring: 'ring-gray-300',
  },
  bronze: {
    border: 'border-orange-400',
    bg: 'bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500',
    shadow: 'shadow-orange-300/50',
    ring: 'ring-orange-300',
  },
  none: {
    border: 'border-transparent',
    bg: '',
    shadow: '',
    ring: '',
  },
};

// ゲームアイコンコンポーネント（メダル装飾付き）
const GameIcon = ({
  game,
  playCount,
  isActive
}: {
  game: FacilityGame;
  playCount: number;
  isActive: boolean;
}) => {
  const medalType = getMedalType(playCount);
  const medalStyle = MEDAL_STYLES[medalType];

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* メダル装飾（10回以上の場合） */}
        {medalType !== 'none' && isActive && (
          <div className={`absolute -inset-1.5 rounded-full ${medalStyle.bg} opacity-80`} />
        )}

        {/* ゲームアイコン */}
        <div
          className={`relative w-12 h-12 rounded-full overflow-hidden border-3
            ${isActive ? 'border-white shadow-lg' : 'border-gray-300'}
            ${!isActive && 'grayscale opacity-50'}
            ${medalType !== 'none' && isActive ? `ring-2 ${medalStyle.ring}` : ''}
          `}
        >
          {game.imageUrl ? (
            <Image
              src={game.imageUrl}
              alt={game.name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-white font-bold text-sm
              ${isActive
                ? 'bg-gradient-to-br from-[#2d5a3d] to-[#4a7c5c]'
                : 'bg-gray-400'
              }`}
            >
              {game.name.charAt(0)}
            </div>
          )}
        </div>

        {/* プレイ回数バッジ */}
        {isActive && (
          <div className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full
            flex items-center justify-center text-[10px] font-bold text-white
            ${medalType === 'gold' ? 'bg-yellow-500' :
              medalType === 'silver' ? 'bg-gray-400' :
              medalType === 'bronze' ? 'bg-orange-500' :
              'bg-[#2d5a3d]'}`}
          >
            {playCount}
          </div>
        )}
      </div>

      {/* ゲーム名 */}
      <p className={`text-[9px] font-medium mt-1.5 text-center w-14 truncate
        ${isActive ? 'text-gray-700' : 'text-gray-400'}`}
      >
        {game.name}
      </p>

      {/* レベル表示 */}
      <p className={`text-[8px] ${isActive ? 'text-gray-500' : 'text-gray-300'}`}>
        Lv.{game.level}
      </p>
    </div>
  );
};


export default function HealthGraphPage() {
  const printRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [facilityGames, setFacilityGames] = useState<FacilityGame[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const [dailyHealthData, setDailyHealthData] = useState<DailyHealthData[]>([]);
  const [gameStats, setGameStats] = useState<GameStat[]>([]);
  const [cumulativeGameStats, setCumulativeGameStats] = useState<GameStat[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [gameReflections, setGameReflections] = useState<GameReflection[]>([]);

  // Fetch users and facility games from API
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);

        const facilityData = await getFacility();

        const memberUsers = facilityData.facility.members.filter(
          (m: any) => m.role === 'MEMBER'
        );
        setUsers(memberUsers);

        // 施設のゲーム一覧を保存（除外対象を除く）
        const games = facilityData.facility.games.filter(
          (g: FacilityGame) => !EXCLUDED_GAME_NAMES.some(name =>
            g.name.includes(name) || name.includes(g.name)
          )
        );
        setFacilityGames(games);

        if (memberUsers.length > 0 && !selectedUserId) {
          setSelectedUserId(memberUsers[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  // Fetch health data when user/year/month changes
  const isFirstLoad = useRef(true);
  useEffect(() => {
    if (!selectedUserId) return;

    async function fetchHealthData() {
      try {
        setLoading(true);
        setError(null);

        const healthData = await getHealthRecords(selectedUserId, selectedYear, selectedMonth);
        const gameData = await getGameStats(selectedUserId, selectedYear, selectedMonth);

        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        const dailyData: DailyHealthData[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const record = healthData.records.find(r => r.date === dateStr);

          dailyData.push({
            day,
            fatigue: record?.fatigueLevel ? Math.round(record.fatigueLevel * 100) : null,
            sleepHours: record?.sleepHours || null,
            temperature: record?.temperature || null,
            weather: record?.weather || null,
            hasPressureChange: record?.hasPressureChange || false,
          });
        }

        setDailyHealthData(dailyData);

        // ゲーム統計から除外対象を除く
        const filteredGameStats = gameData.gameStats.filter(
          (g: GameStat) => !EXCLUDED_GAME_NAMES.some(name =>
            g.gameName.includes(name) || name.includes(g.gameName)
          )
        );
        setGameStats(filteredGameStats);

        // 累計ゲーム統計から除外対象を除く
        const filteredCumulativeStats = (gameData.cumulativeGameStats || []).filter(
          (g: GameStat) => !EXCLUDED_GAME_NAMES.some(name =>
            g.gameName.includes(name) || name.includes(g.gameName)
          )
        );
        setCumulativeGameStats(filteredCumulativeStats);

        setHealthRecords(healthData.records);
        setGameReflections(healthData.gameReflections || []);

        // 初回以外は通知を表示
        if (!isFirstLoad.current) {
          const userName = users.find(u => u.id === selectedUserId)?.name || '';
          setNotification(`${userName}さんの${selectedYear}年${selectedMonth}月のデータを表示中`);
          setTimeout(() => setNotification(null), 3000);
        }
        isFirstLoad.current = false;
      } catch (err) {
        console.error('Failed to fetch health data:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchHealthData();
  }, [selectedUserId, selectedYear, selectedMonth, users]);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  // 気分の分布データを集計
  const moodDistribution = healthRecords.reduce((acc, record) => {
    if (record.mood) {
      acc[record.mood] = (acc[record.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const moodPieData = Object.entries(moodDistribution).map(([mood, count]) => ({
    name: MOOD_LABELS[mood] || mood,
    value: count,
    fill: MOOD_COLORS[mood] || "#9ca3af",
  }));

  // 感情の分布データを集計
  const emotionDistribution = healthRecords.reduce((acc, record) => {
    if (record.emotions) {
      acc[record.emotions] = (acc[record.emotions] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const emotionPieData = Object.entries(emotionDistribution).map(([emotion, count]) => ({
    name: emotion,
    value: count,
    fill: EMOTION_COLORS[emotion] || "#9ca3af",
  }));

  // 複合グラフ用データ
  const chartData = dailyHealthData
    .filter(d => d.fatigue !== null || d.sleepHours !== null || d.temperature !== null)
    .map(d => ({
      day: `${d.day}`,
      fatigue: d.fatigue,
      sleep: d.sleepHours,
      temperature: d.temperature,
      weather: d.weather,
      hasPressureChange: d.hasPressureChange,
    }));

  // 施設のゲームと累計プレイ統計をマージ（メダル用は累計）
  const gamesWithStats = facilityGames.map(game => {
    const stat = cumulativeGameStats.find(s =>
      s.gameName.toLowerCase().includes(game.name.toLowerCase()) ||
      game.name.toLowerCase().includes(s.gameName.toLowerCase())
    );
    return {
      ...game,
      playCount: stat?.playCount || 0,
    };
  });

  // ローディング中
  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f1eb] p-6">
        <div className="max-w-[210mm] mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5a3d]"></div>
          </div>
        </div>
      </div>
    );
  }

  // エラー時
  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f1eb] p-6">
        <div className="max-w-[210mm] mx-auto">
          <Card className="border-red-200 bg-red-50 rounded-2xl">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1eb] p-6">
      {/* 変更通知トースト（画面中央） */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-[#2d5a3d] text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in zoom-in-95 fade-in duration-300 pointer-events-auto">
            <CheckCircle className="h-5 w-5" />
            <span className="text-base font-medium">{notification}</span>
          </div>
        </div>
      )}
      {/* コントロールパネル */}
      <div className="max-w-[210mm] mx-auto mb-4 flex justify-between items-center print:hidden">
        <div className="flex gap-4 items-center">
          <Select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-48 bg-white border-[#d4cfc7] rounded-xl"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
          <div className="flex gap-2">
            <Select
              value={selectedYear.toString()}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-24 bg-white border-[#d4cfc7] rounded-xl"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year.toString()}>
                  {year}年
                </option>
              ))}
            </Select>
            <Select
              value={selectedMonth.toString()}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-20 bg-white border-[#d4cfc7] rounded-xl"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month.toString()}>
                  {month}月
                </option>
              ))}
            </Select>
          </div>
        </div>
        <Button
          onClick={async () => {
            if (!selectedUserId || !selectedUser) return;
            setDownloading(true);
            try {
              await downloadHealthReport(selectedUserId, selectedUser.name, selectedYear, selectedMonth);
              setNotification('PDFをダウンロードしました');
              setTimeout(() => setNotification(null), 3000);
            } catch (err) {
              console.error('PDF download failed:', err);
              setNotification('PDFのダウンロードに失敗しました');
              setTimeout(() => setNotification(null), 3000);
            } finally {
              setDownloading(false);
            }
          }}
          disabled={downloading || !selectedUserId}
          className="bg-[#2d5a3d] hover:bg-[#234a31] text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
        >
          {downloading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Download className="h-4 w-4" />
          )}
          {downloading ? 'ダウンロード中...' : 'PDF出力'}
        </Button>
      </div>

      {/* A4印刷用コンテンツ */}
      <div
        ref={printRef}
        className="max-w-[210mm] mx-auto bg-[#faf8f5] rounded-3xl shadow-sm p-6 print:shadow-none print:rounded-none print:p-4"
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">体調・行動レポート</h1>
            <p className="text-sm text-gray-500">
              {selectedYear}年{selectedMonth}月 • {selectedUser?.name || ''}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#2d5a3d] text-white px-3 py-1.5 rounded-xl">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-medium">月次レポート</span>
          </div>
        </div>

        {/* プレイしたゲーム（メダル付きアイコン） */}
        <Card className="bg-white rounded-2xl border-[#e8e4df] shadow-sm mb-4 print:rounded-lg print:shadow-none">
          <CardHeader className="pb-1 pt-3 px-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xs font-semibold text-gray-700">ゲームプレイ状況（累計）</CardTitle>
              <div className="flex items-center gap-2 text-[9px] text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500" />
                  100回+
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-200 to-gray-400" />
                  50回+
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-300 to-orange-500" />
                  10回+
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2 px-4 pb-4">
            <div className="flex flex-wrap gap-4 justify-center">
              {gamesWithStats.length === 0 ? (
                <p className="text-xs text-gray-400">ゲームが登録されていません</p>
              ) : (
                gamesWithStats.map((game) => (
                  <GameIcon
                    key={game.id}
                    game={game}
                    playCount={game.playCount}
                    isActive={game.playCount > 0}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 気分・感情の円グラフ */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 気分の円グラフ */}
          <Card className="bg-white rounded-2xl border-[#e8e4df] shadow-sm print:rounded-lg print:shadow-none">
            <CardHeader className="pb-0 pt-3 px-3">
              <CardTitle className="text-xs font-semibold text-gray-700">気分の分布</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-2 pb-2">
              {moodPieData.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">データなし</p>
              ) : (
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie
                      data={moodPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={35}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent, cx, cy, midAngle, outerRadius }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 20;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            fontSize={8}
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                          >
                            {`${name} ${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      labelLine={true}
                    >
                      {moodPieData.map((entry, index) => (
                        <Cell key={`mood-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}日`, '日数']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* 感情の円グラフ */}
          <Card className="bg-white rounded-2xl border-[#e8e4df] shadow-sm print:rounded-lg print:shadow-none">
            <CardHeader className="pb-0 pt-3 px-3">
              <CardTitle className="text-xs font-semibold text-gray-700">感情の分布</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-2 pb-2">
              {emotionPieData.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">データなし</p>
              ) : (
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie
                      data={emotionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={35}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent, cx, cy, midAngle, outerRadius }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 20;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            fontSize={8}
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                          >
                            {`${name} ${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      labelLine={true}
                    >
                      {emotionPieData.map((entry, index) => (
                        <Cell key={`emotion-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}日`, '日数']} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 複合グラフ */}
        <Card className="bg-white rounded-2xl border-[#e8e4df] shadow-sm mb-4 print:rounded-lg print:shadow-none">
          <CardHeader className="pb-1 pt-3 px-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xs font-semibold text-gray-700 flex items-center gap-2">
                疲労度・睡眠・気温の推移
                <span className="text-[10px] font-normal text-gray-400 flex items-center gap-1">
                  (<Activity className="h-3 w-3 text-red-500" /> = 気圧変化)
                </span>
              </CardTitle>
              <Badge className="bg-[#f5f1eb] text-gray-600 text-[10px]">
                {selectedMonth}月
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-2 px-2">
            {chartData.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">グラフ表示データがありません</p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8e4df" vertical={false} />
                  <XAxis
                    dataKey="day"
                    fontSize={7}
                    tickLine={false}
                    axisLine={{ stroke: '#e8e4df' }}
                    interval={0}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis
                    yAxisId="left"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    label={{ value: '疲労(%)/睡眠(h)', angle: -90, position: 'insideLeft', fontSize: 8, fill: '#9ca3af' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 40]}
                    label={{ value: '気温(℃)', angle: 90, position: 'insideRight', fontSize: 8, fill: '#9ca3af' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#faf8f5',
                      border: '1px solid #e8e4df',
                      borderRadius: '8px',
                      fontSize: '10px'
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === 'fatigue') return [`${value}%`, '疲労度'];
                      if (name === 'sleep') return [`${value}h`, '睡眠'];
                      if (name === 'temperature') return [`${value}℃`, '気温'];
                      return [value, name];
                    }}
                  />
                  <Legend
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px' }}
                    formatter={(value) => {
                      if (value === 'fatigue') return '疲労度';
                      if (value === 'sleep') return '睡眠';
                      if (value === 'temperature') return '気温';
                      return value;
                    }}
                  />
                  <Bar yAxisId="left" dataKey="fatigue" name="fatigue" radius={[2, 2, 0, 0]} barSize={8}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`fatigue-${index}`}
                        fill={(entry.fatigue || 0) >= 70 ? '#ef4444' : (entry.fatigue || 0) >= 40 ? '#eab308' : '#c9b99a'}
                      />
                    ))}
                  </Bar>
                  <Bar yAxisId="left" dataKey="sleep" name="sleep" fill="#2d5a3d" radius={[2, 2, 0, 0]} barSize={8} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="temperature"
                    name="temperature"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={<CustomDot />}
                    connectNulls
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* 日次記録テーブル */}
        <Card className="bg-white rounded-2xl border-[#e8e4df] shadow-sm mb-4 print:rounded-lg print:shadow-none print:break-inside-avoid-page">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-semibold text-gray-700">日次記録（感情・業務報告）</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-3">
            <div className="overflow-x-auto max-h-[160px] overflow-y-auto print:max-h-none print:overflow-visible">
              <table className="w-full text-[9px] print:text-[8px]">
                <thead className="sticky top-0 bg-white print:static">
                  <tr className="border-b border-[#e8e4df]">
                    <th className="text-left py-1.5 font-semibold text-gray-600 w-10">日付</th>
                    <th className="text-center py-1.5 font-semibold text-gray-600 w-14">感情</th>
                    <th className="text-left py-1.5 font-semibold text-gray-600 w-[30%]">感情の理由</th>
                    <th className="text-left py-1.5 font-semibold text-gray-600">業務報告</th>
                  </tr>
                </thead>
                <tbody>
                  {healthRecords.filter(r => r.emotions || r.emotionContext || r.workReport).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-400">
                        記録がありません
                      </td>
                    </tr>
                  ) : (
                    healthRecords
                      .filter(r => r.emotions || r.emotionContext || r.workReport)
                      .map((record, index) => (
                        <tr key={index} className="border-b border-[#f5f1eb] hover:bg-[#faf8f5] align-top">
                          <td className="py-1.5 font-medium text-gray-700">
                            {new Date(record.date).getDate()}日
                          </td>
                          <td className="py-1.5 text-center">
                            {record.emotions && (
                              <Badge
                                className="text-[7px] px-1"
                                style={{
                                  backgroundColor: `${EMOTION_COLORS[record.emotions] || '#9ca3af'}20`,
                                  color: EMOTION_COLORS[record.emotions] || '#9ca3af',
                                }}
                              >
                                {record.emotions}
                              </Badge>
                            )}
                          </td>
                          <td className="py-1.5 text-gray-600 whitespace-pre-wrap break-words max-w-[150px]">
                            {record.emotionContext || '-'}
                          </td>
                          <td className="py-1.5 text-gray-600 whitespace-pre-wrap break-words">
                            {record.workReport || '-'}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ゲーム振り返りテーブル */}
        <Card className="bg-white rounded-2xl border-[#e8e4df] shadow-sm print:rounded-lg print:shadow-none print:break-inside-avoid-page">
          <CardHeader className="pb-1 pt-3 px-3">
            <CardTitle className="text-xs font-semibold text-gray-700">ゲーム振り返り（出来たこと・難しかったこと）</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-3">
            <div className="overflow-x-auto max-h-[160px] overflow-y-auto print:max-h-none print:overflow-visible">
              <table className="w-full text-[9px] print:text-[8px]">
                <thead className="sticky top-0 bg-white print:static">
                  <tr className="border-b border-[#e8e4df]">
                    <th className="text-left py-1.5 font-semibold text-gray-600 w-10">日付</th>
                    <th className="text-left py-1.5 font-semibold text-gray-600 w-24">プレイしたゲーム</th>
                    <th className="text-left py-1.5 font-semibold text-gray-600 w-[35%]">出来たこと</th>
                    <th className="text-left py-1.5 font-semibold text-gray-600">難しかったこと</th>
                  </tr>
                </thead>
                <tbody>
                  {gameReflections.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-400">
                        記録がありません
                      </td>
                    </tr>
                  ) : (
                    gameReflections.map((reflection, index) => {
                      // プレイしたゲームに対応するfacilityGamesを探す
                      const playedGames = reflection.gamesPlayed
                        .map(gameName => facilityGames.find(fg =>
                          fg.name.toLowerCase().includes(gameName.toLowerCase()) ||
                          gameName.toLowerCase().includes(fg.name.toLowerCase())
                        ))
                        .filter((g): g is FacilityGame => g !== undefined);

                      return (
                        <tr key={index} className="border-b border-[#f5f1eb] hover:bg-[#faf8f5] align-top">
                          <td className="py-1.5 font-medium text-gray-700">
                            {new Date(reflection.date).getDate()}日
                          </td>
                          <td className="py-1.5 text-gray-600">
                            <div className="flex flex-wrap gap-1">
                              {playedGames.length > 0 ? (
                                playedGames.map((game, i) => (
                                  <div
                                    key={i}
                                    className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 flex-shrink-0"
                                    title={game.name}
                                  >
                                    {game.imageUrl ? (
                                      <Image
                                        src={game.imageUrl}
                                        alt={game.name}
                                        width={24}
                                        height={24}
                                        className="object-cover w-full h-full"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-[#2d5a3d] flex items-center justify-center text-white text-[8px] font-bold">
                                        {game.name.charAt(0)}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : reflection.gamesPlayed.length > 0 ? (
                                // facilityGamesに見つからない場合は名前表示
                                reflection.gamesPlayed.map((gameName, i) => (
                                  <div
                                    key={i}
                                    className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0"
                                    title={gameName}
                                  >
                                    <span className="text-[8px] text-gray-500 font-bold">
                                      {gameName.charAt(0)}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-1.5 text-gray-600 whitespace-pre-wrap break-words">
                            {reflection.achievedTasks || '-'}
                          </td>
                          <td className="py-1.5 text-gray-600 whitespace-pre-wrap break-words">
                            {reflection.difficultTasks || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="mt-4 pt-3 border-t border-[#e8e4df] flex justify-between items-center text-[10px] text-gray-400">
          <span>RevelApp 体調管理レポート</span>
          <span>出力日: {new Date().toLocaleDateString('ja-JP')}</span>
        </div>
      </div>

      {/* 印刷用スタイル & フォーカス枠削除 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          /* 印刷時のコンテナ設定 */
          .min-h-screen {
            min-height: auto !important;
            padding: 0 !important;
          }
          /* テーブル行のページ分割を許可 */
          tr {
            page-break-inside: avoid;
          }
          /* カードのページ分割制御 */
          .print\\:break-inside-avoid-page {
            page-break-inside: avoid;
          }
          /* 各セクションの間隔調整 */
          .mb-4 {
            margin-bottom: 8px !important;
          }
          /* フッターを各ページの下に */
          .mt-4.pt-3 {
            margin-top: 8px !important;
            padding-top: 8px !important;
          }
        }
        /* Rechartsのフォーカス枠を削除 */
        .recharts-wrapper:focus,
        .recharts-wrapper *:focus,
        .recharts-surface:focus,
        .recharts-pie-sector:focus,
        .recharts-sector:focus {
          outline: none !important;
        }
        /* カードのフォーカス枠を削除 */
        [class*="Card"]:focus,
        [class*="card"]:focus {
          outline: none !important;
        }
      `}</style>
    </div>
  );
}
