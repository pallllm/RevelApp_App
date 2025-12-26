"use client";

import { Search } from "lucide-react";
import { NotificationDropdown } from "./notification-dropdown";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="検索..."
              className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
}
