
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface EditFieldDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  fieldKey: string;
  initialValue: any;
  onUpdate: (key: string, value: any) => void;
}

export function EditFieldDialog({
  isOpen,
  onOpenChange,
  fieldKey,
  initialValue,
  onUpdate,
}: EditFieldDialogProps) {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCurrentValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const hasChanged = currentValue !== initialValue;

  const handleUpdate = () => {
    onUpdate(fieldKey, currentValue);
    toast({
        title: "Campo actualizado",
        description: `El campo "${fieldKey}" se ha actualizado correctamente.`,
    })
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Campo: {fieldKey.replace(/_/g, ' ')}</DialogTitle>
          <DialogDescription>
            Modifica el valor del campo y haz clic en Actualizar para guardar los cambios.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="field-value" className="text-right">
              Valor
            </Label>
            <Textarea
              id="field-value"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="col-span-3 h-32"
            />
          </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={!hasChanged}>
                Actualizar
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    