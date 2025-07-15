'use client';

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BrainCircuit, Clock, Download, HeartPulse, Users } from 'lucide-react';

const modelUsageData = [
  { model: 'Axón', queries: 186, fill: 'var(--color-axon)' },
  { model: 'Soma', queries: 125, fill: 'var(--color-soma)' },
];

const patientDistributionData = [
    { name: '0-18', value: 8, fill: 'var(--color-ageGroup1)' },
    { name: '19-35', value: 15, fill: 'var(--color-ageGroup2)' },
    { name: '36-55', value: 22, fill: 'var(--color-ageGroup3)' },
    { name: '56+', value: 12, fill: 'var(--color-ageGroup4)' },
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

const appInstallsData = [
  { date: 'Lun', installs: 12 },
  { date: 'Mar', installs: 18 },
  { date: 'Mié', installs: 15 },
  { date: 'Jue', installs: 25 },
  { date: 'Vie', installs: 31 },
  { date: 'Sáb', installs: 10 },
  { date: 'Dom', installs: 8 },
];

const usageByAreaData = [
  { name: 'Cardiología', queries: 75, fill: 'var(--color-cardiology)' },
  { name: 'Dermatología', queries: 62, fill: 'var(--color-dermatology)' },
  { name: 'Endocrinología', queries: 55, fill: 'var(--color-endocrinology)' },
  { name: 'Gastroenterología', queries: 48, fill: 'var(--color-gastroenterology)' },
  { name: 'Neurología', queries: 42, fill: 'var(--color-neurology)' },
  { name: 'Oncología', queries: 35, fill: 'var(--color-oncology)' },
  { name: 'Pediatría', queries: 30, fill: 'var(--color-pediatrics)' },
  { name: 'Farmacología', queries: 85, fill: 'var(--color-pharmacology)' },
  { name: 'Medicina General', queries: 95, fill: 'var(--color-general-medicine)' },
  { name: 'Psiquiatría', queries: 40, fill: 'var(--color-psychiatry)' },
].sort((a, b) => a.queries - b.queries);


const chartConfig = {
    queries: {
      label: 'Consultas',
    },
    installs: {
      label: 'Instalaciones',
      color: 'hsl(var(--chart-2))',
    },
    axon: {
      label: 'Axón',
      color: 'hsl(var(--chart-1))',
    },
    soma: {
      label: 'Soma',
      color: 'hsl(var(--chart-2))',
    },
    ageGroup1: {
        label: '0-18',
        color: 'hsl(var(--chart-1))',
    },
    ageGroup2: {
        label: '19-35',
        color: 'hsl(var(--chart-2))',
    },
    ageGroup3: {
        label: '36-55',
        color: 'hsl(var(--chart-3))',
    },
    ageGroup4: {
        label: '56+',
        color: 'hsl(var(--chart-4))',
    },
    cardiology: { label: 'Cardiología', color: 'hsl(var(--chart-1))' },
    dermatology: { label: 'Dermatología', color: 'hsl(var(--chart-2))' },
    endocrinology: { label: 'Endocrinología', color: 'hsl(var(--chart-3))' },
    gastroenterology: { label: 'Gastroenterología', color: 'hsl(var(--chart-4))' },
    neurology: { label: 'Neurología', color: 'hsl(var(--chart-5))' },
    oncology: { label: 'Oncología', color: 'hsl(var(--chart-1))' }, // Re-using colors for simplicity
    pediatrics: { label: 'Pediatría', color: 'hsl(var(--chart-2))' },
    pharmacology: { label: 'Farmacología', color: 'hsl(var(--chart-3))' },
    'general-medicine': { label: 'Medicina General', color: 'hsl(var(--chart-4))' },
    psychiatry: { label: 'Psiquiatría', color: 'hsl(var(--chart-5))' },
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
            <CardTitle className="text-sm font-medium">Instalaciones de la App</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+119</div>
            <p className="text-xs text-muted-foreground">+15% desde la última semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Respuesta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9.2s</div>
            <p className="text-xs text-muted-foreground">Promedio por consulta</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Instalaciones de la App (Última Semana)</CardTitle>
            <CardDescription>Nuevas instalaciones de la app "ima" por día.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart
                data={appInstallsData}
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
                  tickFormatter={(value) => `${value}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Line
                  dataKey="installs"
                  type="monotone"
                  stroke="var(--color-installs)"
                  strokeWidth={2}
                  dot={true}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Uso de la IA por Área Médica</CardTitle>
                <CardDescription>Distribución de consultas por especialidad.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <BarChart
                        data={usageByAreaData}
                        layout="vertical"
                        margin={{ left: 20, right: 20 }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                        />
                        <XAxis dataKey="queries" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="queries" radius={5} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Distribución de Pacientes</CardTitle>
                <CardDescription>Distribución de los pacientes por grupo de edad.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
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
                            outerRadius={100}
                            label
                        />
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
