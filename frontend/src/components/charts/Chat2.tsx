// "use client"

// import { useState, useEffect } from "react"
// import { TrendingUp } from "lucide-react"
// import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"

// // Definir a interface para os dados da API
// interface ChartData {
//   time: string
//   avg_latency: number
//   load_time: number
// }

// const chartConfig: ChartConfig = {
//   avg_latency: {
//     label: "Latência Média",
//     color: "hsl(var(--chart-1))",
//   },
//   load_time: {
//     label: "Tempo de Carregamento",
//     color: "hsl(var(--chart-2))",
//   },
// }

// export function Chart2() {
//   const [chartData, setChartData] = useState<ChartData[]>([])

//   // Aqui você pode simular a atribuição de dados diretamente no estado ou vir de uma API
//   useEffect(() => {
//     // Exemplo de dados fictícios
//     setChartData([
//       { time: "10:00", avg_latency: 50, load_time: 120 },
//       { time: "10:30", avg_latency: 55, load_time: 130 },
//       { time: "11:00", avg_latency: 60, load_time: 140 },
//       // Mais dados podem ser adicionados aqui
//     ])
//   }, [])

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Latência e Tempo de Carregamento</CardTitle>
//         <CardDescription>Dados dos últimos períodos</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <AreaChart
//             data={chartData}
//             margin={{
//               left: 12,
//               right: 12,
//             }}
//           >
//             <div>

//               <CartesianGrid vertical={false} />
//               <XAxis
//                 dataKey="time"
//                 tickLine={false}
//                 axisLine={false}
//                 tickMargin={8}
//               />
//               <YAxis />
//               <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
//               <defs>
//                 <linearGradient id="fillLatency" x1="0" y1="0" x2="0" y2="1">
//                   <stop
//                     offset="5%"
//                     stopColor="var(--color-avg_latency)"
//                     stopOpacity={0.8}
//                   />
//                   <stop
//                     offset="95%"
//                     stopColor="var(--color-avg_latency)"
//                     stopOpacity={0.1}
//                   />
//                 </linearGradient>
//                 <linearGradient id="fillLoadTime" x1="0" y1="0" x2="0" y2="1">
//                   <stop
//                     offset="5%"
//                     stopColor="var(--color-load_time)"
//                     stopOpacity={0.8}
//                   />
//                   <stop
//                     offset="95%"
//                     stopColor="var(--color-load_time)"
//                     stopOpacity={0.1}
//                   />
//                 </linearGradient>
//               </defs>
//               <Area
//                 dataKey="load_time"
//                 type="monotone"
//                 fill="url(#fillLoadTime)"
//                 stroke="var(--color-load_time)"
//               />
//               <Area
//                 dataKey="avg_latency"
//                 type="monotone"
//                 fill="url(#fillLatency)"
//                 stroke="var(--color-avg_latency)"
//               />
//             </AreaChart>
//             </div>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter>
//         <div className="flex w-full items-start gap-2 text-sm">
//           <div className="grid gap-2">
//             <div className="flex items-center gap-2 font-medium leading-none">
//               Dados atualizados <TrendingUp className="h-4 w-4" />
//             </div>
//             <div className="flex items-center gap-2 leading-none text-muted-foreground">
//               Últimos períodos registrados
//             </div>
//           </div>
//         </div>
//       </CardFooter>
//     </Card>
//   )
// }
