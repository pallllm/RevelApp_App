"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/auth-context";
import {
  LayoutDashboard,
  Users,
  Activity,
  DollarSign,
  FileText,
  LifeBuoy,
  LogOut,
  Gamepad2,
  FileEdit,
} from "lucide-react";

const navigation = [
  {
    name: "ホーム",
    href: "/app",
    icon: LayoutDashboard,
  },
  {
    name: "利用者管理",
    href: "/app/members",
    icon: Users,
  },
  {
    name: "ゲーム管理",
    href: "/app/games",
    icon: Gamepad2,
  },
  {
    name: "体調グラフ",
    href: "/app/health-graph",
    icon: Activity,
  },
  {
    name: "工賃管理",
    href: "/app/rewards",
    icon: DollarSign,
  },
  {
    name: "変更申請",
    href: "/app/requests",
    icon: FileEdit,
  },
  {
    name: "契約情報",
    href: "/app/contract",
    icon: FileText,
  },
  {
    name: "サポート",
    href: "/app/support",
    icon: LifeBuoy,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/app" className="flex items-center">
          <Image
            src="/images/revelapp-logo-horizontal.png"
            alt="RevelApp"
            width={160}
            height={49}
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="mb-4">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            メニュー
          </p>
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
            {user?.facility.name.charAt(0) || "施"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.facility.name || "施設名"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.name || "ユーザー"}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>ログアウト</span>
        </button>
      </div>
    </div>
  );
}
