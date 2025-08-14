'use client';

// This layout is minimal and just passes children through.
// The actual layout with sidebar etc. is handled by the page component itself
// for routes like /general and /chat, to manage their specific state.

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
