/**
 * Google Sheets操作ユーティリティ
 */

import { getSheetsClient } from './auth';
import { copySpreadsheet } from './drive';

export type SpreadsheetType = 'entry' | 'focus_simple' | 'focus_normal';

/**
 * プランとスプレッドシートタイプから適切なテンプレートIDを取得
 */
function getTemplateId(planType: string, spreadsheetType?: SpreadsheetType): string {
  if (planType === 'ENTRY') {
    return process.env.TEMPLATE_ENTRY_ID || '';
  }

  // FOCUS or FLEXIBLE
  if (spreadsheetType === 'focus_simple') {
    return process.env.TEMPLATE_FOCUS_SIMPLE_ID || '';
  }

  // デフォルトは通常版
  return process.env.TEMPLATE_FOCUS_NORMAL_ID || '';
}

/**
 * 利用者用スプレッドシートを作成
 *
 * @param userName 利用者名
 * @param facilityName 施設名
 * @param facilityFolderId 施設のフォルダID
 * @param planType プランタイプ
 * @param spreadsheetType スプレッドシートタイプ
 * @returns スプレッドシートのIDとURL
 */
export async function createUserSpreadsheet(params: {
  userName: string;
  facilityName: string;
  facilityFolderId: string;
  planType: string;
  spreadsheetType?: SpreadsheetType;
}): Promise<{ id: string; url: string }> {
  const { userName, facilityName, facilityFolderId, planType, spreadsheetType } = params;

  const templateId = getTemplateId(planType, spreadsheetType);

  if (!templateId) {
    throw new Error(`Template ID not found for plan type: ${planType}`);
  }

  const spreadsheetName = `${facilityName}_${userName}_記録シート`;

  return await copySpreadsheet(templateId, spreadsheetName, facilityFolderId);
}

/**
 * 施設管理シートを作成
 */
export async function createFacilityManagementSheet(
  facilityName: string,
  facilityFolderId: string
): Promise<{ id: string; url: string }> {
  const templateId = process.env.TEMPLATE_FACILITY_MGMT_ID;

  if (!templateId) {
    throw new Error('Facility management template ID not found');
  }

  const spreadsheetName = `${facilityName}_施設管理シート`;

  return await copySpreadsheet(templateId, spreadsheetName, facilityFolderId);
}

/**
 * スプレッドシートからデータを読み込む
 *
 * @param spreadsheetId スプレッドシートID
 * @param range 読み込む範囲（例: 'Sheet1!A1:D10'）
 * @returns セルの値の2次元配列
 */
export async function readSpreadsheetData(
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response.data.values || [];
}

/**
 * スプレッドシートにデータを書き込む
 */
export async function writeSpreadsheetData(
  spreadsheetId: string,
  range: string,
  values: any[][]
): Promise<void> {
  const sheets = await getSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values },
  });
}

/**
 * 体調データを読み込む
 *
 * @param spreadsheetUrl スプレッドシートのURL
 * @param sheetName シート名（例: '2025.01体調記録'）
 * @returns 体調データの配列
 */
export async function readHealthData(
  spreadsheetUrl: string,
  sheetName?: string
): Promise<any[]> {
  // URLからスプレッドシートIDを抽出
  const match = spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error('Invalid spreadsheet URL');
  }

  const spreadsheetId = match[1];

  // シート名が指定されていない場合は、現在の年月を使用
  const targetSheetName =
    sheetName || new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit' });

  // TODO: 実際のデータ形式に合わせて範囲を調整
  const range = `${targetSheetName}!A7:Z100`;

  try {
    const data = await readSpreadsheetData(spreadsheetId, range);

    // データを整形して返す
    // TODO: 実際のシート構造に合わせて調整
    return data.map((row) => ({
      date: row[0],
      fatigueLevel: row[1],
      sleepHours: row[2],
      mood: row[3],
      // ... 他のフィールド
    }));
  } catch (error) {
    console.error('Failed to read health data:', error);
    return [];
  }
}

/**
 * URLからスプレッドシートIDを抽出
 */
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}
