/**
 * Google API認証ユーティリティ
 */

import { google } from 'googleapis';

/**
 * サービスアカウント認証を取得
 */
export function getGoogleAuth() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set');
  }

  try {
    const credentials = JSON.parse(serviceAccountJson);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar.readonly',
      ],
    });

    return auth;
  } catch (error) {
    throw new Error(`Failed to parse Google Service Account credentials: ${error}`);
  }
}

/**
 * Google Drive APIクライアントを取得
 */
export async function getDriveClient() {
  const auth = getGoogleAuth();
  return google.drive({ version: 'v3', auth });
}

/**
 * Google Sheets APIクライアントを取得
 */
export async function getSheetsClient() {
  const auth = getGoogleAuth();
  return google.sheets({ version: 'v4', auth });
}

/**
 * Google Calendar APIクライアントを取得
 */
export async function getCalendarClient() {
  const auth = getGoogleAuth();
  return google.calendar({ version: 'v3', auth });
}
