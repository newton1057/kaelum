'use client';

import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  className?: string;
}

export default function DashboardLayout({ className }: DashboardLayoutProps) {
  return (
    <div className={cn('p-4 h-full', className)}>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Aquí irán tus dashboards.
      </p>
    </div>
  );
}
