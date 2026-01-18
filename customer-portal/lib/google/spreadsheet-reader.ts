/**
 * スプレッドシート読み取りサービス
 * 各種シートからデータを読み取り、型付きオブジェクトに変換する
 */

import { getSheetsClient } from './auth';
import {
  PlanType,
  MemberInfo,
  MemberListSheet,
  HealthRecordRow,
  MonthlyHealthRecords,
  GamePlayRecordRow,
  DailyReflectionRow,
  MonthlyGamePlayRecords,
  MonthlyFacilityGamePlayRecords,
  EntryPlanGameSelection,
  FOCUS_MEMBER_LIST_COLUMNS,
  FLEXIBLE_MEMBER_LIST_COLUMNS,
  HEALTH_RECORD_COLUMNS,
  GAME_PLAY_RECORD_CONFIG,
  parseSheetNameDate,
  parseMood,
  parsePlanType,
} from './spreadsheet-types';

// ===================
// ヘルパー関数
// ===================

/** スプレッドシートURLからIDを抽出 */
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/** 列文字を列番号に変換（A=1, B=2, ...） */
function columnToIndex(col: string): number {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 64);
  }
  return index - 1; // 0-indexed
}

/** セル値を文字列として取得 */
function getCellString(row: any[], colLetter: string): string | null {
  const idx = columnToIndex(colLetter);
  const value = row[idx];
  if (value === undefined || value === null || value === '') return null;
  return String(value).trim();
}

/** セル値を数値として取得 */
function getCellNumber(row: any[], colLetter: string): number | null {
  const str = getCellString(row, colLetter);
  if (!str) return null;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/** セル値を日付として取得 */
function getCellDate(row: any[], colLetter: string): Date | null {
  const value = row[columnToIndex(colLetter)];
  if (!value) return null;

  // 既にDateオブジェクトの場合
  if (value instanceof Date) return value;

  // シリアル値の場合（Excelの日付形式）
  if (typeof value === 'number') {
    // Excelのシリアル値を変換
    const date = new Date((value - 25569) * 86400 * 1000);
    return date;
  }

  // 文字列の場合
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/** スプレッドシートの全シート名を取得 */
async function getSheetNames(spreadsheetId: string): Promise<string[]> {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets.properties.title',
  });

  return response.data.sheets?.map(s => s.properties?.title || '') || [];
}

/** スプレッドシートからデータを読み取る */
async function readSheetData(
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  const sheets = await getSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'SERIAL_NUMBER',
  });
  return response.data.values || [];
}

// ===================
// 利用者一覧シート読み取り（フォーカス/フレキシブル用）
// ===================

/**
 * 利用者一覧シートを読み取る
 * @param spreadsheetUrl 利用者一覧シートのURL
 */
export async function readMemberListSheet(
  spreadsheetUrl: string
): Promise<MemberListSheet> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  if (!spreadsheetId) {
    throw new Error('Invalid spreadsheet URL');
  }

  // プラン種別を取得（C3セル）
  const planData = await readSheetData(spreadsheetId, '利用者情報管理!C3');
  const planTypeStr = planData[0]?.[0];
  const planType = parsePlanType(planTypeStr);

  if (!planType || planType === 'ENTRY') {
    throw new Error(`Invalid or unsupported plan type: ${planTypeStr}`);
  }

  // 利用者データを取得（6行目から）
  const memberData = await readSheetData(spreadsheetId, '利用者情報管理!A6:T100');

  const columns = planType === 'FOCUS'
    ? FOCUS_MEMBER_LIST_COLUMNS
    : FLEXIBLE_MEMBER_LIST_COLUMNS;

  const members: MemberInfo[] = [];

  for (const row of memberData) {
    const id = getCellString(row, columns.id);
    const name = getCellString(row, columns.name);
    const spreadsheetUrl = getCellString(row, columns.spreadsheetUrl);

    // 必須フィールドがない場合はスキップ
    if (!id || !name) continue;

    // 選択ゲームを取得
    const selectedGames: string[] = [];
    if (planType === 'FOCUS') {
      const g1 = getCellString(row, columns.game1);
      const g2 = getCellString(row, columns.game2);
      if (g1) selectedGames.push(g1);
      if (g2) selectedGames.push(g2);
    } else {
      // フレキシブル
      const flexCols = columns as typeof FLEXIBLE_MEMBER_LIST_COLUMNS;
      const games = [
        getCellString(row, flexCols.game1),
        getCellString(row, flexCols.game2),
        getCellString(row, flexCols.game3),
        getCellString(row, flexCols.game4),
        getCellString(row, flexCols.game5),
      ];
      selectedGames.push(...games.filter((g): g is string => g !== null));
    }

    const sheetTypeStr = getCellString(row, columns.sheetType);
    const withdrawnStr = getCellString(row, columns.withdrawn);

    members.push({
      id,
      name,
      startDate: getCellDate(row, columns.startDate),
      spreadsheetUrl: spreadsheetUrl || '',
      sheetType: sheetTypeStr === '簡易版' ? 'simple' : 'normal',
      selectedGames,
      backupGame: getCellString(row, columns.backupGame),
      disease: getCellString(row, columns.disease) || undefined,
      daysPerWeek: getCellNumber(row, columns.daysPerWeek) || undefined,
      isWithdrawn: withdrawnStr === '離脱' || withdrawnStr === 'TRUE',
      withdrawnDate: getCellDate(row, columns.withdrawnDate),
    });
  }

  return {
    planType,
    members,
  };
}

// ===================
// 体調記録表読み取り（フォーカス/フレキシブル用）
// ===================

/**
 * 利用者の体調記録を読み取る
 * @param spreadsheetUrl 利用者のセルフモニタリングシートURL
 * @param year 対象年
 * @param month 対象月
 */
export async function readHealthRecords(
  spreadsheetUrl: string,
  year: number,
  month: number
): Promise<HealthRecordRow[]> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  if (!spreadsheetId) {
    throw new Error('Invalid spreadsheet URL');
  }

  const sheetName = `${year}.${String(month).padStart(2, '0')}体調記録表`;

  try {
    // 7行目〜40行目を読み取り（1ヶ月分）、AN列（業務報告）まで含める
    const data = await readSheetData(spreadsheetId, `'${sheetName}'!A7:AN40`);

    const records: HealthRecordRow[] = [];

    for (const row of data) {
      const date = getCellDate(row, HEALTH_RECORD_COLUMNS.date);
      if (!date) continue;

      records.push({
        date,
        mood: parseMood(getCellString(row, HEALTH_RECORD_COLUMNS.mood)),
        emotions: getCellString(row, HEALTH_RECORD_COLUMNS.emotions),
        emotionContext: getCellString(row, HEALTH_RECORD_COLUMNS.emotionContext),
        fatigueLevel: getCellNumber(row, HEALTH_RECORD_COLUMNS.fatigueLevel),
        sleepHours: getCellNumber(row, HEALTH_RECORD_COLUMNS.sleepHours),
        sleepMinutes: getCellNumber(row, HEALTH_RECORD_COLUMNS.sleepMinutes),
        totalSleepHours: getCellNumber(row, HEALTH_RECORD_COLUMNS.totalSleep),
        workReport: getCellString(row, HEALTH_RECORD_COLUMNS.workReport),
      });
    }

    return records;
  } catch (error) {
    // シートが存在しない場合は空配列を返す
    console.warn(`Sheet not found: ${sheetName}`, error);
    return [];
  }
}

/**
 * 利用者の月次体調記録を取得
 */
export async function getMonthlyHealthRecords(
  member: MemberInfo,
  year: number,
  month: number
): Promise<MonthlyHealthRecords> {
  const records = await readHealthRecords(member.spreadsheetUrl, year, month);

  return {
    year,
    month,
    memberId: member.id,
    memberName: member.name,
    records,
  };
}

// ===================
// ゲームプレイ記録表読み取り（フォーカス/フレキシブル用）
// ===================

/**
 * 利用者のゲームプレイ記録を読み取る
 * @param spreadsheetUrl 利用者のセルフモニタリングシートURL
 * @param year 対象年
 * @param month 対象月
 *
 * スプレッドシート構造:
 * - 行3: ゲーム名（C列以降、各ゲームが複数列を使用）
 * - 行7以降: データ行（B列=日付、C列以降=各ゲームのデータ）
 * - 1行 = 1日の記録、各ゲームのスコアが横に並ぶ
 */
export async function readGamePlayRecords(
  spreadsheetUrl: string,
  year: number,
  month: number
): Promise<GamePlayRecordRow[]> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  if (!spreadsheetId) {
    throw new Error('Invalid spreadsheet URL');
  }

  const sheetName = `${year}.${String(month).padStart(2, '0')}ゲームプレイ記録表`;

  try {
    // ヘッダー行（ゲーム名）を取得（行3）
    const headerData = await readSheetData(
      spreadsheetId,
      `'${sheetName}'!C3:T3`
    );
    const rawGameNames = headerData[0] || [];

    // ゲーム名とその開始列インデックスをマッピング
    // 空でないセルがゲーム名、その位置が開始列
    const gameColumns: { name: string; startIndex: number }[] = [];
    for (let i = 0; i < rawGameNames.length; i++) {
      const name = rawGameNames[i];
      if (name && typeof name === 'string' && name.trim() !== '') {
        gameColumns.push({ name: name.trim(), startIndex: i });
      }
    }

    // データ行を取得（7行目〜、B列から）
    const data = await readSheetData(spreadsheetId, `'${sheetName}'!B7:T100`);

    const records: GamePlayRecordRow[] = [];

    for (const row of data) {
      // B列（インデックス0）が日付
      const date = getCellDate(row, 'A');
      if (!date) continue;

      // 各ゲームの列にデータがあるかチェック
      for (let g = 0; g < gameColumns.length; g++) {
        const game = gameColumns[g];
        const nextGame = gameColumns[g + 1];

        // このゲームの列範囲（C列が row[1] なので +1）
        const startCol = game.startIndex + 1;
        const endCol = nextGame ? nextGame.startIndex + 1 : row.length;

        // この範囲にデータがあればプレイしたとみなす
        let hasData = false;
        const gameData: Record<string, any> = {};

        for (let col = startCol; col < endCol && col < row.length; col++) {
          const value = row[col];
          if (value !== undefined && value !== null && value !== '') {
            hasData = true;
            gameData[`col${col}`] = value;
          }
        }

        if (hasData) {
          records.push({
            date,
            gameName: game.name,
            gameData,
          });
        }
      }
    }

    return records;
  } catch (error) {
    console.warn(`Sheet not found: ${sheetName}`, error);
    return [];
  }
}

/**
 * 利用者の月次ゲームプレイ記録を取得
 */
export async function getMonthlyGamePlayRecords(
  member: MemberInfo,
  year: number,
  month: number
): Promise<MonthlyGamePlayRecords> {
  const records = await readGamePlayRecords(member.spreadsheetUrl, year, month);

  return {
    year,
    month,
    memberId: member.id,
    memberName: member.name,
    records,
  };
}

// 特別列名（ゲームではなくテキスト入力欄）
const REFLECTION_COLUMN_NAMES = [
  '出来た事/達成した事',
  '出来たこと',
  '達成したこと',
  '難しかった事',
  '難しかったこと',
  '本日の通所',
];

/**
 * 日次振り返り記録を読み取る（ゲームプレイ記録表から）
 * @param spreadsheetUrl 利用者のセルフモニタリングシートURL
 * @param year 対象年
 * @param month 対象月
 */
export async function readDailyReflections(
  spreadsheetUrl: string,
  year: number,
  month: number
): Promise<DailyReflectionRow[]> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  if (!spreadsheetId) {
    throw new Error('Invalid spreadsheet URL');
  }

  const sheetName = `${year}.${String(month).padStart(2, '0')}ゲームプレイ記録表`;

  try {
    // ヘッダー行（ゲーム名）を取得（行3）- 広範囲で取得
    const headerData = await readSheetData(
      spreadsheetId,
      `'${sheetName}'!C3:Z3`
    );
    const rawHeaders = headerData[0] || [];

    // 「出来た事/達成した事」と「難しかった事」の列インデックスを探す
    let achievedColIndex = -1;
    let difficultColIndex = -1;

    for (let i = 0; i < rawHeaders.length; i++) {
      const header = rawHeaders[i];
      if (header && typeof header === 'string') {
        const trimmed = header.trim();
        if (trimmed.includes('出来た事') || trimmed.includes('達成した事') || trimmed.includes('出来たこと')) {
          achievedColIndex = i;
        }
        if (trimmed.includes('難しかった事') || trimmed.includes('難しかったこと')) {
          difficultColIndex = i;
        }
      }
    }

    if (achievedColIndex === -1 && difficultColIndex === -1) {
      return [];
    }

    // データ行を取得（7行目〜、B列から）
    const data = await readSheetData(spreadsheetId, `'${sheetName}'!B7:Z100`);

    const reflections: DailyReflectionRow[] = [];

    for (const row of data) {
      // B列（インデックス0）が日付
      const date = getCellDate(row, 'A');
      if (!date) continue;

      // 出来たこと（C列が row[1] なので +1）
      const achievedTasks = achievedColIndex >= 0 ?
        (row[achievedColIndex + 1] !== undefined && row[achievedColIndex + 1] !== null && row[achievedColIndex + 1] !== ''
          ? String(row[achievedColIndex + 1]).trim()
          : null)
        : null;

      // 難しかったこと
      const difficultTasks = difficultColIndex >= 0 ?
        (row[difficultColIndex + 1] !== undefined && row[difficultColIndex + 1] !== null && row[difficultColIndex + 1] !== ''
          ? String(row[difficultColIndex + 1]).trim()
          : null)
        : null;

      // どちらかのデータがある場合のみ追加
      if (achievedTasks || difficultTasks) {
        reflections.push({
          date,
          achievedTasks,
          difficultTasks,
        });
      }
    }

    return reflections;
  } catch (error) {
    console.warn(`Sheet not found or error reading reflections: ${sheetName}`, error);
    return [];
  }
}

// ===================
// エントリープラン用
// ===================

/**
 * エントリープランの選択ゲーム一覧を読み取る
 * @param spreadsheetUrl 施設のゲームプレイ記録シートURL
 */
export async function readEntryPlanGameSelection(
  spreadsheetUrl: string
): Promise<EntryPlanGameSelection> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  if (!spreadsheetId) {
    throw new Error('Invalid spreadsheet URL');
  }

  const data = await readSheetData(spreadsheetId, '選択ゲーム一覧!B4:E4');
  const row = data[0] || [];

  return {
    game1: row[0] || '',
    game2: row[1] || '',
    game3: row[2] || '',
    backupGame: row[3] || null,
  };
}

/**
 * エントリープランのゲームプレイ記録を読み取る（施設全体）
 * @param spreadsheetUrl 施設のゲームプレイ記録シートURL
 * @param year 対象年
 * @param month 対象月
 */
export async function readEntryPlanGamePlayRecords(
  spreadsheetUrl: string,
  year: number,
  month: number
): Promise<MonthlyFacilityGamePlayRecords> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  if (!spreadsheetId) {
    throw new Error('Invalid spreadsheet URL');
  }

  const sheetName = `${year}.${String(month).padStart(2, '0')}ゲームプレイ記録表`;

  try {
    // データ行を取得（7行目〜）
    const data = await readSheetData(spreadsheetId, `'${sheetName}'!B7:T103`);

    const records: GamePlayRecordRow[] = [];
    let currentDate: Date | null = null;

    for (const row of data) {
      // 日付列をチェック（B列 = インデックス0）
      const dateValue = row[0];
      if (dateValue) {
        if (typeof dateValue === 'number') {
          currentDate = new Date((dateValue - 25569) * 86400 * 1000);
        } else if (dateValue instanceof Date) {
          currentDate = dateValue;
        } else if (typeof dateValue === 'string') {
          const parsed = new Date(dateValue);
          if (!isNaN(parsed.getTime())) {
            currentDate = parsed;
          }
        }
      }

      if (!currentDate) continue;

      // プレイしたゲーム名（C列 = インデックス1）
      const playedGame = row[1];
      if (!playedGame) continue;

      // ゲームデータを収集（D列以降）
      const gameData: Record<string, any> = {};
      for (let i = 2; i < row.length; i++) {
        const value = row[i];
        if (value !== undefined && value !== null && value !== '') {
          gameData[`col${i + 2}`] = value; // D列=col4, E列=col5, ...
        }
      }

      records.push({
        date: currentDate,
        gameName: String(playedGame),
        gameData,
      });
    }

    return {
      year,
      month,
      facilityId: spreadsheetId,
      records,
      totalPlayCount: records.length,
    };
  } catch (error) {
    console.warn(`Sheet not found: ${sheetName}`, error);
    return {
      year,
      month,
      facilityId: spreadsheetId,
      records: [],
      totalPlayCount: 0,
    };
  }
}

// ===================
// 便利関数
// ===================

/**
 * 利用可能なシート（年月）一覧を取得
 * @param spreadsheetUrl スプレッドシートURL
 * @param type 'health' | 'game'
 */
export async function getAvailableMonths(
  spreadsheetUrl: string,
  type: 'health' | 'game'
): Promise<{ year: number; month: number }[]> {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  if (!spreadsheetId) {
    throw new Error('Invalid spreadsheet URL');
  }

  const sheetNames = await getSheetNames(spreadsheetId);
  const suffix = type === 'health' ? '体調記録表' : 'ゲームプレイ記録表';

  const months: { year: number; month: number }[] = [];

  for (const name of sheetNames) {
    if (name.endsWith(suffix)) {
      const parsed = parseSheetNameDate(name);
      if (parsed) {
        months.push(parsed);
      }
    }
  }

  // 年月順にソート
  months.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  return months;
}
