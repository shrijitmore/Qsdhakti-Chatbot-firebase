"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp } from 'lucide-react';

interface ChartDisplayProps {
  type: 'line' | 'bar';
  data: any[];
  title: string;
}

const lineChartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

const barChartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

export function ChartDisplay({ type, data, title }: ChartDisplayProps) {
  const chartConfig = type === 'line' ? lineChartConfig : barChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{type === 'line' ? 'Time-series view of parameter readings.' : 'Distribution of parameter values.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          {type === 'line' ? (
            <LineChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
              <YAxis domain={['dataMin - 0.1', 'dataMax + 0.1']} hide />
              <Tooltip cursor={false} content={<ChartTooltipContent indicator="line" hideLabel />} />
              <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={true} />
            </LineChart>
          ) : (
            <BarChart data={data} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="value" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis />
                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

interface RunChartStatsProps {
    stats: {
        min: string;
        max: string;
        avg: string;
        count: number;
    }
}

export function RunChartStats({ stats }: RunChartStatsProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Parameter Analysis</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Average</p>
                        <p className="font-semibold text-lg">{stats.avg}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Min Reading</p>
                        <p className="font-semibold text-lg">{stats.min}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Max Reading</p>
                        <p className="font-semibold text-lg">{stats.max}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Data Points</p>
                        <p className="font-semibold text-lg">{stats.count}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
