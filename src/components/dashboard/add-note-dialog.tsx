
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle, Pencil, BookOpen } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { EditFieldDialog } from './edit-field-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AddNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patientId: string | null;
}

const SKELETON_ITEMS = 5;
const CLINICAL_NOTE_FIELDS = [
  'Examen mental',
  'Diagnostico presuntivo',
  'Plan de tratamiento',
  'Notas de evolucion',
  'Observaciones adicionales',
];

export function AddNoteDialog({ isOpen, onOpenChange, patientId }: AddNoteDialogProps) {
  const [patientData, setPatientData] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState<{ key: string; value: any } | null>(null);
  const { toast } = useToast();

  const fetchPatientDetails = async () => {
    if (!patientId) return;
    setIsLoading(true);
    setError(null);
    setPatientData(null);
    try {
      const response = await fetch(`https://kaelumapi-866322842519.northamerica-south1.run.app/medicalRecords/getRecord/${patientId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener los detalles del paciente.');
      }
      const result = await response.json();
      setPatientData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientDetails();
    }
  }, [isOpen, patientId]);

  const handleEditClick = (key: string, value: any) => {
    setFieldToEdit({ key, value });
    setIsEditModalOpen(true);
  };

  const handleUpdateField = async (key: string, newValue: any) => {
    if (!patientId) return;

    const originalValue = patientData ? patientData[key] : '';
    // Optimistic update
    setPatientData(prev => (prev ? { ...prev, [key]: newValue } : null));

    try {
      const response = await fetch(`https://kaelumapi-866322842519.northamerica-south1.run.app/medicalRecords/updateRecord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: patientId, key: key, value: newValue }),
      });

      if (!response.ok) {
        throw new Error('La API retornó un error al actualizar.');
      }

      await response.json();
      // No toast here, it's in the edit dialog
    } catch (error: any) {
      // Revert on error
      setPatientData(prev => (prev ? { ...prev, [key]: originalValue } : null));
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: error.message || 'No se pudo guardar el campo.',
      });
    } finally {
      setIsEditModalOpen(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          {Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!patientData) {
      return <p className="text-muted-foreground text-center">No hay datos para mostrar.</p>;
    }

    return (
      <div className="space-y-4">
        {CLINICAL_NOTE_FIELDS.map(fieldKey => {
          const value = patientData[fieldKey] || '';
          return (
            <div key={fieldKey} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor={fieldKey} className="font-semibold capitalize text-base">
                  {fieldKey.replace(/_/g, ' ')}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditClick(fieldKey, value)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </div>
              <div
                onClick={() => handleEditClick(fieldKey, value)} 
                className={cn(
                  "min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-pre-wrap cursor-pointer transition-colors hover:bg-muted/50",
                   !value && "text-muted-foreground"
                )}
              >
                {value || 'No hay información registrada. Haz clic para añadir.'}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <DialogTitle className="text-xl">Notas Clínicas del Paciente</DialogTitle>
            </div>
            <DialogDescription>
              Consulta o edita las secciones de la nota clínica. Los cambios se guardan individualmente al hacer clic en "Actualizar" en la ventana de edición.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-6 -mr-6">
            <ScrollArea className="h-full pr-6">
              {renderContent()}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {fieldToEdit && (
        <EditFieldDialog
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          fieldKey={fieldToEdit.key}
          initialValue={fieldToEdit.value}
          onUpdate={handleUpdateField}
        />
      )}
    </>
  );
}

