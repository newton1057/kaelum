
'use client';

import { useState, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp, File as FileIcon, X, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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

interface ImportPatientsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImportSuccess: () => void;
}

const ALLOWED_FILE_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export function ImportPatientsDialog({ isOpen, onOpenChange, onImportSuccess }: ImportPatientsDialogProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (selectedFile: File) => {
    if (ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      toast({
        variant: 'destructive',
        title: 'Formato de archivo no válido',
        description: 'Por favor, selecciona un archivo de Excel (.xls o .xlsx).',
      });
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);

    const formData = new FormData();
    formData.append('excel', file);

    try {
      const response = await fetch('https://kaelumapi-866322842519.northamerica-south1.run.app/medicalRecords/uploadExcel', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: '¡Todo ok!',
          description: `El archivo "${file.name}" se ha importado correctamente.`,
        });
        onImportSuccess();
        handleClose();
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast({
          variant: 'destructive',
          title: 'Error en la importación',
          description: errorData.message || 'Ocurrió un error al procesar el archivo.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error de Red',
        description: 'No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setIsDraggingOver(false);
    onOpenChange(false);
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={handleClose}
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
            width: "min(600px, 92vw)", // Slightly smaller for this specific dialog as it has less content
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
              <div style={{ fontSize: 18, fontWeight: 800, color: "rgb(233, 255, 208)" }}>
                Importar Pacientes desde Excel
              </div>
              <div style={{ fontSize: 13, color: palette.textMuted }}>
                Arrastra y suelta un archivo .xls o .xlsx en el área de abajo.
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
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
          <div className="flex-1 min-h-0 flex flex-col p-6">
            <div
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-64 rounded-lg border-2 border-dashed transition-colors",
                isDraggingOver ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileIcon className="h-12 w-12 text-primary" />
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/80"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                  <FileUp className="h-12 w-12" />
                  <p>Arrastra tu archivo aquí</p>
                  <p className="text-xs">o</p>
                  <Button variant="outline" size="sm" asChild className="bg-transparent border-white/20 text-white hover:bg-white/10">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Seleccionar Archivo
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => e.target.files && handleFileChange(e.target.files[0])} />
                    </label>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            padding: "14px 18px",
            borderTop: `1px solid ${palette.border}`,
            display: "flex",
            justifyContent: "flex-end",
            background: "rgba(3,23,24,0.35)",
            gap: 8,
          }}>
            <Button variant="outline" onClick={handleClose} disabled={isLoading} className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
              Cancelar
            </Button>
            <Button onClick={handleImport} disabled={!file || isLoading} className="bg-[#D2F252] text-black hover:bg-[#c5e640]">
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Importando...' : 'Importar'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
