import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * 15日締めの反映日を計算する
 * 15日以前の申請 → 翌月1日から反映
 * 15日以降の申請 → 翌々月1日から反映
 */
export function calculateEffectiveDate(): string {
  const today = new Date();
  const day = today.getDate();

  let effectiveDate = new Date(today);

  if (day <= 15) {
    // 15日以前の申請 → 翌月1日
    effectiveDate.setMonth(effectiveDate.getMonth() + 1);
    effectiveDate.setDate(1);
  } else {
    // 15日以降の申請 → 翌々月1日
    effectiveDate.setMonth(effectiveDate.getMonth() + 2);
    effectiveDate.setDate(1);
  }

  const year = effectiveDate.getFullYear();
  const month = String(effectiveDate.getMonth() + 1).padStart(2, '0');
  const date = String(effectiveDate.getDate()).padStart(2, '0');

  return `${year}年${month}月${date}日`;
}

/**
 * 申請期限（今月15日）を過ぎているかチェック
 */
export function isAfterDeadline(): boolean {
  const today = new Date();
  return today.getDate() > 15;
}
