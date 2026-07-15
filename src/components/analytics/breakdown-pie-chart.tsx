"use client";

import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

export function BreakdownPieChart({
  data,
  labels,
  colors,
  fallbackColor = "var(--chart-5)",
}: {
  data: { status: string; count: number }[];
  labels: Record<string, string>;
  colors: Record<string, string>;
  fallbackColor?: string;
}) {
  const chartConfig = Object.fromEntries(
    data.map((item) => [
      item.status,
      { label: labels[item.status] ?? item.status, color: colors[item.status] ?? fallbackColor },
    ])
  ) satisfies ChartConfig;

  const chartData = data.map((item) => ({
    status: item.status,
    count: item.count,
    fill: colors[item.status] ?? fallbackColor,
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
        <Pie data={chartData} dataKey="count" nameKey="status" innerRadius={50} strokeWidth={2} />
        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
      </PieChart>
    </ChartContainer>
  );
}
