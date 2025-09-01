'use client';

import { useState, type DragEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileUp, File as FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ImportPatientsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const ALLOWED_FILE_TYPES = [
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export function ImportPatientsDialog({ isOpen, onOpenChange }: ImportPatientsDialogProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
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

  const handleImport = () => {
    if (!file) return;
    // Lógica de importación aquí
    toast({
      title: 'Importación iniciada',
      description: `El archivo "${file.name}" se está procesando.`,
    });
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setIsDraggingOver(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Pacientes desde Excel</DialogTitle>
          <DialogDescription>
            Arrastra y suelta un archivo .xls o .xlsx en el área de abajo, o haz clic para seleccionarlo.
          </DialogDescription>
        </DialogHeader>
        <div 
          className={cn(
            "relative flex flex-col items-center justify-center w-full h-64 rounded-lg border-2 border-dashed transition-colors",
            isDraggingOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <FileIcon className="h-12 w-12 text-primary" />
              <p className="font-semibold">{file.name}</p>
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
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Seleccionar Archivo
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => e.target.files && handleFileChange(e.target.files[0])} />
                </label>
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!file}>
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
