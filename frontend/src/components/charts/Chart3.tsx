"use client"

import { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

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
  ChartTooltipContent,
} from "@/components/ui/chart"

interface Chart3Props {
  selectedHost: string
}

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

export function Chart3({ selectedHost }: Chart3Props) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>("avg_latency")

  useEffect(() => {
    if (selectedHost) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`http://localhost:8000/api/test/${selectedHost}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          })
          setChartData(response.data)
        } catch (error) {
          console.error("Erro ao buscar dados do gráfico:", error)
        }
      }

      fetchData()
    }
  }, [selectedHost])

  const average = useMemo(() => {
    if (chartData.length === 0) {
      return { avg_latency: 0, load_time: 0 }; // Retorna 0 se não houver dados
    }
  
    const total = {
      avg_latency: chartData.reduce((acc, curr) => acc + curr.avg_latency, 0),
      load_time: chartData.reduce((acc, curr) => acc + curr.load_time, 0),
    };
  
    return {
      avg_latency: total.avg_latency / chartData.length, // Calcula a média
      load_time: total.load_time / chartData.length,     // Calcula a média
    };
  }, [chartData]);

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
                  {average[chart].toFixed(2)}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ResponsiveContainer width="100%" height={400}>
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => value}
              />
              <YAxis />
              <Tooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(value) => value}
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
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}