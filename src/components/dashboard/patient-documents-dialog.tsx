
'use client';

import { useEffect, useState, useRef } from 'react';
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
import { AlertTriangle, Upload, File, Loader, Download } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '../ui/card';

type PatientDocument = {
    name: string;
    url: string;
    contentType: string;
    size: number;
    createdAt: string;
};

interface PatientDocumentsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patient: {
    id: string;
    name: string;
  } | null;
}

const SKELETON_ITEMS = 3;

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export function PatientDocumentsDialog({ isOpen, onOpenChange, patient }: PatientDocumentsDialogProps) {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    if (!patient?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://kaelumapi-866322842519.northamerica-south1.run.app/medicalRecords/getRecord/${patient.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener los documentos del expediente.');
      }
      const result = await response.json();
      // The 'files' property is expected inside the 'data' object.
      const filesList = result.data?.files || [];
      setDocuments(filesList);
    } catch (err: any) {
      setError(err.message);
      setDocuments([]); // Ensure documents are cleared on error
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen && patient?.id) {
      fetchDocuments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, patient]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !patient?.id) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
        const response = await fetch(`https://kaelumapi-866322842519.northamerica-south1.run.app/medicalRecords/uploadDocument/${patient.id}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al subir el documento.');
        }

        toast({
            title: 'Éxito',
            description: 'El documento se ha subido correctamente.',
        });
        fetchDocuments(); // Refresh the list
    } catch (err: any) {
        toast({
            variant: 'destructive',
            title: 'Error de subida',
            description: err.message,
        });
    } finally {
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
             <Skeleton key={index} className="h-16 w-full" />
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

    if (documents.length === 0) {
      return <p className="text-muted-foreground text-center py-8">No hay documentos para este paciente.</p>;
    }

    return (
      <div className="space-y-3">
        {documents.map((doc, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="text-sm font-medium truncate max-w-xs">{doc.name || 'Nombre de archivo no disponible'}</span>
                  <span className="text-xs text-muted-foreground">
                    {doc.size ? formatBytes(doc.size) : 'Tamaño desconocido'} - {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Fecha desconocida'}
                  </span>
                </div>
              </div>
              <Button asChild variant="ghost" size="icon">
                <a href={doc.url} download={doc.name} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Documentos de {patient?.name || 'Paciente'}</DialogTitle>
          <DialogDescription>
            Visualiza y añade documentos al expediente del paciente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
            <ScrollArea className="h-full pr-6">
                {renderContent()}
            </ScrollArea>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={handleFileSelect} disabled={isUploading}>
            {isUploading ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isUploading ? 'Subiendo...' : 'Añadir Documento'}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
