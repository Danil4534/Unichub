import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { CardContent } from "./card";
import { type ChartConfig, ChartContainer } from "./chart";
import { cn } from "../../lib/utils";

const chartConfig = {
  groups: {
    label: "Groups",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;
type RadialChartProps = {
  count: number;
  label: string;
  className?: string;
};

export const RadialChart: React.FC<RadialChartProps> = ({ ...props }) => {
  const chartData = [
    {
      name: props.label,
      visitors: props.count,
      fill: "var(--color-safari)",
    },
  ];

  const maxCount = 100;
  const dynamicAngle = Math.min((props.count / maxCount) * 360, 360);

  return (
    <CardContent className={cn(props.className)}>
      <ChartContainer
        config={chartConfig}
        style={{ width: 230, height: 230 }}
        className=" aspect-square max-h-[240px]"
      >
        <RadialBarChart
          data={chartData}
          startAngle={0}
          endAngle={dynamicAngle}
          innerRadius={80}
          outerRadius={110}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-muted last:fill-background"
            polarRadius={[86, 74]}
          />
          <RadialBar dataKey="visitors" background cornerRadius={10} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
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
                        className="fill-foreground text-4xl font-bold font-k2d"
                      >
                        {chartData[0]?.visitors}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 24}
                        className="fill-muted-foreground font-k2d text-lg mt-1"
                      >
                        {props.label}
                      </tspan>
                    </text>
                  );
                }
              }}
            />
          </PolarRadiusAxis>
        </RadialBarChart>
      </ChartContainer>
    </CardContent>
  );
};
