"use client"

import { useEffect, useState } from "react"
import { Label, Pie, PieChart } from "recharts"
import axios from "axios"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface StatusData {
  time: string
  status_code: string
  count: number
}

interface ChartItem {
  status: string
  count: number
  fill: string
}

interface Chart1Props {
  selectedHost: string
}

const chartConfig: ChartConfig = {
  count: {
    label: "Requisições",
  },
  "200": {
    label: "Status 200",
    color: "hsl(var(--chart-1))",
  },
  "204": {
    label: "Status 204",
    color: "hsl(var(--chart-2))",
  },
  "400": {
    label: "Status 400",
    color: "hsl(var(--chart-3))",
  },
  "500": {
    label: "Status 500",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export function Chart1({ selectedHost }: Chart1Props) {
  const [chartData, setChartData] = useState<ChartItem[]>([])
  const [totalRequests, setTotalRequests] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      if (selectedHost) {
        try {
          const response = await axios.get<StatusData[]>(
            `http://localhost:8000/api/test-status/${selectedHost}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          )

          // Agrupa os dados por status_code e soma os counts
          const groupedData = response.data.reduce((acc: { [key: string]: number }, curr) => {
            if (!acc[curr.status_code]) {
              acc[curr.status_code] = 0
            }
            acc[curr.status_code] += curr.count
            return acc
          }, {})

          // Transforma os dados agrupados no formato do gráfico
          const transformedData: ChartItem[] = Object.entries(groupedData).map(([status, count]) => ({
            status,
            count: count as number,
            fill: `var(--color-${status})`,
          }))

          setChartData(transformedData)
          const total = transformedData.reduce((acc, curr) => acc + curr.count, 0)
          setTotalRequests(total)
        } catch (error) {
          console.error("Erro ao buscar dados de status:", error)
        }
      }
    }

    fetchData()
  }, [selectedHost])

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Status das Requisições</CardTitle>
        <CardDescription>Distribuição dos códigos de status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex justify-center items-center">
        <ChartContainer
          config={chartConfig}
          className="aspect-square max-h-[400px] w-full"
        >
          <PieChart width={400} height={400}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="status"
              innerRadius={80}
              outerRadius={160}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalRequests}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Requisições
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total de requisições: {totalRequests}
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando a distribuição dos códigos de status
        </div>
      </CardFooter>
    </Card>
  )
}