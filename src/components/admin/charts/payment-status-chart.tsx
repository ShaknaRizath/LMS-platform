"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "var(--chart-3)",
  VERIFIED: "var(--chart-4)",
  REJECTED: "var(--destructive)",
};

const chartConfig = {
  count: { label: "Payments" },
} satisfies ChartConfig;

export function PaymentStatusChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  const chartData = data.map((item) => ({
    status: STATUS_LABELS[item.status] ?? item.status,
    count: item.count,
    fill: STATUS_COLORS[item.status] ?? "var(--chart-1)",
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={6} />
      </BarChart>
    </ChartContainer>
  );
}
