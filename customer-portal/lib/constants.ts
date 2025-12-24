// ゲームマスタ
export const GAMES = [
  { id: 'gesoten', name: 'ゲソテンバース', level: 1, requiresAnyDesk: true },
  { id: 'elf1', name: 'エルフの森 レベル1', level: 1, requiresAnyDesk: true },
  { id: 'elf2', name: 'エルフの森 レベル2', level: 2, requiresAnyDesk: true },
  { id: 'mcheroes', name: 'マイクリプトヒーローズ', level: 2, requiresAnyDesk: false },
  { id: 'axie-tri', name: 'Axie トライフォース', level: 2, requiresAnyDesk: false },
  { id: 'axie-quest', name: 'Axie クエスト', level: 3, requiresAnyDesk: false },
  { id: 'cryptospells', name: 'クリプトスペルズ', level: 3, requiresAnyDesk: false },
  { id: 'career', name: 'キャリア乙女サバイバー', level: 3, requiresAnyDesk: true },
  { id: 'axie-origin', name: 'Axie Origin', level: 4, requiresAnyDesk: false },
  { id: 'xeno', name: 'XENO', level: 4, requiresAnyDesk: false },
] as const;

// プラン
export const PLANS = {
  ENTRY: { id: 'ENTRY', name: 'エントリーコース' },
  FLEX: { id: 'FLEX', name: 'RevelAppコース A-フレキシブル' },
  FOCUS: { id: 'FOCUS', name: 'RevelAppコース B-フォーカス' },
} as const;

// 年齢帯
export const AGE_BANDS = [
  '10代', '20代', '30代', '40代', '50代', '60代', '70代', '80代以上'
] as const;

// 通所日数
export const ATTENDANCE_DAYS = [
  '1日', '2日', '3日', '4日', '5日', '6日', '7日'
] as const;

// シート形式
export const SHEET_TYPES = {
  NORMAL: '通常版',
  LIGHT: '簡易版',
} as const;

// 導入理由
export const INTRODUCTION_REASONS = [
  '利用者様がゲームが好き',
  '工賃作業に飽き',
  'PC操作未修得',
  '金銭管理が苦手',
  '時間管理が苦手',
  '対外連絡が苦手',
  '体調自己管理が苦手',
  '通所モチベ低下',
  'その他',
] as const;

// ご利用の目的
export const USAGE_GOALS = [
  '急なお休みを減らしたい',
  '自宅から出る一歩目の動機',
  'A型/就労移行/障害者雇用へのステップアップ',
  '工賃作業の効率UP',
  '成功体験/自己肯定感UP',
  '無駄遣い癖改善',
  '工賃作業の時間を守る',
  '休憩を時間通りに取る',
  '支援機関に連絡できるように',
  'スタッフへヘルプサイン',
  '退所の可能性を潰す',
  '通所率を戻す',
  '通所日数を引き上げる',
  'その他',
] as const;

// 口座種別
export const ACCOUNT_TYPES = {
  ORDINARY: '普通',
  CURRENT: '当座',
} as const;

// 支払い方法変更タイプ
export const PAYMENT_CHANGE_TYPES = [
  { id: 'credit-to-bank', label: 'クレカ → 口座振替' },
  { id: 'bank-to-credit', label: '口座振替 → クレカ' },
  { id: 'credit-to-credit', label: 'クレカのままカード変更' },
  { id: 'bank-to-bank', label: '口座振替のまま口座変更' },
] as const;

export type Plan = keyof typeof PLANS;
export type Game = typeof GAMES[number];
export type AgeBand = typeof AGE_BANDS[number];
export type AttendanceDay = typeof ATTENDANCE_DAYS[number];
export type SheetType = keyof typeof SHEET_TYPES;
