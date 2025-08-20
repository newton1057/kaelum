
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
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';

const screeningSchema = z.object({
  curp: z.string().min(18, {
    message: 'La CURP debe tener 18 caracteres.',
  }).max(18, {
    message: 'La CURP debe tener 18 caracteres.',
  }),
});

type ScreeningFormValues = z.infer<typeof screeningSchema>;

interface ScreeningQuestionnaireDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: ScreeningFormValues) => void;
}

export function ScreeningQuestionnaireDialog({
  isOpen,
  onOpenChange,
  onSubmit,
}: ScreeningQuestionnaireDialogProps) {
  const form = useForm<ScreeningFormValues>({
    resolver: zodResolver(screeningSchema),
    defaultValues: {
      curp: '',
    },
  });

  const handleFormSubmit = (values: ScreeningFormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cuestionario de Tamizaje Adultos</DialogTitle>
          <DialogDescription>
            Introduce la CURP del paciente para iniciar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="curp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CURP</FormLabel>
                  <FormControl>
                    <Input placeholder="Introduce la CURP de 18 caracteres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <a
              href="https://consultas.curp.gob.mx/CurpSP/gobmx/inicio.jsp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
            >
              <Info className="mr-2 h-4 w-4" />
              Consulta tu CURP aquí
            </a>
            <DialogFooter>
              <Button type="submit">Iniciar Cuestionario</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
