
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertTriangle, Pencil, BookOpen, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Label } from '../ui/label';
import { EditFieldDialog } from './edit-field-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AccessDeniedDialog } from './access-denied-dialog';

// --- STYLES & CONSTANTS ---
const palette = {
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.6)",
  accent: "#D2F252",
  ink: "#031718",
  border: "rgba(255,255,255,0.1)",
  surface: "#031718",
  danger: "#ff6b6b",
};

interface AddNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patient: { id: string, [key: string]: any } | null;
}

const SKELETON_ITEMS = 5;
const CLINICAL_NOTE_FIELDS = [
  'Notas Generales',
  'Examen mental',
  'Diagnostico presuntivo',
  'Plan de tratamiento',
  'Notas de evolucion',
  'Observaciones adicionales',
];

export function AddNoteDialog({ isOpen, onOpenChange, patient }: AddNoteDialogProps) {
  const [patientData, setPatientData] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAccessDeniedDialogOpen, setIsAccessDeniedDialogOpen] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState<{ key: string; value: any } | null>(null);
  const { toast } = useToast();

  const fetchPatientDetails = async () => {
    if (!patient?.id) return;
    setIsLoading(true);
    setError(null);
    setPatientData(null);
    try {
      const response = await fetch(`https://kaelumapi-866322842519.northamerica-south1.run.app/medicalRecords/getRecord/${patient.id}`);
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
    const storedUserType = localStorage.getItem('userType');
    setUserType(storedUserType);
    if (isOpen && patient?.id) {
      fetchPatientDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, patient]);

  const handleEditClick = (key: string, value: any) => {
    if (userType === 'admin' || userType === 'tertiary' || userType === 'v3' || userType === 'v2') {
      setFieldToEdit({ key, value });
      setIsEditModalOpen(true);
    } else {
      setIsAccessDeniedDialogOpen(true);
    }
  };

  const handleUpdateField = async (key: string, newValue: any) => {
    if (!patient?.id) return;



    const originalValue = patientData ? patientData[key] : '';
    // Optimistic update
    setPatientData(prev => (prev ? { ...prev, [key]: newValue } : null));

    try {
      const response = await fetch(`https://kaelumapi-866322842519.northamerica-south1.run.app/medicalRecords/updateRecord`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: patient.id, key: key, value: newValue }),
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

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={() => onOpenChange(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          display: "grid",
          placeItems: "center",
          padding: "24px 16px",
          zIndex: 10500,
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(1180px, 92vw)",
            maxHeight: "92vh",
            borderRadius: 22,
            border: `1px solid ${palette.border}`,
            overflow: "hidden",
            boxShadow: "0 30px 120px rgba(0,0,0,0.55)",
            background: "rgba(3,23,24,0.9)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderBottom: `1px solid ${palette.border}`,
              background: "linear-gradient(180deg, rgba(3,23,24,0.65), rgba(3,23,24,0.35))",
              gap: 12,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen className="h-5 w-5" style={{ color: "rgb(233, 255, 208)" }} />
                <div style={{ fontSize: 18, fontWeight: 800, color: "rgb(233, 255, 208)" }}>
                  Notas Clínicas del Paciente
                </div>
              </div>
              <div style={{ fontSize: 13, color: palette.textMuted, marginTop: 4 }}>
                Consulta o edita las secciones de la nota clínica.
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Cerrar"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `1px solid ${palette.border}`,
                background: "rgba(3,23,24,0.65)",
                color: "rgb(233, 255, 208)",
                cursor: "pointer",
                padding: 0,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 flex flex-col p-4">
            <ScrollArea className="h-full pr-4">
              {renderContent()}
            </ScrollArea>
          </div>

          {/* Footer */}
          <div style={{
            padding: "14px 18px",
            borderTop: `1px solid ${palette.border}`,
            display: "flex",
            justifyContent: "flex-end",
            background: "rgba(3,23,24,0.35)",
          }}>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>

      {fieldToEdit && (
        <EditFieldDialog
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          fieldKey={fieldToEdit.key}
          initialValue={fieldToEdit.value}
          onUpdate={handleUpdateField}
        />
      )}
      <AccessDeniedDialog isOpen={isAccessDeniedDialogOpen} onOpenChange={setIsAccessDeniedDialogOpen} />
    </>
  );
}
