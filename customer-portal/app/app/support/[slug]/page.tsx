import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, AlertCircle } from "lucide-react";
import { getPageBySlug, getFeaturedImage, getAllPages } from "@/lib/wordpress";
import { sanitizeHTML } from "@/lib/sanitize";

interface PageProps {
  params: {
    slug: string;
  };
}

/**
 * 静的生成のためのパスを生成
 * すべてのWordPressページのslugを取得
 */
export async function generateStaticParams() {
  const pages = await getAllPages();

  return pages.map((page) => ({
    slug: page.slug,
  }));
}

/**
 * 個別サポート記事ページ
 */
export default async function SupportArticlePage({ params }: PageProps) {
  const { slug } = params;

  // WordPressからページを取得
  const page = await getPageBySlug(slug);

  // ページが見つからない場合は404
  if (!page) {
    notFound();
  }

  // アイキャッチ画像を取得（存在する場合）
  const featuredImage = page.featured_media
    ? await getFeaturedImage(page.featured_media)
    : null;

  // コンテンツをサニタイズ
  const sanitizedContent = sanitizeHTML(page.content.rendered);

  // 日付をフォーマット
  const publishedDate = new Date(page.date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const modifiedDate = new Date(page.modified).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/app/support">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          サポートページに戻る
        </Button>
      </Link>

      {/* Article Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {page.title.rendered}
        </h1>

        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>公開: {publishedDate}</span>
          </div>
          {page.date !== page.modified && (
            <div className="flex items-center gap-2">
              <span>更新: {modifiedDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Featured Image */}
      {featuredImage && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={featuredImage.source_url}
            alt={featuredImage.alt_text || page.title.rendered}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Article Content */}
      <Card>
        <CardContent className="pt-6">
          <div
            className="prose prose-slate max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-foreground prose-p:leading-7
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-muted prose-pre:border
              prose-img:rounded-lg prose-img:shadow-md
              prose-ul:list-disc prose-ol:list-decimal
              prose-li:text-foreground
              prose-table:border-collapse
              prose-th:border prose-th:bg-muted prose-th:p-2
              prose-td:border prose-td:p-2
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
              prose-hr:border-border
            "
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </CardContent>
      </Card>

      {/* Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">
                この記事についてご不明な点がございましたら
              </p>
              <p className="text-sm text-blue-800 mt-1">
                サポートページからお気軽にお問い合わせください。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
