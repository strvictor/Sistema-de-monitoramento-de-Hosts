"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Definir a interface para os dados da API
interface ChartData {
  time: string
  avg_latency: number
  load_time: number
}

const chartConfig = {
  avg_latency: {
    label: "Latência Média",
    color: "hsl(var(--chart-1))",
  },
  load_time: {
    label: "Tempo de Carregamento",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function Chart3() {
  const [chartData, setChartData] = React.useState<ChartData[]>([])
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("avg_latency")

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/test/")
        const data: ChartData[] = await response.json()
        setChartData(data)
      } catch (error) {
        console.error("Erro ao buscar dados do gráfico:", error)
      }
    }

    fetchData()
  }, [])

  const total = React.useMemo(
    () => ({
      avg_latency: chartData.reduce((acc, curr) => acc + curr.avg_latency, 0),
      load_time: chartData.reduce((acc, curr) => acc + curr.load_time, 0),
    }),
    [chartData]
  )

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Latência e Tempo de Carregamento</CardTitle>
          <CardDescription>Dados dos últimos períodos</CardDescription>
        </div>
        <div className="flex">
          {["avg_latency", "load_time"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[chart].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("pt-BR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}