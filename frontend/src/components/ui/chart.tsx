import * as React from "react";
import { ResponsiveContainer, Tooltip, TooltipProps } from "recharts";

import { cn } from "@/lib/utils";

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactElement;
}

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
        className
      )}
      style={
        {
          "--color-avg_latency": config.avg_latency?.color,
          "--color-load_time": config.load_time?.color,
        } as React.CSSProperties
      }
      {...props}
    >
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  );
}

interface ChartTooltipContentProps
  extends Omit<TooltipProps<number, string>, "content"> {
  className?: string;
  hideLabel?: boolean;
}

export function ChartTooltipContent({
  className,
  hideLabel,
  active,
  payload,
  label,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn("rounded-lg border bg-background p-2 shadow-sm", className)}
    >
      <div className="grid gap-2">
        {!hideLabel && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Tempo: {label}</div>
            </div>
          </div>
        )}
        <div className="grid gap-1">
          {payload.map((data) => (
            <div key={data.dataKey} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: data.color }}
              />
              <div className="text-sm text-muted-foreground">
                {data.name}: {data.value?.toFixed(2)}ms
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const ChartTooltip = Tooltip;
