
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const screeningSchema = z.object({
  curp: z.string().min(18, {
    message: 'La CURP debe tener 18 caracteres.',
  }).max(18, {
    message: 'La CURP debe tener 18 caracteres.',
  }),
  doctor: z.enum(['Dra. Yariela Delgadillo', 'Dr. Carlos Chicalote'], {
    required_error: 'Debes seleccionar un doctor.',
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
            <FormField
              control={form.control}
              name="doctor"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Asistiré a consulta con:</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Dra. Yariela Delgadillo" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Dra. Yariela Delgadillo
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Dr. Carlos Chicalote" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Dr. Carlos Chicalote
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
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
