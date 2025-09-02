
'use client';

import { useEffect, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle, Printer } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';

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
  const contentRef = useRef<HTMLDivElement>(null);

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
  
  const handlePrint = () => {
    if (!contentRef.current) return;

    html2canvas(contentRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const width = pdfWidth - 20; // with margin
      const height = width / ratio;

      let position = 0;
      if (height > pdfHeight) {
         // handle long content, not implemented for brevity
      }
      
      pdf.addImage(imgData, 'PNG', 10, 10, width, height);
      pdf.save(`expediente-${patientData?.Nombre || patientId}.pdf`);
    });
  };


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
      <div ref={contentRef} id="patient-details-content" className="space-y-2 p-2">
        {Object.entries(patientData).map(([key, value]) => (
          <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-x-4 border-b py-2 text-sm">
            <span className="font-semibold text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="md:col-span-2 break-words">{String(value) || 'N/A'}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalles del Expediente</DialogTitle>
          <DialogDescription>
            Información completa del paciente seleccionado.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[65vh] pr-4">
          {renderContent()}
        </ScrollArea>
         <DialogFooter>
          <Button onClick={handlePrint} disabled={isLoading || !!error || !patientData}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
