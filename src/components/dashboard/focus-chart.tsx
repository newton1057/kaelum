'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const data = [
  { name: 'Cardiología', value: 400, color: 'hsl(var(--chart-1))' },
  { name: 'Dermatología', value: 300, color: 'hsl(var(--chart-2))' },
  { name: 'Endocrinología', value: 300, color: 'hsl(var(--chart-3))' },
  { name: 'Gastroenterología', value: 200, color: 'hsl(var(--chart-4))' },
  { name: 'Neurología', value: 278, color: 'hsl(var(--chart-5))' },
];

export function FocusChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Áreas de Enfoque de la IA</CardTitle>
        <CardDescription>
          Principales especialidades en las consultas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
