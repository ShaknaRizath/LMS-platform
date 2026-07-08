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

const STATUS_LABELS: Record<string, string> = {
  PAYMENT_PENDING: "Payment pending",
  PENDING: "Awaiting approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  PAYMENT_PENDING: "var(--chart-3)",
  PENDING: "var(--chart-1)",
  APPROVED: "var(--chart-4)",
  REJECTED: "var(--destructive)",
};

export function RegistrationStatusChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  const chartConfig = Object.fromEntries(
    data.map((item) => [
      item.status,
      { label: STATUS_LABELS[item.status] ?? item.status, color: STATUS_COLORS[item.status] },
    ])
  ) satisfies ChartConfig;

  const chartData = data.map((item) => ({
    status: item.status,
    count: item.count,
    fill: STATUS_COLORS[item.status] ?? "var(--chart-5)",
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
