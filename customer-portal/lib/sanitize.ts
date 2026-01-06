/**
 * HTML サニタイズユーティリティ
 *
 * WordPressから取得したHTMLコンテンツを安全に表示するための
 * XSS対策サニタイゼーション
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * HTMLコンテンツをサニタイズ
 *
 * @param html サニタイズするHTML文字列
 * @returns サニタイズされたHTML文字列
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    // 許可するタグ
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'em', 'u', 's', 'b', 'i',
      'a', 'img',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'figure', 'figcaption',
      'iframe', // 動画埋め込み用
    ],
    // 許可する属性
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel',
      'src', 'alt', 'width', 'height',
      'class', 'id',
      'style', // Tailwindクラスなどのスタイル
      'frameborder', 'allowfullscreen', // iframe用
    ],
    // 許可するURLスキーム
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    // iframe の src を許可（YouTube等の埋め込み用）
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
  });
}

/**
 * WordPress の excerpt（抜粋）をサニタイズ
 * 基本的なテキストのみ許可
 *
 * @param html サニタイズするHTML文字列
 * @returns サニタイズされたHTML文字列
 */
export function sanitizeExcerpt(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
  });
}
