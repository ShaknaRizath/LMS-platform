"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export function RevenueOverTimeChart({
  data,
  color = "var(--chart-4)",
}: {
  data: { date: string; amount: number }[];
  color?: string;
}) {
  const chartConfig = {
    amount: { label: "Revenue (LKR)", color },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <AreaChart data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="amount"
          type="monotone"
          fill="var(--color-amount)"
          fillOpacity={0.15}
          stroke="var(--color-amount)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
