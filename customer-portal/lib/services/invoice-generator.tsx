import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  renderToBuffer,
} from '@react-pdf/renderer';

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

// スタイル定義
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'NotoSansJP',
    fontSize: 10,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 10,
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
  tableHeaderText: {
    fontWeight: 700,
    fontSize: 9,
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
  remarks: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  remarksTitle: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 8,
    color: '#666',
  },
});

// ゲーム別内訳
export interface InvoiceGameBreakdown {
  gameName: string;
  gameLevel: number;
  playCount: number;
}

// 請求書データの型定義
export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  targetYear: number;
  targetMonth: number;
  facilityName: string;
  facilityAddress?: string;
  members: {
    name: string;
    playCount: number;
    amount: number;
    gameBreakdown: InvoiceGameBreakdown[];
  }[];
  totalAmount: number;
  paymentDueDate?: string;
}

// 請求書PDFコンポーネント
const InvoiceDocument: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>請求書</Text>
        <Text style={styles.invoiceNumber}>No. {data.invoiceNumber}</Text>
      </View>

      {/* 情報セクション */}
      <View style={styles.infoSection}>
        <View style={styles.infoLeft}>
          {/* 宛先（RevelApp宛） */}
          <Text style={styles.label}>宛先</Text>
          <Text style={styles.facilityName}>株式会社WAVE3</Text>
          <Text style={styles.value}>RevelApp事業部 御中</Text>
        </View>
        <View style={styles.infoRight}>
          <Text style={styles.label}>発行日</Text>
          <Text style={styles.value}>{data.issueDate}</Text>
          <Text style={styles.label}>対象期間</Text>
          <Text style={styles.value}>
            {data.targetYear}年{data.targetMonth}月分
          </Text>
          {data.paymentDueDate && (
            <>
              <Text style={styles.label}>お支払期限</Text>
              <Text style={styles.value}>{data.paymentDueDate}</Text>
            </>
          )}
        </View>
      </View>

      {/* 請求元（施設情報） */}
      <View style={{ marginBottom: 20, textAlign: 'right' }}>
        <Text style={styles.label}>請求元</Text>
        <Text style={{ fontSize: 12, fontWeight: 700 }}>{data.facilityName}</Text>
        {data.facilityAddress && (
          <Text style={{ fontSize: 9, color: '#666' }}>{data.facilityAddress}</Text>
        )}
      </View>

      {/* 合計金額（上部に表示） */}
      <View style={{ marginBottom: 20, padding: 15, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
        <Text style={{ fontSize: 12, marginBottom: 4 }}>ご請求金額</Text>
        <Text style={{ fontSize: 20, fontWeight: 700 }}>
          ¥{data.totalAmount.toLocaleString()}
        </Text>
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
                <Text style={[styles.tableColAmount, styles.gameDetailText]}></Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* 合計 */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>合計金額</Text>
        <Text style={styles.totalAmount}>¥{data.totalAmount.toLocaleString()}</Text>
      </View>

      {/* 備考 */}
      <View style={styles.remarks}>
        <Text style={styles.remarksTitle}>備考</Text>
        <Text style={styles.remarksText}>
          ・本請求書は工賃計算に基づいて自動生成されています。
        </Text>
        <Text style={styles.remarksText}>
          ・内容にご不明点がございましたらお問い合わせください。
        </Text>
      </View>

      {/* フッター */}
      <Text style={styles.footer}>
        RevelApp - 工賃管理システム
      </Text>
    </Page>
  </Document>
);

/**
 * 請求書PDFを生成
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  const buffer = await renderToBuffer(<InvoiceDocument data={data} />);
  return Buffer.from(buffer);
}

/**
 * 請求書番号を生成
 */
export function generateInvoiceNumber(facilityId: string, year: number, month: number): string {
  const facilityPrefix = facilityId.substring(0, 4).toUpperCase();
  const yearMonth = `${year}${String(month).padStart(2, '0')}`;
  return `INV-${facilityPrefix}-${yearMonth}`;
}
