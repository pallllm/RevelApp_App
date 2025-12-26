/**
 * API Client for RevelApp Customer Portal
 * クライアントサイドでのAPI呼び出し用ヘルパー関数
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * 開発環境用のモックトークン
 * 本番環境ではWordPress JWTトークンを使用
 */
const DEV_TOKEN = 'dev-token';

/**
 * APIリクエストのベース関数
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // 開発環境ではdev-tokenを使用
  const token = process.env.NODE_ENV === 'development'
    ? DEV_TOKEN
    : localStorage.getItem('auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * 事業所情報を取得
 */
export async function getFacility() {
  return apiRequest<{
    facility: {
      id: string;
      name: string;
      planType: string;
      address: string;
      phone: string;
      email: string;
      memberCount: number;
      members: Array<{
        id: string;
        name: string;
        initials: string;
        role: string;
        startDate: string;
      }>;
      games: Array<{
        id: string;
        name: string;
        level: number;
        isBackup: boolean;
        imageUrl: string | null;
        manualUrl: string | null;
        videoUrl: string | null;
      }>;
    };
  }>('/api/facilities');
}

/**
 * 事業所の統計情報を取得
 */
export async function getFacilityStats() {
  return apiRequest<{
    stats: {
      activeMemberCount: number;
      monthlyPlayCount: number;
      previousMonthWage: {
        year: number;
        month: number;
        totalAmount: number;
        memberCount: number;
        status: string;
      } | null;
      totalWages: number;
      continuationMonths: number;
      wagePhase: {
        phaseName: string;
        level1Wage: number;
        level2Wage: number;
        level3Wage: number;
        level4Wage: number;
      };
    };
  }>('/api/facilities/stats');
}

/**
 * プランタイプを日本語表記に変換
 */
export function formatPlanType(planType: string): string {
  const planMap: Record<string, string> = {
    'FLEXIBLE': 'RevelAppコース A-フレキシブル',
    'STANDARD': 'RevelAppコース B-スタンダード',
    'PREMIUM': 'RevelAppコース C-プレミアム',
  };
  return planMap[planType] || planType;
}

/**
 * 工賃フェーズ情報をUIフォーマットに変換
 */
export function formatWagePhase(wagePhase: {
  phaseName: string;
  level1Wage: number;
  level2Wage: number;
  level3Wage: number;
  level4Wage: number;
}) {
  return {
    phase: wagePhase.phaseName,
    levels: [
      { level: 1, wage: wagePhase.level1Wage },
      { level: 2, wage: wagePhase.level2Wage },
      { level: 3, wage: wagePhase.level3Wage },
      { level: 4, wage: wagePhase.level4Wage },
    ],
  };
}

/**
 * 工賃履歴を取得
 */
export async function getWageHistory() {
  return apiRequest<{
    history: Array<{
      id: string;
      year: number;
      month: number;
      totalAmount: number;
      memberCount: number;
      status: string;
      paymentDate: string | null;
    }>;
  }>('/api/wages/history');
}

/**
 * 指定月の利用者別工賃内訳を取得
 */
export async function getMemberWages(year: number, month: number) {
  return apiRequest<{
    members: Array<{
      name: string;
      initials: string | null;
      amount: number;
      playCount: number;
    }>;
  }>(`/api/wages/members?year=${year}&month=${month}`);
}

/**
 * 繰越金額を取得
 */
export async function getWageCarryover(year?: number, month?: number) {
  const params = year && month ? `?year=${year}&month=${month}` : '';
  return apiRequest<{
    carryover: {
      year: number;
      month: number;
      amount: number;
    } | null;
  }>(`/api/wages/carryover${params}`);
}

/**
 * 体調記録を取得
 */
export async function getHealthRecords(userId: string, year: number, month: number) {
  return apiRequest<{
    records: Array<{
      date: string;
      fatigueLevel: number | null;
      sleepHours: number | null;
      mood: string | null;
      emotions: any;
      weather: string | null;
      temperature: number | null;
      hasPressureChange: boolean;
      achievedTasks: string | null;
      difficultTasks: string | null;
      freeNotes: string | null;
    }>;
  }>(`/api/health-records?userId=${userId}&year=${year}&month=${month}`);
}

/**
 * ゲームプレイ統計を取得
 */
export async function getGameStats(userId: string, year: number, month: number) {
  return apiRequest<{
    gameStats: Array<{
      gameId: string;
      gameName: string;
      gameLevel: number;
      gameImageUrl: string | null;
      playCount: number;
    }>;
    totalPlayCount: number;
    totalAllTimePlayCount: number;
    previousMonthPlayCount: number;
    playCountDifference: number;
  }>(`/api/game-stats?userId=${userId}&year=${year}&month=${month}`);
}

/**
 * 通知を取得
 */
export async function getNotifications(facilityId: string) {
  return apiRequest<{
    notifications: Array<{
      id: string;
      type: 'info' | 'success' | 'warning' | 'error';
      title: string;
      message: string;
      timestamp: string;
      read: boolean;
      link?: string;
    }>;
    unreadCount: number;
  }>(`/api/notifications?facilityId=${facilityId}`);
}
