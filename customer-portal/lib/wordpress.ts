/**
 * WordPress REST API ユーティリティ
 *
 * RevelAppのWordPressサイトからコンテンツを取得するためのヘルパー関数
 */

const WORDPRESS_API_URL = 'https://customer-portal.revelapp.jp/wp-json/wp/v2';

export interface WordPressPage {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media: number;
  parent: number;
  menu_order: number;
}

export interface WordPressFeaturedImage {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
  };
}

/**
 * slugでページを取得
 * @param slug ページのslug
 * @returns WordPressページデータ
 */
export async function getPageBySlug(slug: string): Promise<WordPressPage | null> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/pages?slug=${encodeURIComponent(slug)}`,
      {
        next: { revalidate: 3600 }, // 1時間キャッシュ
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch page with slug: ${slug}`, response.status);
      return null;
    }

    const pages: WordPressPage[] = await response.json();

    if (pages.length === 0) {
      return null;
    }

    return pages[0];
  } catch (error) {
    console.error('Error fetching WordPress page:', error);
    return null;
  }
}

/**
 * すべてのページを取得（サポートページ一覧用）
 * @returns WordPressページ配列
 */
export async function getAllPages(): Promise<WordPressPage[]> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/pages?per_page=100&orderby=menu_order&order=asc`,
      {
        next: { revalidate: 3600 }, // 1時間キャッシュ
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch pages', response.status);
      return [];
    }

    const pages: WordPressPage[] = await response.json();
    return pages;
  } catch (error) {
    console.error('Error fetching WordPress pages:', error);
    return [];
  }
}

/**
 * 親ページIDでページを絞り込み
 * @param parentId 親ページID (0 = トップレベル)
 * @returns WordPressページ配列
 */
export async function getPagesByParent(parentId: number = 0): Promise<WordPressPage[]> {
  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/pages?parent=${parentId}&per_page=100&orderby=menu_order&order=asc`,
      {
        next: { revalidate: 3600 }, // 1時間キャッシュ
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch pages with parent: ${parentId}`, response.status);
      return [];
    }

    const pages: WordPressPage[] = await response.json();
    return pages;
  } catch (error) {
    console.error('Error fetching WordPress pages by parent:', error);
    return [];
  }
}

/**
 * アイキャッチ画像を取得
 * @param mediaId メディアID
 * @returns 画像データ
 */
export async function getFeaturedImage(mediaId: number): Promise<WordPressFeaturedImage | null> {
  if (!mediaId) return null;

  try {
    const response = await fetch(
      `${WORDPRESS_API_URL}/media/${mediaId}`,
      {
        next: { revalidate: 86400 }, // 24時間キャッシュ（画像は変更頻度が低い）
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch media: ${mediaId}`, response.status);
      return null;
    }

    const media: WordPressFeaturedImage = await response.json();
    return media;
  } catch (error) {
    console.error('Error fetching WordPress media:', error);
    return null;
  }
}

/**
 * HTMLコンテンツからプレーンテキストを抽出（excerpt用）
 * @param html HTMLコンテンツ
 * @param maxLength 最大文字数
 * @returns プレーンテキスト
 */
export function extractPlainText(html: string, maxLength: number = 150): string {
  // HTMLタグを削除
  const text = html.replace(/<[^>]*>/g, '');

  // HTML entities をデコード
  const decoded = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // 空白文字を正規化
  const normalized = decoded.replace(/\s+/g, ' ').trim();

  // 最大文字数でカット
  if (normalized.length > maxLength) {
    return normalized.substring(0, maxLength) + '...';
  }

  return normalized;
}
