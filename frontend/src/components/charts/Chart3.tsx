"use client";

import * as React from "react";
import api from "@/axiosConfig";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Chart3Props {
  selectedHost: string;
}

interface ChartData {
  time: string;
  avg_latency: number;
  load_time: number;
}

const chartConfig = {
  avg_latency: {
    label: "Latência Média",
    color: "hsl(var(--primary))",
  },
  load_time: {
    label: "Tempo de Carregamento",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig;

export function Chart3({ selectedHost }: Chart3Props) {
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("avg_latency");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedHost) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/test/${selectedHost}`);
        setChartData(response.data);
      } catch (err) {
        console.error("Erro ao buscar dados do gráfico:", err);
        setError("Erro ao carregar os dados");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedHost]);

  const average = React.useMemo(() => {
    if (chartData.length === 0) return { avg_latency: 0, load_time: 0 };

    const total = {
      avg_latency: chartData.reduce((acc, curr) => acc + curr.avg_latency, 0),
      load_time: chartData.reduce((acc, curr) => acc + curr.load_time, 0),
    };

    return {
      avg_latency: total.avg_latency / chartData.length,
      load_time: total.load_time / chartData.length,
    };
  }, [chartData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro ao Carregar Dados</CardTitle>
        </CardHeader>
        <CardContent>{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Métricas de Performance</CardTitle>
          <CardDescription>Monitoramento em tempo real do host</CardDescription>
        </div>
        <div className="flex">
          {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map(
            (key) => (
              <button
                key={key}
                data-active={activeChart === key}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[key].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {average[key].toFixed(2)}ms
                </span>
              </button>
            )
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[400px] w-full"
        >
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={(value) => `${value}ms`}
            />
            <ChartTooltip
              content={<ChartTooltipContent className="w-[200px]" />}
            />
            <Line
              type="monotone"
              dataKey={activeChart}
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
