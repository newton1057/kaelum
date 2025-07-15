'use client';

import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  className?: string;
}

export default function DashboardLayout({ className }: DashboardLayoutProps) {
  return (
    <div className={cn('p-4 h-full flex-1 flex flex-col', className)}>
      <h1 className="text-2xl font-bold">Dashboard</h1>
    </div>
  );
}
