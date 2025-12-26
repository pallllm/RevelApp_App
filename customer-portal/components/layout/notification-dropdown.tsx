"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, X, CheckCheck, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "success":
      return <CheckCheck className="h-5 w-5 text-green-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getNotificationBgColor = (type: NotificationType) => {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200";
    case "warning":
      return "bg-yellow-50 border-yellow-200";
    case "error":
      return "bg-red-50 border-red-200";
    default:
      return "bg-blue-50 border-blue-200";
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "たった今";
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  return date.toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
};

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 通知データを取得
  useEffect(() => {
    fetchNotifications();
  }, []);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // TODO: 実際のfacilityIdを取得する（現在はダミー）
      const facilityId = "test-facility-id";
      const response = await fetch(`/api/notifications?facilityId=${facilityId}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ベルアイコンボタン */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </Button>

      {/* ドロップダウン */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-semibold text-gray-900">通知</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500">{unreadCount}件の未読通知</p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 通知一覧 */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm">読み込み中...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">新しい通知はありません</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 transition-colors",
                      !notification.read && "bg-blue-50/50"
                    )}
                  >
                    {notification.link ? (
                      <Link
                        href={notification.link}
                        onClick={() => setIsOpen(false)}
                        className="block"
                      >
                        <NotificationContent notification={notification} />
                      </Link>
                    ) : (
                      <NotificationContent notification={notification} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* フッター */}
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50 text-center">
              <button
                onClick={() => {
                  // TODO: すべて既読にする機能
                  setIsOpen(false);
                }}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                すべて既読にする
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationContent({ notification }: { notification: Notification }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 mb-1">
          {notification.title}
        </p>
        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
        <p className="text-xs text-gray-400">
          {formatTimestamp(notification.timestamp)}
        </p>
      </div>
      {!notification.read && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        </div>
      )}
    </div>
  );
}
