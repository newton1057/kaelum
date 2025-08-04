
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { PatientData } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const patientFormSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  age: z.coerce.number().int().positive().optional().or(z.literal('')),
  gender: z.enum(['Masculino', 'Femenino', 'Otro']).optional(),
  medicalHistory: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

interface NewPatientDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: PatientData) => void;
}

const historyChips = [
  'Hipertensión',
  'Diabetes Tipo 2',
  'Asma',
  'Hipotiroidismo',
  'Dislipidemia',
  'ERGE',
  'Ansiedad',
  'Depresión',
  'Migraña',
  'Artritis reumatoide',
  'Osteoartritis',
  'Insuficiencia renal crónica',
  'EPOC',
  'Fibrilación auricular',
  'Insuficiencia cardíaca',
  'Cardiopatía isquémica',
  'ACV previo',
  'Cáncer',
  'Obesidad',
  'Síndrome de intestino irritable',
];
const medicationChips = [
  'Losartán 50mg',
  'Metformina 850mg',
  'Salbutamol',
  'Levotiroxina 100mcg',
  'Atorvastatina 20mg',
  'Omeprazol 20mg',
  'Sertralina 50mg',
  'Escitalopram 10mg',
  'Paracetamol 500mg',
  'Ibuprofeno 400mg',
  'Aspirina 100mg',
  'Clopidogrel 75mg',
  'Amlodipino 5mg',
  'Enalapril 10mg',
  'Furosemida 40mg',
  'Insulina glargina',
  'Gabapentina 300mg',
  'Pregabalina 75mg',
  'Alprazolam 0.5mg',
  'Clonazepam 0.5mg',
];
const allergyChips = [
  'Penicilina',
  'Aspirina',
  'Mariscos',
  'Polen',
  'AINES',
  'Sulfamidas',
  'Látex',
  'Nueces',
  'Polvo',
  'Pelo de animal',
  'Yodo',
  'Huevos',
  'Leche',
  'Soya',
  'Trigo',
  'Picadura de abeja',
  'Codeína',
  'Morfina',
  'Anestésicos locales',
  'Lidocaína',
];

export function NewPatientDialog({
  isOpen,
  onOpenChange,
  onSubmit,
}: NewPatientDialogProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      name: '',
      age: '',
      medicalHistory: '',
      medications: '',
      allergies: '',
    },
  });

  const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const handleChipClick = (
    field: keyof PatientFormValues,
    value: string,
    selectedItems: string[],
    setSelectedItems: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newSelectedItems = selectedItems.includes(value)
      ? selectedItems.filter((item) => item !== value)
      : [...selectedItems, value];

    setSelectedItems(newSelectedItems);
    form.setValue(field, newSelectedItems.join(', '));
  };
  
   useEffect(() => {
    if (!isOpen) {
      form.reset();
      setSelectedHistory([]);
      setSelectedMedications([]);
      setSelectedAllergies([]);
    }
  }, [isOpen, form]);


  const handleFormSubmit = (values: PatientFormValues) => {
    const dataToSubmit: PatientData = {
      name: values.name,
      age: values.age ? Number(values.age) : undefined,
      gender: values.gender,
      medicalHistory: values.medicalHistory,
      medications: values.medications,
      allergies: values.allergies,
    };
    onSubmit(dataToSubmit);
    form.reset();
    setSelectedHistory([]);
    setSelectedMedications([]);
    setSelectedAllergies([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Nueva Consulta</DialogTitle>
          <DialogDescription>
            Introduce los datos del paciente para iniciar una nueva consulta. El
            nombre es el único campo obligatorio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Paciente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Edad</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej. 42" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="medicalHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historial Médico Relevante</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej. Hipertensión, Diabetes tipo 2..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {historyChips.map((chip) => {
                      const isSelected = selectedHistory.includes(chip);
                      return (
                        <Button
                          key={chip}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            handleChipClick(
                              'medicalHistory',
                              chip,
                              selectedHistory,
                              setSelectedHistory
                            )
                          }
                          className="h-auto px-2 py-1 text-xs"
                        >
                          {isSelected && <Check className="mr-2 h-4 w-4" />}
                          {chip}
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicamentos Actuales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej. Losartán 50mg, Metformina 850mg..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {medicationChips.map((chip) => {
                      const isSelected = selectedMedications.includes(chip);
                      return (
                        <Button
                          key={chip}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            handleChipClick(
                              'medications',
                              chip,
                              selectedMedications,
                              setSelectedMedications
                            )
                          }
                          className="h-auto px-2 py-1 text-xs"
                        >
                          {isSelected && <Check className="mr-2 h-4 w-4" />}
                          {chip}
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alergias Conocidas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej. Penicilina, mariscos..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {allergyChips.map((chip) => {
                      const isSelected = selectedAllergies.includes(chip);
                      return (
                        <Button
                          key={chip}
                          type="button"
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() =>
                            handleChipClick(
                              'allergies',
                              chip,
                              selectedAllergies,
                              setSelectedAllergies
                            )
                          }
                          className="h-auto px-2 py-1 text-xs"
                        >
                          {isSelected && <Check className="mr-2 h-4 w-4" />}
                          {chip}
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Iniciar Consulta</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
