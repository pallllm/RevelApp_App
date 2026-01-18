import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
  Image,
  Svg,
  G,
  Path,
  Rect,
  Circle,
  Line,
} from '@react-pdf/renderer';

// 日本語フォントの登録
Font.register({
  family: 'NotoSansJP',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.1/files/noto-sans-jp-japanese-400-normal.woff',
      fontWeight: 400,
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5.0.1/files/noto-sans-jp-japanese-700-normal.woff',
      fontWeight: 700,
    },
  ],
});

// モダンダッシュボードカラーパレット
const COLORS = {
  pageBg: '#f0f5fa',
  cardBg: '#ffffff',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  primary: '#4f8cff',
  primaryLight: '#e0edff',
  success: '#22c55e',
  successLight: '#dcfce7',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  purple: '#8b5cf6',
  purpleLight: '#ede9fe',
  orange: '#f97316',
  // チャート用
  fatigue: '#f59e0b',
  sleep: '#4f8cff',
  temperature: '#ef4444',
};

// 気分の色
const MOOD_COLORS: Record<string, string> = {
  '絶好調': '#22c55e',
  '好調': '#4ade80',
  '普通': '#f59e0b',
  '不調': '#f97316',
  '絶不調': '#ef4444',
};

// 感情の色
const EMOTION_COLORS: Record<string, string> = {
  '落ち着き': '#22c55e',
  '嬉しい': '#4ade80',
  '楽しい': '#06b6d4',
  '悲しみ': '#4f8cff',
  '不安': '#f59e0b',
  '怒り': '#ef4444',
  'イライラ': '#f97316',
  '緊張': '#8b5cf6',
  '疲労': '#94a3b8',
};

// 天気アイコンのシンボル
const WEATHER_SYMBOLS: Record<string, string> = {
  'sunny': '☀',
  'cloudy': '☁',
  'rainy': '☂',
  'snowy': '❄',
  'partly_cloudy': '⛅',
};

// スタイル定義
const styles = StyleSheet.create({
  page: {
    padding: 16,
    fontFamily: 'NotoSansJP',
    fontSize: 9,
    backgroundColor: COLORS.pageBg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 700,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userBadge: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userAvatarText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 700,
  },
  userName: {
    fontSize: 10,
    color: COLORS.textPrimary,
    fontWeight: 700,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  cardSmall: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 10,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  col2: {
    flex: 1,
  },
  // ゲームアイコン
  gamesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  gameItem: {
    alignItems: 'center',
    width: 48,
  },
  gameIconWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  gameIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameIconInactive: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameIconText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 700,
  },
  gameIconTextInactive: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 700,
  },
  gameIconImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  gameIconImageInactive: {
    width: 32,
    height: 32,
    borderRadius: 8,
    opacity: 0.4,
  },
  gameBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  gameBadgeInactive: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#94a3b8',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  gameBadgeText: {
    color: '#ffffff',
    fontSize: 7,
    fontWeight: 700,
  },
  gameName: {
    fontSize: 7,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 1.2,
  },
  gameNameInactive: {
    fontSize: 7,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 1.2,
  },
  // 円グラフ + 引き出しラベル
  pieChartSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartWithLabels: {
    position: 'relative',
    width: 180,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // チャート
  chartCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 10,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 10,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  chartLegendText: {
    fontSize: 7,
    color: COLORS.textSecondary,
  },
  // テーブル
  table: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.pageBg,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 700,
    color: COLORS.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCell: {
    fontSize: 8,
    color: COLORS.textPrimary,
  },
  tableCellWrap: {
    fontSize: 8,
    color: COLORS.textPrimary,
    lineHeight: 1.4,
  },
  colDate: { width: '8%' },
  colEmotion: { width: '12%' },
  colReason: { width: '35%' },
  colWorkReport: { width: '45%' },
  colGames: { width: '20%' },
  colAchieved: { width: '38%' },
  colDifficult: { width: '34%' },
  emotionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  emotionBadgeText: {
    fontSize: 7,
    fontWeight: 700,
  },
  gameIconSmall: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  gameIconSmallImage: {
    width: 20,
    height: 20,
    borderRadius: 6,
    marginRight: 4,
  },
  gameIconSmallText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: 700,
  },
  gameIconsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  pageIndicator: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pageIndicatorText: {
    fontSize: 8,
    color: COLORS.textSecondary,
  },
});

// 型定義
export interface HealthReportGame {
  id: string;
  name: string;
  level: number;
  imageUrl: string | null;
  imageBase64: string | null;
  playCount: number;
}

export interface HealthReportMoodDistribution {
  mood: string;
  count: number;
  percentage: number;
}

export interface HealthReportEmotionDistribution {
  emotion: string;
  count: number;
  percentage: number;
}

export interface HealthReportDailyData {
  day: number;
  fatigue: number | null;
  sleepHours: number | null;
  temperature: number | null;
  weather?: string | null;
  hasPressureChange?: boolean;
}

export interface HealthReportDailyRecord {
  date: string;
  emotion: string | null;
  emotionContext: string | null;
  workReport: string | null;
}

export interface HealthReportGameReflection {
  date: string;
  gamesPlayed: string[];
  achievedTasks: string | null;
  difficultTasks: string | null;
}

export interface HealthReportData {
  userName: string;
  year: number;
  month: number;
  games: HealthReportGame[];
  moodDistribution: HealthReportMoodDistribution[];
  emotionDistribution: HealthReportEmotionDistribution[];
  dailyData: HealthReportDailyData[];
  dailyRecords: HealthReportDailyRecord[];
  gameReflections: HealthReportGameReflection[];
  outputDate: string;
}

// ヘッダーコンポーネント
const Header: React.FC<{ data: HealthReportData }> = ({ data }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <View style={styles.logoIcon}>
        <Text style={styles.logoText}>R</Text>
      </View>
      <View>
        <Text style={styles.title}>体調の見える化グラフ</Text>
        <Text style={styles.subtitle}>{data.year}年{data.month}月 月次レポート</Text>
      </View>
    </View>
    <View style={styles.headerRight}>
      <View style={styles.userBadge}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{data.userName.charAt(0)}</Text>
        </View>
        <Text style={styles.userName}>{data.userName}</Text>
      </View>
    </View>
  </View>
);

// ドーナツチャート（中空洞タイプ）
const PieChartWithLabels: React.FC<{
  data: { label: string; value: number; color: string }[];
  size?: number;
}> = ({ data, size = 60 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <Text style={{ fontSize: 8, color: COLORS.textMuted }}>データなし</Text>;

  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - 2;
  const innerRadius = outerRadius * 0.55; // 内側の半径（ドーナツの穴）

  let currentAngle = -90;

  // ドーナツ型の円弧パスを生成
  const createDonutArcPath = (startAngle: number, endAngle: number, outer: number, inner: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + outer * Math.cos(startRad);
    const y1 = cy + outer * Math.sin(startRad);
    const x2 = cx + outer * Math.cos(endRad);
    const y2 = cy + outer * Math.sin(endRad);
    const x3 = cx + inner * Math.cos(endRad);
    const y3 = cy + inner * Math.sin(endRad);
    const x4 = cx + inner * Math.cos(startRad);
    const y4 = cy + inner * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outer} ${outer} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  const slices = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    if (angle < 1) return null;
    return (
      <Path
        key={index}
        d={createDonutArcPath(startAngle, endAngle - 1, outerRadius, innerRadius)}
        fill={item.color}
      />
    );
  });

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* 背景リング */}
        <Circle cx={cx} cy={cy} r={outerRadius} fill="#f1f5f9" />
        <Circle cx={cx} cy={cy} r={innerRadius} fill={COLORS.cardBg} />
        {slices}
      </Svg>
      {/* 凡例 */}
      <View style={{ marginLeft: 12 }}>
        {data.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, marginRight: 6 }} />
            <Text style={{ fontSize: 8, color: COLORS.textPrimary }}>
              {item.label} {Math.round((item.value / total) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// 複合チャート（棒グラフ + 折れ線 + 天気アイコン）
const CombinedChart: React.FC<{
  data: HealthReportDailyData[];
  width?: number;
  height?: number;
}> = ({ data, width = 760, height = 100 }) => {
  const padding = { top: 18, right: 10, bottom: 18, left: 25 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barWidth = Math.min(6, (chartWidth / data.length) * 0.35);

  // 温度の最大・最小を計算
  const temps = data.filter(d => d.temperature !== null).map(d => d.temperature!);
  const minTemp = temps.length > 0 ? Math.min(...temps) - 5 : 0;
  const maxTemp = temps.length > 0 ? Math.max(...temps) + 5 : 30;
  const tempRange = maxTemp - minTemp || 1;

  // 天気アイコンを取得
  const getWeatherSymbol = (weather: string | null | undefined) => {
    if (!weather) return '';
    if (weather.includes('晴')) return '☀';
    if (weather.includes('曇')) return '☁';
    if (weather.includes('雨')) return '☂';
    if (weather.includes('雪')) return '❄';
    return '⛅';
  };

  return (
    <View>
      {/* 天気アイコン行 */}
      <View style={{ flexDirection: 'row', marginLeft: padding.left, marginBottom: 1, height: 10 }}>
        {data.map((d, i) => {
          const weatherSymbol = getWeatherSymbol(d.weather);
          const hasPressure = d.hasPressureChange;
          return (
            <View key={i} style={{ width: chartWidth / data.length, alignItems: 'center' }}>
              {weatherSymbol && (
                <Text style={{ fontSize: 6, color: COLORS.textSecondary }}>{weatherSymbol}</Text>
              )}
              {hasPressure && (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  right: 1,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: COLORS.purple,
                }} />
              )}
            </View>
          );
        })}
      </View>

      <Svg width={width} height={height - 12}>
        {/* グリッド線 */}
        {[0, 25, 50, 75, 100].map((val, i) => (
          <G key={i}>
            <Line
              x1={padding.left}
              y1={padding.top + ((100 - val) / 100) * chartHeight}
              x2={width - padding.right}
              y2={padding.top + ((100 - val) / 100) * chartHeight}
              stroke="#e2e8f0"
              strokeWidth={1}
            />
          </G>
        ))}

        {/* 棒グラフ（疲労度 + 睡眠） */}
        {data.map((d, i) => {
          const x = padding.left + (i + 0.5) * (chartWidth / data.length);
          return (
            <G key={i}>
              {/* 疲労度バー */}
              {d.fatigue !== null && (
                <Rect
                  x={x - barWidth - 1}
                  y={padding.top + ((100 - d.fatigue) / 100) * chartHeight}
                  width={barWidth}
                  height={(d.fatigue / 100) * chartHeight}
                  fill={COLORS.fatigue}
                  rx={2}
                />
              )}
              {/* 睡眠バー（10hを100%として） */}
              {d.sleepHours !== null && (
                <Rect
                  x={x + 1}
                  y={padding.top + ((100 - Math.min(d.sleepHours * 10, 100)) / 100) * chartHeight}
                  width={barWidth}
                  height={(Math.min(d.sleepHours * 10, 100) / 100) * chartHeight}
                  fill={COLORS.sleep}
                  rx={2}
                />
              )}
            </G>
          );
        })}

        {/* 気温折れ線 */}
        {(() => {
          const points = data
            .map((d, i) => {
              if (d.temperature === null) return null;
              const x = padding.left + (i + 0.5) * (chartWidth / data.length);
              const y = padding.top + ((maxTemp - d.temperature) / tempRange) * chartHeight;
              return { x, y };
            })
            .filter(Boolean) as { x: number; y: number }[];

          if (points.length < 2) return null;

          const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

          return (
            <G>
              <Path d={linePath} fill="none" stroke={COLORS.temperature} strokeWidth={2} />
              {points.map((p, i) => (
                <Circle key={i} cx={p.x} cy={p.y} r={3} fill={COLORS.temperature} />
              ))}
            </G>
          );
        })()}
      </Svg>

      {/* X軸ラベル */}
      <View style={{ flexDirection: 'row', marginLeft: padding.left }}>
        {data.map((d, i) => {
          if (i === 0 || (i + 1) % 5 === 0 || i === data.length - 1) {
            return (
              <View key={i} style={{ width: chartWidth / data.length, alignItems: 'center' }}>
                <Text style={{ fontSize: 7, color: COLORS.textMuted }}>{d.day}</Text>
              </View>
            );
          }
          return <View key={i} style={{ width: chartWidth / data.length }} />;
        })}
      </View>
    </View>
  );
};

// ゲームプレイ状況セクション
const GamesSection: React.FC<{ games: HealthReportGame[] }> = ({ games }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>ゲームプレイ状況（累計）</Text>
    <View style={styles.gamesContainer}>
      {games.map((game, index) => {
        const isActive = game.playCount > 0;
        return (
          <View key={index} style={styles.gameItem}>
            <View style={styles.gameIconWrapper}>
              {game.imageBase64 ? (
                <Image
                  src={game.imageBase64}
                  style={isActive ? styles.gameIconImage : styles.gameIconImageInactive}
                />
              ) : (
                <View style={isActive ? styles.gameIcon : styles.gameIconInactive}>
                  <Text style={isActive ? styles.gameIconText : styles.gameIconTextInactive}>
                    {game.name.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={isActive ? styles.gameBadge : styles.gameBadgeInactive}>
                <Text style={styles.gameBadgeText}>{game.playCount}</Text>
              </View>
            </View>
            <Text style={isActive ? styles.gameName : styles.gameNameInactive}>
              {game.name}
            </Text>
          </View>
        );
      })}
    </View>
  </View>
);

// 分布セクション（引き出しラベル付き円グラフ）
const DistributionSection: React.FC<{
  moodDistribution: HealthReportMoodDistribution[];
  emotionDistribution: HealthReportEmotionDistribution[];
}> = ({ moodDistribution, emotionDistribution }) => (
  <View style={styles.row}>
    <View style={[styles.cardSmall, styles.col2]}>
      <Text style={styles.cardTitle}>気分の分布</Text>
      <PieChartWithLabels
        data={moodDistribution.map(m => ({
          label: m.mood,
          value: m.count,
          color: MOOD_COLORS[m.mood] || '#94a3b8',
        }))}
      />
    </View>
    <View style={[styles.cardSmall, styles.col2]}>
      <Text style={styles.cardTitle}>感情の分布</Text>
      <PieChartWithLabels
        data={emotionDistribution.map(e => ({
          label: e.emotion,
          value: e.count,
          color: EMOTION_COLORS[e.emotion] || '#94a3b8',
        }))}
      />
    </View>
  </View>
);

// チャートセクション
const ChartSection: React.FC<{ dailyData: HealthReportDailyData[] }> = ({ dailyData }) => {
  const hasData = dailyData.some(d => d.fatigue !== null || d.sleepHours !== null || d.temperature !== null);

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.cardTitle}>疲労度・睡眠・気温の推移</Text>
        <View style={styles.chartLegend}>
          <View style={styles.chartLegendItem}>
            <View style={[styles.chartLegendDot, { backgroundColor: COLORS.fatigue }]} />
            <Text style={styles.chartLegendText}>疲労度</Text>
          </View>
          <View style={styles.chartLegendItem}>
            <View style={[styles.chartLegendDot, { backgroundColor: COLORS.sleep }]} />
            <Text style={styles.chartLegendText}>睡眠</Text>
          </View>
          <View style={styles.chartLegendItem}>
            <View style={[styles.chartLegendDot, { backgroundColor: COLORS.temperature }]} />
            <Text style={styles.chartLegendText}>気温</Text>
          </View>
          <View style={styles.chartLegendItem}>
            <View style={[styles.chartLegendDot, { backgroundColor: COLORS.purple }]} />
            <Text style={styles.chartLegendText}>気圧変化</Text>
          </View>
        </View>
      </View>
      {!hasData ? (
        <Text style={{ fontSize: 8, color: COLORS.textMuted, textAlign: 'center', paddingVertical: 10 }}>
          データなし
        </Text>
      ) : (
        <CombinedChart data={dailyData} width={760} height={100} />
      )}
    </View>
  );
};

// 日次記録テーブル
const DailyRecordsTable: React.FC<{ records: HealthReportDailyRecord[] }> = ({ records }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>日次記録（感情・業務報告）</Text>
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.colDate]}>日付</Text>
        <Text style={[styles.tableHeaderText, styles.colEmotion]}>感情</Text>
        <Text style={[styles.tableHeaderText, styles.colReason]}>感情の理由</Text>
        <Text style={[styles.tableHeaderText, styles.colWorkReport]}>業務報告</Text>
      </View>
      {records.length === 0 ? (
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { width: '100%', textAlign: 'center', color: COLORS.textMuted }]}>
            記録がありません
          </Text>
        </View>
      ) : (
        records.map((record, index) => (
          <View key={index} style={styles.tableRow} wrap={false}>
            <Text style={[styles.tableCell, styles.colDate]}>
              {new Date(record.date).getDate()}日
            </Text>
            <View style={styles.colEmotion}>
              {record.emotion ? (
                <View
                  style={[
                    styles.emotionBadge,
                    { backgroundColor: `${EMOTION_COLORS[record.emotion] || '#94a3b8'}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.emotionBadgeText,
                      { color: EMOTION_COLORS[record.emotion] || '#64748b' },
                    ]}
                  >
                    {record.emotion}
                  </Text>
                </View>
              ) : (
                <Text style={styles.tableCell}>-</Text>
              )}
            </View>
            <Text style={[styles.tableCellWrap, styles.colReason]}>
              {record.emotionContext || '-'}
            </Text>
            <Text style={[styles.tableCellWrap, styles.colWorkReport]}>
              {record.workReport || '-'}
            </Text>
          </View>
        ))
      )}
    </View>
  </View>
);

// ゲームアイコン（小さいテーブル用）
const GameIconSmall: React.FC<{
  game: HealthReportGame | null;
  gameName: string;
}> = ({ game, gameName }) => {
  if (game?.imageBase64) {
    return <Image src={game.imageBase64} style={styles.gameIconSmallImage} />;
  }
  return (
    <View style={styles.gameIconSmall}>
      <Text style={styles.gameIconSmallText}>{gameName.charAt(0)}</Text>
    </View>
  );
};

// ゲーム振り返りテーブル
const GameReflectionsTable: React.FC<{
  reflections: HealthReportGameReflection[];
  games: HealthReportGame[];
}> = ({ reflections, games }) => {
  const findGame = (gameName: string): HealthReportGame | null => {
    return games.find(g =>
      g.name.toLowerCase().includes(gameName.toLowerCase()) ||
      gameName.toLowerCase().includes(g.name.toLowerCase())
    ) || null;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>ゲーム振り返り（出来たこと・難しかったこと）</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colDate]}>日付</Text>
          <Text style={[styles.tableHeaderText, styles.colGames]}>プレイしたゲーム</Text>
          <Text style={[styles.tableHeaderText, styles.colAchieved]}>出来たこと</Text>
          <Text style={[styles.tableHeaderText, styles.colDifficult]}>難しかったこと</Text>
        </View>
        {reflections.length === 0 ? (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '100%', textAlign: 'center', color: COLORS.textMuted }]}>
              記録がありません
            </Text>
          </View>
        ) : (
          reflections.map((reflection, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <Text style={[styles.tableCell, styles.colDate]}>
                {new Date(reflection.date).getDate()}日
              </Text>
              <View style={[styles.colGames, styles.gameIconsRow]}>
                {reflection.gamesPlayed.length > 0 ? (
                  reflection.gamesPlayed.map((gameName, i) => (
                    <GameIconSmall key={i} game={findGame(gameName)} gameName={gameName} />
                  ))
                ) : (
                  <Text style={styles.tableCell}>-</Text>
                )}
              </View>
              <Text style={[styles.tableCellWrap, styles.colAchieved]}>
                {reflection.achievedTasks || '-'}
              </Text>
              <Text style={[styles.tableCellWrap, styles.colDifficult]}>
                {reflection.difficultTasks || '-'}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

// フッター
const Footer: React.FC<{ page: number; total: number; outputDate: string }> = ({ page, total, outputDate }) => (
  <View style={styles.footer}>
    <Text style={styles.footerText}>RevelApp 体調管理レポート • 出力日: {outputDate}</Text>
    <View style={styles.pageIndicator}>
      <Text style={styles.pageIndicatorText}>{page} / {total}</Text>
    </View>
  </View>
);

// メインドキュメント
const HealthReportDocument: React.FC<{ data: HealthReportData }> = ({ data }) => (
  <Document>
    {/* ページ1: サマリー */}
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Header data={data} />
      <GamesSection games={data.games} />
      <View style={{ marginTop: 6 }}>
        <DistributionSection
          moodDistribution={data.moodDistribution}
          emotionDistribution={data.emotionDistribution}
        />
      </View>
      <View style={{ marginTop: 6 }}>
        <ChartSection dailyData={data.dailyData} />
      </View>
      <Footer page={1} total={3} outputDate={data.outputDate} />
    </Page>

    {/* ページ2: 日次記録 */}
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Header data={data} />
      <DailyRecordsTable records={data.dailyRecords} />
      <Footer page={2} total={3} outputDate={data.outputDate} />
    </Page>

    {/* ページ3: ゲーム振り返り */}
    <Page size="A4" orientation="landscape" style={styles.page}>
      <Header data={data} />
      <GameReflectionsTable reflections={data.gameReflections} games={data.games} />
      <Footer page={3} total={3} outputDate={data.outputDate} />
    </Page>
  </Document>
);

/**
 * 体調レポートPDFを生成
 */
export async function generateHealthReportPdf(data: HealthReportData): Promise<Buffer> {
  const buffer = await renderToBuffer(<HealthReportDocument data={data} />);
  return Buffer.from(buffer);
}
