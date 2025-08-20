
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { FileText, UserPlus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface NewConsultationTypeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectType: (type: 'general' | 'screening') => void;
}

export function NewConsultationTypeDialog({
  isOpen,
  onOpenChange,
  onSelectType,
}: NewConsultationTypeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Tipo de Consulta</DialogTitle>
          <DialogDescription>
            Elige el tipo de consulta que deseas iniciar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <Card
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={() => onSelectType('general')}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <UserPlus className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Consulta General</CardTitle>
                <CardDescription>
                  Inicia una nueva consulta registrando los datos de un paciente.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
          <Card
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={() => onSelectType('screening')}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Cuestionario de Tamizaje Adultos</CardTitle>
                <CardDescription>
                  Realiza una evaluación inicial estandarizada.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
