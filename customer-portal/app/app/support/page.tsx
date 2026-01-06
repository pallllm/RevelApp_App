import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LifeBuoy,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { getAllPages, extractPlainText } from "@/lib/wordpress";
import { sanitizeExcerpt } from "@/lib/sanitize";

const supportChannels = [
  {
    icon: Mail,
    title: "メールサポート",
    description: "support@revelapp.example.com",
    availability: "24時間受付・営業日内に返信",
    color: "blue",
  },
  {
    icon: Phone,
    title: "電話サポート",
    description: "0120-XXX-XXX",
    availability: "平日 9:00-18:00",
    color: "green",
  },
  {
    icon: MessageSquare,
    title: "チャットサポート",
    description: "リアルタイムでご相談",
    availability: "平日 10:00-17:00",
    color: "purple",
  },
];

export default async function SupportPage() {
  // WordPressからページ一覧を取得
  const pages = await getAllPages();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">サポート</h1>
        <p className="text-muted-foreground">
          お困りの際はお気軽にお問い合わせください
        </p>
      </div>

      {/* Support Channels */}
      <div className="grid gap-4 md:grid-cols-3">
        {supportChannels.map((channel, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div
                className={`h-12 w-12 rounded-lg bg-${channel.color}-500/10 flex items-center justify-center mb-3`}
              >
                <channel.icon className={`h-6 w-6 text-${channel.color}-600`} />
              </div>
              <CardTitle className="text-lg">{channel.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold mb-2">{channel.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {channel.availability}
              </div>
              <Button className="w-full mt-4" variant="outline">
                お問い合わせ
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RevelApp Documentation from WordPress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            RevelAppについて
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            ゲーム一覧、使い方、マニュアルなど
          </p>
        </CardHeader>
        <CardContent>
          {pages.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/app/support/${page.slug}`}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="flex-shrink-0 mt-1">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium group-hover:text-primary transition-colors line-clamp-1">
                      {page.title.rendered}
                    </p>
                    {page.excerpt.rendered && (
                      <p
                        className="text-sm text-muted-foreground mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeExcerpt(page.excerpt.rendered),
                        }}
                      />
                    )}
                    {!page.excerpt.rendered && page.content.rendered && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {extractPlainText(page.content.rendered, 100)}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>現在、ドキュメントを読み込んでいます...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>よくある申請</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Link
              href="/app/requests"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold">変更申請</p>
                <p className="text-sm text-muted-foreground">
                  契約内容の変更申請
                </p>
              </div>
            </Link>
            <Link
              href="/app/members"
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold">利用者管理</p>
                <p className="text-sm text-muted-foreground">
                  利用者情報の確認・管理
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Contact Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <LifeBuoy className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-semibold text-primary">
                お困りの際はお気軽にご連絡ください
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                運営チームが迅速にサポートいたします。緊急の場合は電話サポートをご利用ください。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
