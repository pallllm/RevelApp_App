"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconTileProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  color?: "purple" | "blue" | "green" | "orange" | "red" | "cyan";
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

const colorClasses = {
  purple: {
    bg: "bg-purple-500",
    light: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-300",
  },
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-300",
  },
  green: {
    bg: "bg-green-500",
    light: "bg-green-100",
    text: "text-green-600",
    border: "border-green-300",
  },
  orange: {
    bg: "bg-orange-500",
    light: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-300",
  },
  red: {
    bg: "bg-red-500",
    light: "bg-red-100",
    text: "text-red-600",
    border: "border-red-300",
  },
  cyan: {
    bg: "bg-cyan-500",
    light: "bg-cyan-100",
    text: "text-cyan-600",
    border: "border-cyan-300",
  },
};

export function IconTile({
  icon: Icon,
  title,
  description,
  color = "purple",
  onClick,
  selected = false,
  disabled = false,
}: IconTileProps) {
  const colors = colorClasses[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all",
        "hover:shadow-lg hover:-translate-y-1",
        selected
          ? `${colors.border} ${colors.light} shadow-md`
          : "border-gray-200 bg-white hover:border-gray-300",
        disabled && "opacity-50 cursor-not-allowed hover:shadow-none hover:translate-y-0",
        "text-center"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-16 h-16 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
          selected ? colors.bg : colors.light
        )}
      >
        <Icon
          className={cn(
            "w-8 h-8 transition-colors",
            selected ? "text-white" : colors.text
          )}
        />
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-semibold text-sm mb-1",
          selected ? colors.text : "text-gray-900"
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 line-clamp-2">{description}</p>
      )}

      {/* Selected indicator */}
      {selected && (
        <div
          className={cn(
            "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center",
            colors.bg
          )}
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      )}
    </button>
  );
}
