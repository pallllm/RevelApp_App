"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LifeBuoy,
  MessageSquare,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

const faqs = [
  {
    question: "ゲームの変更はどのように申請しますか？",
    answer: "契約情報ページから「変更申請」ボタンをクリックして申請できます。",
  },
  {
    question: "工賃の振込日はいつですか？",
    answer: "毎月25日に前月分の工賃が振り込まれます。",
  },
  {
    question: "利用者を追加したい場合は？",
    answer: "契約情報ページから利用者追加申請を行ってください。",
  },
  {
    question: "メンテナンス予定の確認方法は？",
    answer: "ホームページの通知エリアに表示されます。",
  },
];

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

export default function SupportPage() {
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>よくある申請</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              asChild
            >
              <a href="/app/contract">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">変更申請</p>
                    <p className="text-sm text-muted-foreground">
                      契約内容の変更申請
                    </p>
                  </div>
                </div>
              </a>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto py-4"
              asChild
            >
              <a href="/app/members">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">利用者追加</p>
                    <p className="text-sm text-muted-foreground">
                      新規利用者の追加申請
                    </p>
                  </div>
                </div>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>よくあるご質問</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b last:border-0 pb-4 last:pb-0"
              >
                <p className="font-semibold mb-2">{faq.question}</p>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 gap-2">
            すべてのFAQを見る
            <ExternalLink className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>リソース</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <a
              href="#"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">ユーザーガイド</p>
                  <p className="text-sm text-muted-foreground">
                    基本的な使い方
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
            <a
              href="#"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">契約書類</p>
                  <p className="text-sm text-muted-foreground">
                    契約関連ドキュメント
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
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
