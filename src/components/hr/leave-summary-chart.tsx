"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: COORDINATOR_PALETTE[3].accent,
  APPROVED: COORDINATOR_PALETTE[0].accent,
  REJECTED: COORDINATOR_PALETTE[2].accent,
};

const chartConfig = {
  count: { label: "Leave requests" },
} satisfies ChartConfig;

export function LeaveSummaryChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  const chartData = data.map((item) => ({
    status: STATUS_LABELS[item.status] ?? item.status,
    count: item.count,
    fill: STATUS_COLORS[item.status] ?? COORDINATOR_PALETTE[1].accent,
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
