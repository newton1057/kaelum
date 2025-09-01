
'use client';

// This layout is minimal and just passes children through.
// The actual layout with sidebar etc. is handled by the parent layout
// for this route.

export default function ExpedientesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
