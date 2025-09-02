
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

const noteFormSchema = z.object({
  mentalExam: z.string().min(1, 'Este campo es requerido.'),
  presumptiveDiagnosis: z.string().min(1, 'Este campo es requerido.'),
  treatmentPlan: z.string().min(1, 'Este campo es requerido.'),
  evolutionNotes: z.string().min(1, 'Este campo es requerido.'),
  additionalObservations: z.string().optional(),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

interface AddNoteDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  patientId: string | null;
}

export function AddNoteDialog({ isOpen, onOpenChange, patientId }: AddNoteDialogProps) {
  const { toast } = useToast();
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      mentalExam: '',
      presumptiveDiagnosis: '',
      treatmentPlan: '',
      evolutionNotes: '',
      additionalObservations: '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const handleFormSubmit = (values: NoteFormValues) => {
    console.log({ patientId, ...values });
    toast({
      title: 'Nota guardada',
      description: 'La nota clínica se ha guardado correctamente.',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Añadir Nota Clínica</DialogTitle>
          <DialogDescription>
            Rellene los campos para añadir una nueva nota al expediente del paciente.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-6 -mr-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="mentalExam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Examen mental</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describa el examen mental..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="presumptiveDiagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnóstico presuntivo</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describa el diagnóstico presuntivo..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="treatmentPlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan de tratamiento</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describa el plan de tratamiento..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="evolutionNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas de evolución</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describa las notas de evolución..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="additionalObservations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones adicionales (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Añada cualquier observación adicional..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <DialogFooter className="pt-4 sticky bottom-0 bg-background">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                  <Button type="submit">Guardar Nota</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
