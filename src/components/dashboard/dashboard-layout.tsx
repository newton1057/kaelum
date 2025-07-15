'use client';

import { Bar, BarChart, Line, LineChart, Pie, PieChart, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BrainCircuit, Clock, HeartPulse, Users } from 'lucide-react';

const modelUsageData = [
  { model: 'Axón', queries: 186, fill: 'var(--color-axon)' },
  { model: 'Soma', queries: 125, fill: 'var(--color-soma)' },
];

const patientDistributionData = [
    { name: '0-18', value: 8, fill: 'var(--color-a)' },
    { name: '19-35', value: 15, fill: 'var(--color-b)' },
    { name: '36-55', value: 22, fill: 'var(--color-c)' },
    { name: '56+', value: 12, fill: 'var(--color-d)' },
];


const weeklyActivityData = [
  { date: 'Lun', queries: 32 },
  { date: 'Mar', queries: 45 },
  { date: 'Mié', queries: 28 },
  { date: 'Jue', queries: 56 },
  { date: 'Vie', queries: 61 },
  { date: 'Sáb', queries: 25 },
  { date: 'Dom', queries: 30 },
];

const chartConfig = {
    queries: {
      label: 'Consultas',
    },
    axon: {
      label: 'Axón',
      color: 'hsl(var(--chart-1))',
    },
    soma: {
      label: 'Soma',
      color: 'hsl(var(--chart-2))',
    },
};

export default function DashboardLayout() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <h1 className="text-2xl font-bold tracking-tight">Dashboard de Actividad</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Totales</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">311</div>
            <p className="text-xs text-muted-foreground">+20.1% desde el último mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+57</div>
            <p className="text-xs text-muted-foreground">+12.2% desde la última semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisión del Modelo</CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.3%</div>
            <p className="text-xs text-muted-foreground">Promedio de ambos modelos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-muted-foreground">Promedio por consulta</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad de la Última Semana</CardTitle>
            <CardDescription>Número de consultas procesadas por día.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart
                data={weeklyActivityData}
                margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
              >
                 <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="queries"
                  type="monotone"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={true}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Uso por Modelo</CardTitle>
            <CardDescription>Comparativa de consultas por modelo de IA.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={modelUsageData} layout="vertical" margin={{ left: -20 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" dataKey="queries" hide />
                <YAxis
                  dataKey="model"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="queries" radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Distribución de Pacientes</CardTitle>
                <CardDescription>Distribución de los pacientes por grupo de edad.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[250px] w-full">
                    <PieChart>
                         <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                            />
                        <Pie
                            data={patientDistributionData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
