
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface AccessDeniedDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AccessDeniedDialog({ isOpen, onOpenChange }: AccessDeniedDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/50">
            <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />
          </div>
          <AlertDialogTitle className="text-center">Acceso no permitido</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Tu tipo de usuario no tiene permiso para realizar esta acción. Por favor, contacta a un administrador si crees que esto es un error.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)} className="w-full">
            Entendido
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
