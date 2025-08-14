'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/dashboard/stat-card';
import { ConsultationsChart } from '@/components/dashboard/consultations-chart';
import { FocusChart } from '@/components/dashboard/focus-chart';
import { Activity, User, Users } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (!isAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Consultas Totales"
          value="1,234"
          description="+20.1% desde el último mes"
          icon={Activity}
        />
        <StatCard
          title="Pacientes Únicos"
          value="573"
          description="+12.2% desde el último mes"
          icon={Users}
        />
        <StatCard
          title="Tasa de Adherencia"
          value="85%"
          description="+5% desde el último mes"
          icon={User}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <ConsultationsChart />
        </div>
        <div className="col-span-3">
          <FocusChart />
        </div>
      </div>
    </div>
  );
}
