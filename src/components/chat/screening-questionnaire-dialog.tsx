
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const screeningSchema = z.object({
  curp: z.string().min(18, {
    message: 'La CURP debe tener 18 caracteres.',
  }).max(18, {
    message: 'La CURP debe tener 18 caracteres.',
  }),
  doctor: z.enum(['Dra. Yariela Delgadillo', 'Dr. Carlos Chicalote'], {
    required_error: 'Debes seleccionar un doctor.',
  }),
  channel: z.enum(['Iniciativa propia', 'Trabajo', 'Internet', 'Otro'], {
    required_error: 'Debes seleccionar un canal.',
  }),
  channelOther: z.string().optional(),
}).refine((data) => {
    if (data.channel === 'Otro') {
        return data.channelOther && data.channelOther.length > 0;
    }
    return true;
}, {
    message: 'Por favor, especifica el canal.',
    path: ['channelOther'],
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
      channelOther: '',
    },
  });

  const watchedChannel = form.watch('channel');

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
                  <div className="flex justify-between items-center">
                    <FormLabel>CURP</FormLabel>
                    <a
                      href="https://consultas.curp.gob.mx/CurpSP/gobmx/inicio.jsp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-muted-foreground hover:text-primary"
                    >
                      <Info className="mr-1 h-3 w-3" />
                      Consulta tu CURP aquí
                    </a>
                  </div>
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
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canalizado por:</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Iniciativa propia">Iniciativa propia</SelectItem>
                      <SelectItem value="Trabajo">Trabajo</SelectItem>
                      <SelectItem value="Internet">Internet</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedChannel === 'Otro' && (
                <FormField
                control={form.control}
                name="channelOther"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Especificar canal</FormLabel>
                    <FormControl>
                        <Input placeholder="Especifique..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}
            
            <DialogFooter>
              <Button type="submit">Iniciar Cuestionario</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
