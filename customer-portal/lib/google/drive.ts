/**
 * Google Drive操作ユーティリティ
 */

import { getDriveClient } from './auth';

/**
 * 新しいフォルダを作成
 *
 * @param name フォルダ名
 * @param parentFolderId 親フォルダID（オプション）
 * @returns フォルダID
 */
export async function createFolder(name: string, parentFolderId?: string): Promise<string> {
  const drive = await getDriveClient();

  const folderMetadata: any = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentFolderId) {
    folderMetadata.parents = [parentFolderId];
  }

  const response = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id, webViewLink',
  });

  if (!response.data.id) {
    throw new Error('Failed to create folder');
  }

  return response.data.id;
}

/**
 * フォルダのWebリンクを取得
 */
export async function getFolderUrl(folderId: string): Promise<string> {
  const drive = await getDriveClient();

  const response = await drive.files.get({
    fileId: folderId,
    fields: 'webViewLink',
  });

  return response.data.webViewLink || '';
}

/**
 * スプレッドシートをコピー
 *
 * @param templateId テンプレートのスプレッドシートID
 * @param newName 新しいスプレッドシート名
 * @param destinationFolderId 保存先フォルダID
 * @returns コピーしたスプレッドシートのID
 */
export async function copySpreadsheet(
  templateId: string,
  newName: string,
  destinationFolderId: string
): Promise<{ id: string; url: string }> {
  const drive = await getDriveClient();

  const response = await drive.files.copy({
    fileId: templateId,
    requestBody: {
      name: newName,
      parents: [destinationFolderId],
    },
    fields: 'id, webViewLink',
  });

  if (!response.data.id || !response.data.webViewLink) {
    throw new Error('Failed to copy spreadsheet');
  }

  return {
    id: response.data.id,
    url: response.data.webViewLink,
  };
}

/**
 * ファイルを削除
 */
export async function deleteFile(fileId: string): Promise<void> {
  const drive = await getDriveClient();
  await drive.files.delete({ fileId });
}

/**
 * ファイル名を変更
 */
export async function renameFile(fileId: string, newName: string): Promise<void> {
  const drive = await getDriveClient();
  await drive.files.update({
    fileId,
    requestBody: { name: newName },
  });
}
