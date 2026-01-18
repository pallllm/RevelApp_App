import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  renderToBuffer,
} from '@react-pdf/renderer';
import path from 'path';

// 日本語フォントの登録（Google Fonts - Noto Sans JP）
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

// ロゴパス
const logoPath = path.join(process.cwd(), 'public/images/revelapp-logo.jpg');

// スタイル定義
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'NotoSansJP',
    fontSize: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 'auto',
  },
  header: {
    flex: 1,
    textAlign: 'center',
    paddingRight: 100, // ロゴ分のバランス調整
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoLeft: {
    width: '50%',
  },
  infoRight: {
    width: '40%',
    textAlign: 'right',
  },
  label: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  summaryBox: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#e8f4fd',
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 12,
    marginBottom: 4,
    color: '#1a365d',
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a365d',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableColNo: {
    width: '6%',
    textAlign: 'center',
  },
  tableColName: {
    width: '24%',
  },
  tableColGame: {
    width: '30%',
  },
  tableColCount: {
    width: '20%',
    textAlign: 'right',
  },
  tableColAmount: {
    width: '20%',
    textAlign: 'right',
  },
  gameDetailRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    paddingLeft: 30,
    backgroundColor: '#fafafa',
  },
  gameDetailText: {
    fontSize: 8,
    color: '#666',
  },
  tableHeaderText: {
    fontWeight: 700,
    fontSize: 9,
  },
  totalSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#333',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 700,
    marginRight: 20,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 700,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
  },
  notes: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 9,
    color: '#666',
    marginBottom: 4,
  },
});

// ゲーム別内訳
export interface GameBreakdown {
  gameName: string;
  gameLevel: number;
  playCount: number;
  amount: number;
}

// 報酬決定通知書データの型定義
export interface NoticeData {
  noticeNumber: string;
  issueDate: string;
  targetYear: number;
  targetMonth: number;
  facilityName: string;
  members: {
    name: string;
    playCount: number;
    amount: number;
    gameBreakdown: GameBreakdown[];
  }[];
  totalAmount: number;
  carryoverFromPrevious: number;
  carryoverToNext: number;
  paymentAmount: number;
  paymentDate?: string;
}

// 報酬決定通知書PDFコンポーネント
const NoticeDocument: React.FC<{ data: NoticeData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* ヘッダー（ロゴ付き） */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>報酬決定通知書</Text>
          <Text style={styles.subtitle}>
            {data.targetYear}年{data.targetMonth}月分 工賃計算結果
          </Text>
        </View>
        <Image style={styles.logo} src={logoPath} />
      </View>

      {/* 情報セクション */}
      <View style={styles.infoSection}>
        <View style={styles.infoLeft}>
          <Text style={styles.facilityName}>{data.facilityName} 様</Text>
          <Text style={styles.value}>
            下記のとおり、工賃を決定いたしましたのでご通知申し上げます。
          </Text>
        </View>
        <View style={styles.infoRight}>
          <Text style={styles.label}>通知書番号</Text>
          <Text style={styles.value}>{data.noticeNumber}</Text>
          <Text style={styles.label}>発行日</Text>
          <Text style={styles.value}>{data.issueDate}</Text>
        </View>
      </View>

      {/* 支払金額サマリー */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>今回お支払い金額</Text>
        <Text style={styles.summaryAmount}>
          ¥{data.paymentAmount.toLocaleString()}
        </Text>
        {data.paymentDate && (
          <Text style={{ fontSize: 10, marginTop: 4, color: '#1a365d' }}>
            振込予定日: {data.paymentDate}
          </Text>
        )}
      </View>

      {/* 金額内訳 */}
      <View style={{ marginBottom: 15 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 10 }}>今月の工賃合計</Text>
          <Text style={{ fontSize: 10 }}>¥{data.totalAmount.toLocaleString()}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 10 }}>前月からの繰越金</Text>
          <Text style={{ fontSize: 10 }}>¥{data.carryoverFromPrevious.toLocaleString()}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 10 }}>翌月への繰越金</Text>
          <Text style={{ fontSize: 10 }}>-¥{data.carryoverToNext.toLocaleString()}</Text>
        </View>
      </View>

      {/* 明細テーブル */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableColNo, styles.tableHeaderText]}>No.</Text>
          <Text style={[styles.tableColName, styles.tableHeaderText]}>利用者名</Text>
          <Text style={[styles.tableColGame, styles.tableHeaderText]}>ゲーム</Text>
          <Text style={[styles.tableColCount, styles.tableHeaderText]}>回数</Text>
          <Text style={[styles.tableColAmount, styles.tableHeaderText]}>金額</Text>
        </View>
        {data.members.map((member, memberIndex) => (
          <View key={memberIndex}>
            {/* 利用者のサマリー行 */}
            <View style={[styles.tableRow, { backgroundColor: '#f8f8f8' }]}>
              <Text style={[styles.tableColNo, { fontWeight: 700 }]}>{memberIndex + 1}</Text>
              <Text style={[styles.tableColName, { fontWeight: 700 }]}>{member.name}</Text>
              <Text style={styles.tableColGame}></Text>
              <Text style={[styles.tableColCount, { fontWeight: 700 }]}>{member.playCount}回</Text>
              <Text style={[styles.tableColAmount, { fontWeight: 700 }]}>¥{member.amount.toLocaleString()}</Text>
            </View>
            {/* ゲーム別内訳 */}
            {member.gameBreakdown.map((game, gameIndex) => (
              <View key={gameIndex} style={styles.gameDetailRow}>
                <Text style={[styles.tableColNo, styles.gameDetailText]}></Text>
                <Text style={[styles.tableColName, styles.gameDetailText]}></Text>
                <Text style={[styles.tableColGame, styles.gameDetailText]}>
                  {game.gameName} (Lv.{game.gameLevel})
                </Text>
                <Text style={[styles.tableColCount, styles.gameDetailText]}>{game.playCount}回</Text>
                <Text style={[styles.tableColAmount, styles.gameDetailText]}>¥{game.amount.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* 合計 */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>工賃合計</Text>
        <Text style={styles.totalAmount}>¥{data.totalAmount.toLocaleString()}</Text>
      </View>

      {/* 備考 */}
      <View style={styles.notes}>
        <Text style={styles.notesTitle}>備考</Text>
        <Text style={styles.notesText}>
          ・1,000円未満の金額は翌月に繰り越されます。
        </Text>
        <Text style={styles.notesText}>
          ・工賃は毎月月末日に登録口座へ振り込まれます。
        </Text>
        <Text style={styles.notesText}>
          ・内容にご不明点がございましたらお問い合わせください。
        </Text>
      </View>

      {/* フッター */}
      <Text style={styles.footer}>
        この通知書は工賃計算システムにより自動生成されています
      </Text>
    </Page>
  </Document>
);

/**
 * 報酬決定通知書PDFを生成
 */
export async function generateNoticePdf(data: NoticeData): Promise<Buffer> {
  const buffer = await renderToBuffer(<NoticeDocument data={data} />);
  return Buffer.from(buffer);
}

/**
 * 通知書番号を生成
 */
export function generateNoticeNumber(facilityId: string, year: number, month: number): string {
  const facilityPrefix = facilityId.substring(0, 4).toUpperCase();
  const yearMonth = `${year}${String(month).padStart(2, '0')}`;
  return `NTC-${facilityPrefix}-${yearMonth}`;
}
