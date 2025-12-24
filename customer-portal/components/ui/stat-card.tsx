"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  color?: "purple" | "blue" | "green" | "orange" | "red" | "cyan";
}

const colorClasses = {
  purple: "bg-purple-500/10 text-purple-600",
  blue: "bg-blue-500/10 text-blue-600",
  green: "bg-green-500/10 text-green-600",
  orange: "bg-orange-500/10 text-orange-600",
  red: "bg-red-500/10 text-red-600",
  cyan: "bg-cyan-500/10 text-cyan-600",
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "purple",
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", colorClasses[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={cn(
                "text-xs font-medium",
                trend.value >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
