"use client";

import { PlayCircle } from "lucide-react";

interface VideoGuideProps {
  title: string;
  videoUrl?: string;
  youtubeId?: string;
  description?: string;
}

export function VideoGuide({ title, videoUrl, youtubeId, description }: VideoGuideProps) {
  return (
    <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
          <PlayCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>

      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900">
        {youtubeId ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : videoUrl ? (
          <video
            className="absolute inset-0 w-full h-full"
            controls
            src={videoUrl}
          >
            お使いのブラウザは動画タグをサポートしていません。
          </video>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
            動画を準備中です
          </div>
        )}
      </div>
    </div>
  );
}
