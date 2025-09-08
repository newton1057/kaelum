
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, Info, User, Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface UserProfile {
  fullName: string;
  email: string;
  type: string;
}

export function UserSettingsModal() {
  const [open, setOpen] = useState(false);
  const memoryUsage = 40; // Mocked value
  const { setTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: 'Cargando...',
    email: 'cargando...',
    type: 'Cargando...',
  });

  useEffect(() => {
    if (open) {
      const fullName = localStorage.getItem('userFullName') || 'Usuario Invitado';
      const email = localStorage.getItem('userEmail') || 'No disponible';
      const type = localStorage.getItem('userType') || 'No especificado';
      setUserProfile({ fullName, email, type });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button>
          <Avatar>
            <AvatarImage
              src="https://firebasestorage.googleapis.com/v0/b/aurora-4e980.appspot.com/o/resourcesPDFima%2Fdefault.jpg?alt=media&token=31b50401-b3d0-49c9-b186-6545c413c608"
              alt="User Avatar"
            />
            <AvatarFallback className="bg-primary/20 text-primary">
              <User />
            </AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="preferences">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preferences">Preferencias</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>
          <TabsContent value="preferences">
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium leading-none flex items-center gap-2">
                  Tema de la Aplicación
                </h4>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" onClick={() => setTheme('light')}>
                    <Sun className="mr-2 h-4 w-4" />
                    Claro
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTheme('dark')}>
                    <Moon className="mr-2 h-4 w-4" />
                    Oscuro
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setTheme('high-contrast')}>
                    <Monitor className="mr-2 h-4 w-4" />
                    Alto Contraste
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium leading-none flex items-center gap-2">
                  <BrainCircuit size={16} />
                  Memoria de Contexto
                </h4>
                <p className="text-sm text-muted-foreground">
                  La memoria se utiliza para almacenar información relevante de
                  tus conversaciones pasadas, como tus preferencias, objetivos
                  y datos personales.
                </p>
                <div className="space-y-2">
                  <Progress value={memoryUsage} />
                  <p className="text-xs text-muted-foreground text-right">
                    {memoryUsage}% utilizado
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="profile">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src="https://firebasestorage.googleapis.com/v0/b/aurora-4e980.appspot.com/o/resourcesPDFima%2Fdefault.jpg?alt=media&token=31b50401-b3d0-49c9-b186-6545c413c608"
                  alt="User Avatar"
                />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-xl font-semibold">{userProfile.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {userProfile.email}
                </p>
                <p className="text-sm text-primary">{userProfile.type}</p>
              </div>
              <Separator className="my-4" />
              <div className="text-left w-full space-y-2">
                <h4 className="text-sm font-medium leading-none flex items-center gap-2">
                  <Info size={16} />
                  Principales Usos
                </h4>
                <p className="text-sm text-muted-foreground">
                  Este perfil esta especializado en responder preguntas y proporcionar información exclusivamente dentro del dominio de la medicina.
                </p>
                <p className="text-sm text-muted-foreground">
                  Por ejemplo, puede acceder a información sobre enfermedades y tratamientos, pero no podrá responder a preguntas sobre temas no médicos como finanzas o deportes.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
