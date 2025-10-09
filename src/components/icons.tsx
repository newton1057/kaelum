import { BrainCircuit, File, TestTube2 } from 'lucide-react';
import type { SVGProps } from 'react';
import Image from 'next/image';

export function BotAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
      <BrainCircuit className="h-6 w-6" {...props} />
    </div>
  );
}

export function AppLogo() {
  return (
    <Image
      src="https://firebasestorage.googleapis.com/v0/b/aurora-4e980.appspot.com/o/resourcesPDFima%2Fisotipo.png?alt=media&token=9e26011a-0031-42ba-a365-f6f025b0690e"
      alt="MentalBeat logo"
      width={32}
      height={32}
      className="h-8 w-8"
    />
  );
}

export function FileIcon(props: SVGProps<SVGSVGElement>) {
  return <File {...props} />;
}
