
'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
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
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

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
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

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
          const data = result.data;
          setPatientData(data);
          // Initialize with all fields selected, excluding ones we never want to print like id
          setSelectedFields(Object.keys(data).filter(key => key !== 'id' && key !== 'Marca temporal'));
        } catch (err: any) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPatientDetails();
    }
  }, [isOpen, patientId]);

  const handleFieldSelectionChange = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const handlePrint = () => {
    if (!patientData) return;

    const doc = new jsPDF();
    const margin = 15;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - margin * 2;
    const patientName = patientData.Nombre || 'Desconocido';
    const primaryColor = '#1a1a1a'; 
    const secondaryColor = '#555555';
    const lightGray = '#E5E5E5';

    let y = margin;
    let pageNumber = 1;

    const addHeader = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(primaryColor);
      doc.text('Expediente Clínico', margin, y);
      y += lineHeight * 1.5;
      
      doc.setDrawColor(lightGray);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += lineHeight * 1.5;
    };
    
    const addFooter = () => {
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor);
      doc.text(`Página ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    };

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin - 10) { // check against footer margin
        addFooter();
        doc.addPage();
        pageNumber++;
        y = margin;
        addHeader();
      }
    };
    
    addHeader();

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(secondaryColor);
    doc.text(`Paciente:`, margin, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor);
    doc.text(patientName, margin + 20, y);
    y += lineHeight * 2;

    for (const key of Object.keys(patientData)) {
      if (!selectedFields.includes(key)) continue;

      const value = patientData[key];
      const keyText = `${key.replace(/_/g, ' ')}:`;
      const valueText = String(value) || 'N/A';

      const splitValue = doc.splitTextToSize(valueText, contentWidth - 5);
      const neededHeight = (splitValue.length * lineHeight) + 5;
      
      checkPageBreak(neededHeight);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor);
      doc.text(keyText, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor);
      doc.text(splitValue, margin, y + lineHeight);
      
      y += (splitValue.length * lineHeight) + 5;
    }

    addFooter();
    doc.save(`expediente-${patientName.replace(/\s/g, '_') || patientId}.pdf`);
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

    const fieldsToDisplay = Object.entries(patientData).filter(
      ([key]) => key !== 'id' && key !== 'Marca temporal'
    );

    return (
      <div id="patient-details-content" className="space-y-2 p-2">
        <div className="grid grid-cols-[auto_1fr_2fr] items-center gap-x-4 border-b py-2 text-sm font-bold text-muted-foreground">
          <div />
          <span>Campo</span>
          <span>Valor</span>
        </div>
        {fieldsToDisplay.map(([key, value]) => (
          <div key={key} className="grid grid-cols-[auto_1fr_2fr] items-start gap-x-4 border-b py-2 text-sm">
            <Checkbox
              id={`field-${key}`}
              checked={selectedFields.includes(key)}
              onCheckedChange={() => handleFieldSelectionChange(key)}
              className="mt-1"
            />
            <Label htmlFor={`field-${key}`} className="font-semibold capitalize cursor-pointer">
              {key.replace(/_/g, ' ')}
            </Label>
            <span className="break-words">{String(value) || 'N/A'}</span>
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
            Información completa del paciente. Selecciona los campos que deseas incluir en el PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
          <ScrollArea className="h-full pr-6">
            {renderContent()}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button onClick={handlePrint} disabled={isLoading || !!error || !patientData}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir ({selectedFields.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
