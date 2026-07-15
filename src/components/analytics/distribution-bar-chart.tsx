"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  count: { label: "Count" },
} satisfies ChartConfig;

export function DistributionBarChart({
  data,
  xKey,
  color = "var(--chart-1)",
}: {
  data: Record<string, string | number>[];
  xKey: string;
  color?: string;
}) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={6} fill={color} />
      </BarChart>
    </ChartContainer>
  );
}
