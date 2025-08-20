
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Info, Calendar as CalendarIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { useEffect, useState } from 'react';
import { Textarea } from '../ui/textarea';
import { es } from 'date-fns/locale';
import { FamilyHistoryGrid } from './family-history-grid';
import type { FamilyHistoryData } from './family-history-grid';

const mexicanStates = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero',
  'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León',
  'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
  'Ciudad de México'
];

const educationLevels = [
    "Sin escolaridad", "Preescolar", "Primaria", "Secundaria", "Preparatoria o Bachillerato",
    "Carrera técnica", "Licenciatura", "Maestría", "Doctorado"
];


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
  nombre: z.string().min(2, { message: "El nombre es obligatorio." }),
  fechaNacimiento: z.date({
    required_error: "La fecha de nacimiento es obligatoria.",
  }),
  sexo: z.enum(['Mujer', 'Hombre', 'No Binario', 'Otro'], {
    required_error: "Debes seleccionar un sexo."
  }),
  sexoOtro: z.string().optional(),
  lugarNacimiento: z.string({
    required_error: "El lugar de nacimiento es obligatorio."
  }),
  domicilio: z.string().min(5, { message: "El domicilio es obligatorio." }),
  telefono: z.string().min(10, { message: "El teléfono debe tener al menos 10 dígitos." }),
  escolaridad: z.string({
    required_error: "La escolaridad es obligatoria."
  }),
  ocupacion: z.string().min(2, { message: "La ocupación es obligatoria." }),
  estadoCivil: z.enum(['Casado', 'Soltero', 'Divorciado', 'Separado', 'Union libre'], {
      required_error: "El estado civil es obligatorio."
  }),
  numeroHijos: z.coerce.number().int().min(0, { message: "El número no puede ser negativo."}),
  religion: z.string().optional(),
  motivoConsulta: z.string().min(10, { message: 'El motivo de consulta es obligatorio y debe tener al menos 10 caracteres.' }),
  antecedentesFamiliares: z.record(z.array(z.string())).optional(),
  antecedentesOtros: z.string().optional(),
}).refine((data) => {
    if (data.channel === 'Otro') {
        return data.channelOther && data.channelOther.length > 0;
    }
    return true;
}, {
    message: 'Por favor, especifica el canal.',
    path: ['channelOther'],
}).refine((data) => {
    if (data.sexo === 'Otro') {
        return data.sexoOtro && data.sexoOtro.length > 0;
    }
    return true;
}, {
    message: 'Por favor, especifica el sexo.',
    path: ['sexoOtro'],
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
      nombre: '',
      sexoOtro: '',
      domicilio: '',
      telefono: '',
      ocupacion: '',
      numeroHijos: 0,
      religion: '',
      motivoConsulta: '',
      antecedentesFamiliares: {},
      antecedentesOtros: '',
    },
  });

  const watchedChannel = form.watch('channel');
  const watchedSexo = form.watch('sexo');
  const watchedFechaNacimiento = form.watch('fechaNacimiento');
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    if (watchedFechaNacimiento) {
      const today = new Date();
      let calculatedAge = today.getFullYear() - watchedFechaNacimiento.getFullYear();
      const m = today.getMonth() - watchedFechaNacimiento.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < watchedFechaNacimiento.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  }, [watchedFechaNacimiento]);

  const handleFormSubmit = (values: ScreeningFormValues) => {
    onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:w-[80vw] sm:max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cuestionario de Tamizaje Adultos</DialogTitle>
          <DialogDescription>
            Introduce los datos del paciente para iniciar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="nombre"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                            <Input placeholder="Nombre completo del paciente" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField
                    control={form.control}
                    name="fechaNacimiento"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? (
                                    format(field.value, "PPP", { locale: es })
                                ) : (
                                    <span>Seleccionar fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                                }
                                captionLayout="dropdown-buttons"
                                fromYear={1920}
                                toYear={new Date().getFullYear()}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        {age !== null && <p className="text-xs text-muted-foreground pt-1">Edad: {age} años</p>}
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sexo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Sexo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="Mujer">Mujer</SelectItem>
                            <SelectItem value="Hombre">Hombre</SelectItem>
                            <SelectItem value="No Binario">No Binario</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 {watchedSexo === 'Otro' && (
                    <FormField
                    control={form.control}
                    name="sexoOtro"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Especificar sexo</FormLabel>
                        <FormControl>
                            <Input placeholder="Especifique..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="lugarNacimiento"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Lugar de Nacimiento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {mexicanStates.map(state => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="domicilio"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Domicilio Actual</FormLabel>
                        <FormControl>
                            <Input placeholder="Calle, número, colonia, C.P." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                            <Input type="tel" placeholder="Ej. 5512345678" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="escolaridad"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Escolaridad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar nivel..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {educationLevels.map(level => (
                                    <SelectItem key={level} value={level}>{level}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="ocupacion"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Ocupación</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. Ingeniero de Software" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField
                    control={form.control}
                    name="estadoCivil"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estado Civil</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Soltero">Soltero(a)</SelectItem>
                                <SelectItem value="Casado">Casado(a)</SelectItem>
                                <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                                <SelectItem value="Separado">Separado(a)</SelectItem>
                                <SelectItem value="Union libre">Unión libre</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="numeroHijos"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Número de hijos</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="religion"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Religión (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej. Católica" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="motivoConsulta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo de Consulta</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describa el motivo de la consulta..."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describa el motivo de consulta, cuándo iniciaron los  síntomas, a qué atribuye el inicio de los síntomas,  tratamientos previos utilizados y especialistas consultados con anterioridad.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="antecedentesFamiliares"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FamilyHistoryGrid
                      value={field.value || {}}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="antecedentesOtros"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>¿Cuenta con antecedentes familiares de enfermedades crónicas o psiquiátricas no especificadas en el cuadro anterior?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Especifique otros antecedentes relevantes aquí..."
                      className="resize-y"
                      {...field}
                    />
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
