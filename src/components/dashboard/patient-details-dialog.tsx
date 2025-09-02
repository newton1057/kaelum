
'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface PatientDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patientId: string | null;
}

const SKELETON_ITEMS = 15;

export function PatientDetailsDialog({ isOpen, onOpenChange, patientId }: PatientDetailsDialogProps) {
  const [patientData, setPatientData] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && patientId) {
      const fetchPatientDetails = async () => {
        setIsLoading(true);
        setError(null);
        setPatientData(null);
        try {
          const response = await fetch(`https://kaelumapi-703555916890.northamerica-south1.run.app/medicalRecords/getRecord/${patientId}`);
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
      fetchPatientDetails();
    }
  }, [isOpen, patientId]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
            <div key={index} className="grid grid-cols-3 gap-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3 col-span-2" />
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
      <div className="space-y-2">
        {Object.entries(patientData).map(([key, value]) => (
          <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-x-4 border-b py-2 text-sm">
            <span className="font-semibold text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="md:col-span-2">{String(value) || 'N/A'}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Detalles del Expediente</DialogTitle>
          <DialogDescription>
            Información completa del paciente seleccionado.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
