'use client';

import { SidebarInset } from '@/components/ui/sidebar';

export default function DashboardLayout() {
  return (
    <SidebarInset className="flex max-h-svh flex-col p-4">
      <div className="flex-1">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Aquí irán tus dashboards.
        </p>
      </div>
    </SidebarInset>
  );
}
