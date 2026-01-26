import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * スケルトンローディングコンポーネント
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("skeleton rounded-md bg-muted", className)}
      aria-hidden="true"
    />
  );
}

/**
 * テキスト用スケルトン
 */
export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

/**
 * カード用スケルトン
 */
export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

/**
 * 統計カード用スケルトン
 */
export function SkeletonStatCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * テーブル行用スケルトン
 */
export function SkeletonTableRow({
  columns = 4,
  className,
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4 py-3", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === 0 ? "w-32" : i === columns - 1 ? "w-16" : "w-24"
          )}
        />
      ))}
    </div>
  );
}

/**
 * リスト用スケルトン
 */
export function SkeletonList({
  items = 3,
  className,
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * ホーム画面用スケルトン
 */
export function SkeletonHomePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ヘッダー */}
      <div className="mb-6">
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* お知らせ */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-4">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="p-4">
          <SkeletonList items={3} />
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* メインコンテンツ */}
      <div className="grid gap-4 md:grid-cols-2">
        <SkeletonCard className="min-h-[300px]" />
        <SkeletonCard className="min-h-[300px]" />
      </div>
    </div>
  );
}

/**
 * 利用者一覧用スケルトン
 */
export function SkeletonMemberList() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
        <div className="p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonTableRow key={i} columns={5} className="border-b last:border-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ゲーム一覧用スケルトン
 */
export function SkeletonGameList() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-6">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
