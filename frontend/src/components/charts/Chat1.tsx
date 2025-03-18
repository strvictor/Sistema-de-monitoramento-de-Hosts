"use client";

import { useEffect, useState } from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import api from "@/axiosConfig";

interface StatusData {
  time: string;
  status_code: string;
  count: number;
}

interface ChartItem {
  status: string;
  count: number;
  fill: string;
}

interface Chart1Props {
  selectedHost: string;
}

const chartConfig: ChartConfig = {
  count: {
    label: "Requisições",
    color: "hsl(var(--primary))",
  },
  "200": {
    label: "Status 200",
    color: "#004800", // Verde escuro
  },
  "204": {
    label: "Status 204",
    color: "#556B2F", // Verde oliva escuro
  },
  "400": {
    label: "Status 400",
    color: "#8B0000", // Vermelho escuro
  },
  "500": {
    label: "Status 500",
    color: "#2E004E", // Índigo escuro
  },
} satisfies ChartConfig;

export function Chart1({ selectedHost }: Chart1Props) {
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedHost) {
        try {
          const response = await api.get<StatusData[]>(
            `test-status/${selectedHost}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );

          // Agrupa os dados por status_code e soma os counts
          const groupedData = response.data.reduce(
            (acc: { [key: string]: number }, curr) => {
              if (!acc[curr.status_code]) {
                acc[curr.status_code] = 0;
              }
              acc[curr.status_code] += curr.count;
              return acc;
            },
            {}
          );

          // Transforma os dados agrupados no formato do gráfico
          const transformedData: ChartItem[] = Object.entries(groupedData).map(
            ([status, count]) => ({
              status,
              count: count as number,
              fill:
                status === "200"
                  ? "#004800"
                  : status === "204"
                  ? "#556B2F"
                  : status === "400"
                  ? "#8B0000"
                  : "#2E004E",
            })
          );

          setChartData(transformedData);
          const total = transformedData.reduce(
            (acc, curr) => acc + curr.count,
            0
          );
          setTotalRequests(total);
        } catch (error) {
          console.error("Erro ao buscar dados de status:", error);
        }
      }
    };

    fetchData();
  }, [selectedHost]);

  return (
    <Card className="flex flex-col h-full text-white">
      <CardHeader className="items-center pb-0">
        <CardTitle>Status Code das Requisições</CardTitle>
        <CardDescription>Distribuição dos códigos de status</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex justify-center items-center">
        <ChartContainer
          config={chartConfig}
          className="w-full flex justify-center items-center"
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
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="80%"
              stroke="none"
            >
              <Label
                content={({ viewBox }) => {
                  if (!viewBox) return null;
                  const { cx, cy } = viewBox as unknown as {
                    cx: number;
                    cy: number;
                  };
                  return (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={cx}
                        y={cy - 10}
                        className="fill-white text-3xl font-bold"
                      >
                        {totalRequests}
                      </tspan>
                      <tspan x={cx} y={cy + 15} className="fill-gray-400">
                        Requisições
                      </tspan>
                    </text>
                  );
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
        <div className="leading-none text-gray-400">
          Mostrando a distribuição dos códigos de status
        </div>
      </CardFooter>
    </Card>
  );
}
