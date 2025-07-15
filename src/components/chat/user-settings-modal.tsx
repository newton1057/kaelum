'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, Trash2, User } from 'lucide-react';
import { useState } from 'react';

interface UserSettingsModalProps {
  onDeleteAllChats: () => void;
}

export function UserSettingsModal({
  onDeleteAllChats,
}: UserSettingsModalProps) {
  const [open, setOpen] = useState(false);
  const memoryUsage = 40; // Mocked value

  const handleConfirmDelete = () => {
    onDeleteAllChats();
    setOpen(false); // Close the dialog after deletion
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button>
          <Avatar>
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

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium leading-none flex items-center gap-2 text-destructive">
                  <Trash2 size={16} />
                  Borrar Datos
                </h4>
                <p className="text-sm text-muted-foreground">
                  Esta acción eliminará permanentemente todas tus
                  conversaciones. No se puede deshacer.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 size={16} />
                      Borrar todos los chats
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Estás absolutamente seguro?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto borrará
                        permanentemente todo tu historial de chats de nuestros
                        servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleConfirmDelete}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Sí, borrar todo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="profile">
            <div className="py-4">
              <p className="text-sm text-muted-foreground text-center">
                La configuración del perfil estará disponible próximamente.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
