import { BrainCircuit } from 'lucide-react';
import type { SVGProps } from 'react';

export function BotAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
      <BrainCircuit className="h-6 w-6" {...props} />
    </div>
  );
}

export function AppLogo() {
  return <h1 className="text-lg font-bold text-primary">SynapseAI</h1>;
}
