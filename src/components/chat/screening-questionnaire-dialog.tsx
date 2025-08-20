
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
import { Separator } from '../ui/separator';

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
  alergias: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  alergiasEspecificar: z.string().optional(),
  cirugias: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  cirugiasEspecificar: z.string().optional(),
  accidentes: z.string().optional(),
  traumatismoCraneoencefalico: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  hospitalizaciones: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  hospitalizacionesEspecificar: z.string().optional(),
  fracturas: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  fracturasEspecificar: z.string().optional(),
  crisisConvulsivas: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  crisisConvulsivasEspecificar: z.string().optional(),
  obesidad: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  obesidadEdad: z.string().optional(),
  enfermedadesInfectoContagiosas: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  enfermedadesInfectoContagiosasEspecificar: z.string().optional(),
  enfermedadesCronicas: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  enfermedadesCronicasEspecificar: z.string().optional(),
  tratamientoPrevio: z.enum(['Tratamiento Psiquiátrico', 'Tratamiento Psicológico', 'Ninguno'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  tratamientoPrevioEspecificar: z.string().optional(),
  especialistasPrevios: z.string().min(2, "Debes especificar."),
  consumoAlcoholTabaco: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  consumoInicio: z.string().optional(),
  consumoFrecuencia: z.string().optional(),
  ultimoConsumo: z.string().optional(),
  medicamentosActuales: z.string().min(2, "Debes especificar los medicamentos o indicar 'Ninguno'."),
  estudiosPrevios: z.string().min(2, "Debes especificar los estudios o indicar 'Ninguno'."),
  eegTomografia: z.enum(['Sí', 'No', 'No sé'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  actividadFisica: z.string().min(2, "Debes especificar la actividad o indicar 'Ninguna'."),
  duermeBien: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  dificultadDormir: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  despiertaNoche: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  despiertaTemprano: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  ronca: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  horasSueno: z.coerce.number().min(0, "Debe ser un número positivo.").max(24, "No puedes dormir más de 24 horas."),
  comidasDia: z.coerce.number().min(0, "Debe ser un número positivo."),
  alimentacionCotidiana: z.string().min(10, { message: 'La descripción de tu alimentación debe tener al menos 10 caracteres.' }),
  tiempoLibreHoras: z.coerce.number().min(0).optional(),
  actividadesTiempoLibre: z.string().optional(),
  diaLaboralCotidiano: z.string().optional(),
  organizacionTiempo: z.string().optional(),
  ambienteFamiliar: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres.' }),
  economicamenteActivo: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
  actividadEconomica: z.string().optional(),
  empleosAnteriores: z.string().optional(),
  periodosSinEmpleo: z.string().optional(),
  llegaTardeCitas: z.enum(['Sí', 'No'], {
    required_error: 'Debes seleccionar una opción.',
  }),
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
}).refine((data) => {
    if (data.alergias === 'Sí') {
        return data.alergiasEspecificar && data.alergiasEspecificar.length > 0;
    }
    return true;
}, {
    message: 'Por favor, especifique sus alergias.',
    path: ['alergiasEspecificar'],
}).refine((data) => {
    if (data.cirugias === 'Sí') {
        return data.cirugiasEspecificar && data.cirugiasEspecificar.length > 0;
    }
    return true;
}, {
    message: 'Por favor, describa las cirugías.',
    path: ['cirugiasEspecificar'],
}).refine((data) => {
    if (data.hospitalizaciones === 'Sí') {
        return data.hospitalizacionesEspecificar && data.hospitalizacionesEspecificar.length > 0;
    }
    return true;
}, {
    message: 'Por favor, describa las hospitalizaciones.',
    path: ['hospitalizacionesEspecificar'],
}).refine((data) => {
    if (data.fracturas === 'Sí') {
        return data.fracturasEspecificar && data.fracturasEspecificar.length > 0;
    }
    return true;
}, {
    message: 'Por favor, especifique las fracturas.',
    path: ['fracturasEspecificar'],
}).refine((data) => {
    if (data.crisisConvulsivas === 'Sí') {
        return data.crisisConvulsivasEspecificar && data.crisisConvulsivasEspecificar.length > 0;
    }
    return true;
}, {
    message: 'Por favor, especifique las crisis convulsivas.',
    path: ['crisisConvulsivasEspecificar'],
}).refine((data) => {
    if (data.obesidad === 'Sí') {
        return data.obesidadEdad && data.obesidadEdad.length > 0;
    }
    return true;
}, {
    message: 'Por favor, especifique la edad.',
    path: ['obesidadEdad'],
}).refine((data) => {
    if (data.enfermedadesInfectoContagiosas === 'Sí') {
        return data.enfermedadesInfectoContagiosasEspecificar && data.enfermedadesInfectoContagiosasEspecificar.length > 0;
    }
    return true;
}, {
    message: 'Por favor, especifique las enfermedades.',
    path: ['enfermedadesInfectoContagiosasEspecificar'],
}).refine((data) => {
    if (data.enfermedadesCronicas === 'Sí') {
        return data.enfermedadesCronicasEspecificar && data.enfermedadesCronicasEspecificar.length > 0;
    }
    return true;
}, {
    message: 'Por favor, especifique las enfermedades.',
    path: ['enfermedadesCronicasEspecificar'],
}).refine((data) => {
    if (data.tratamientoPrevio !== 'Ninguno') {
        return data.tratamientoPrevioEspecificar && data.tratamientoPrevioEspecificar.length > 0;
    }
    return true;
}, {
    message: 'Por favor, especifique el tratamiento.',
    path: ['tratamientoPrevioEspecificar'],
}).refine((data) => {
    if (data.consumoAlcoholTabaco === 'Sí') {
        return data.consumoInicio && data.consumoInicio.length > 0 &&
               data.consumoFrecuencia && data.consumoFrecuencia.length > 0 &&
               data.ultimoConsumo && data.ultimoConsumo.length > 0;
    }
    return true;
}, {
    message: 'Debe completar todos los campos de consumo.',
    path: ['consumoInicio'],
}).refine((data) => {
    if (data.economicamenteActivo === 'Sí') {
        return data.actividadEconomica && data.actividadEconomica.length > 0;
    }
    return true;
}, {
    message: 'Por favor, describa la actividad económica.',
    path: ['actividadEconomica'],
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
      alergias: undefined,
      alergiasEspecificar: '',
      cirugias: undefined,
      cirugiasEspecificar: '',
      accidentes: '',
      traumatismoCraneoencefalico: undefined,
      hospitalizaciones: undefined,
      hospitalizacionesEspecificar: '',
      fracturas: undefined,
      fracturasEspecificar: '',
      crisisConvulsivas: undefined,
      crisisConvulsivasEspecificar: '',
      obesidad: undefined,
      obesidadEdad: '',
      enfermedadesInfectoContagiosas: undefined,
      enfermedadesInfectoContagiosasEspecificar: '',
      enfermedadesCronicas: undefined,
      enfermedadesCronicasEspecificar: '',
      tratamientoPrevio: 'Ninguno',
      tratamientoPrevioEspecificar: '',
      especialistasPrevios: '',
      consumoAlcoholTabaco: undefined,
      consumoInicio: '',
      consumoFrecuencia: '',
      ultimoConsumo: '',
      medicamentosActuales: '',
      estudiosPrevios: '',
      eegTomografia: undefined,
      actividadFisica: '',
      duermeBien: undefined,
      dificultadDormir: undefined,
      despiertaNoche: undefined,
      despiertaTemprano: undefined,
      ronca: undefined,
      horasSueno: undefined,
      comidasDia: undefined,
      alimentacionCotidiana: '',
      tiempoLibreHoras: undefined,
      actividadesTiempoLibre: '',
      diaLaboralCotidiano: '',
      organizacionTiempo: '',
      ambienteFamiliar: '',
      economicamenteActivo: undefined,
      actividadEconomica: '',
      empleosAnteriores: '',
      periodosSinEmpleo: '',
      llegaTardeCitas: undefined,
    },
  });

  const watchedChannel = form.watch('channel');
  const watchedSexo = form.watch('sexo');
  const watchedFechaNacimiento = form.watch('fechaNacimiento');
  const watchedAlergias = form.watch('alergias');
  const watchedCirugias = form.watch('cirugias');
  const watchedHospitalizaciones = form.watch('hospitalizaciones');
  const watchedFracturas = form.watch('fracturas');
  const watchedCrisisConvulsivas = form.watch('crisisConvulsivas');
  const watchedObesidad = form.watch('obesidad');
  const watchedEnfermedadesInfectoContagiosas = form.watch('enfermedadesInfectoContagiosas');
  const watchedEnfermedadesCronicas = form.watch('enfermedadesCronicas');
  const watchedTratamientoPrevio = form.watch('tratamientoPrevio');
  const watchedConsumo = form.watch('consumoAlcoholTabaco');
  const watchedEconomicamenteActivo = form.watch('economicamenteActivo');

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
  
  useEffect(() => {
    if (!isOpen) {
        form.reset();
    }
  }, [isOpen, form]);

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

            <div className="space-y-8 rounded-lg border p-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Antecedentes Personales</h3>
                    <p className="text-sm text-muted-foreground">Describa sus antecedentes personales.</p>
                </div>
                <FormField
                    control={form.control}
                    name="alergias"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Tiene usted alergias? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {watchedAlergias === 'Sí' && (
                    <FormField
                    control={form.control}
                    name="alergiasEspecificar"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Especifique sus alergias</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describa sus alergias..."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>Conteste solo si marcó Sí en la pregunta anterior.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="cirugias"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Le han realizado cirugías? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {watchedCirugias === 'Sí' && (
                    <FormField
                    control={form.control}
                    name="cirugiasEspecificar"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Describa las cirugías</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describa el tipo de procedimiento, a que edad se realizó, si hubo complicaciones, etc."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>Conteste solo si marcó SI en la pregunta anterior.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
                 <FormField
                    control={form.control}
                    name="accidentes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>¿Ha tenido algún tipo de accidente? (automovilístico, laboral o de otro tipo)</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describa los accidentes..."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>Aunque haya sido un accidente leve, indique el número de veces y descrìba cada uno de ellos.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="traumatismoCraneoencefalico"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Ha tenido traumatismo cráneo encefálico? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="hospitalizaciones"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Ha estado hospitalizado? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {watchedHospitalizaciones === 'Sí' && (
                    <FormField
                    control={form.control}
                    name="hospitalizacionesEspecificar"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Describa las hospitalizaciones</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describir la causa, a que edad, etc."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>Conteste solo si marcó SI en la pregunta anterior.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
                 <FormField
                    control={form.control}
                    name="fracturas"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Se ha fracturado? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {watchedFracturas === 'Sí' && (
                    <FormField
                    control={form.control}
                    name="fracturasEspecificar"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Especifique las fracturas</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Especifique..."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>Solo si marcó SI en la pregunta anterior.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="crisisConvulsivas"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Ha tenido crisis convulsivas? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {watchedCrisisConvulsivas === 'Sí' && (
                    <FormField
                    control={form.control}
                    name="crisisConvulsivasEspecificar"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Especifique las crisis convulsivas</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Especifique..."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>Solo si marcó SI en la pregunta anterior.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="obesidad"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Ha tenido o tiene obesidad? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {watchedObesidad === 'Sí' && (
                    <FormField
                    control={form.control}
                    name="obesidadEdad"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>¿A qué edad?</FormLabel>
                        <FormControl>
                            <Input placeholder="Especifique la edad..." {...field} />
                        </FormControl>
                        <FormDescription>Conteste sólo si marcó SI en la pregunta anterior.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="enfermedadesInfectoContagiosas"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Ha tenido enfermedades infecto-contagiosas (Rubeola, varicela, sarampión, escarlatina, estreptococo, etcétera)? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {watchedEnfermedadesInfectoContagiosas === 'Sí' && (
                    <FormField
                    control={form.control}
                    name="enfermedadesInfectoContagiosasEspecificar"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Especifique las enfermedades</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Especifique..."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>Conteste solo si marcó SI en la pregunta anterior.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="enfermedadesCronicas"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Tiene enfermedades crónicas? (Diabetes, enfermedades del corazón, hipertensión, etc) *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {watchedEnfermedadesCronicas === 'Sí' && (
                    <FormField
                    control={form.control}
                    name="enfermedadesCronicasEspecificar"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Especifique las enfermedades</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Especifique..."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>Conteste solo si marcó SI en la pregunta anterior.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="tratamientoPrevio"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Antecedente de tratamiento psiquiátrico o psicológico, actual o previo *</FormLabel>
                         <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col gap-2"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Tratamiento Psiquiátrico" />
                                </FormControl>
                                <FormLabel className="font-normal">Tratamiento Psiquiátrico</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Tratamiento Psicológico" />
                                </FormControl>
                                <FormLabel className="font-normal">Tratamiento Psicológico</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Ninguno" />
                                </FormControl>
                                <FormLabel className="font-normal">Ninguno</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {watchedTratamientoPrevio !== 'Ninguno' && (
                    <FormField
                        control={form.control}
                        name="tratamientoPrevioEspecificar"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Especifique el tratamiento</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Especifique..."
                                className="resize-y"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                
                <FormField
                    control={form.control}
                    name="especialistasPrevios"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>¿Ha consultado a otros especialistas para atender su padecimiento actual? *</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Especifique..."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                         <FormDescription>Especificar especialistas consultados, tipo y tiempo en tratamiento.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="consumoAlcoholTabaco"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Antecedente de consumo de alcohol, tabaco u otras substancias *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {watchedConsumo === 'Sí' && (
                    <div className='space-y-4 pl-4 border-l'>
                        <FormField
                        control={form.control}
                        name="consumoInicio"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Edad de inicio del consumo</FormLabel>
                            <FormControl>
                                <Input placeholder="Especifique edad de inicio del consumo de alcohol, tabaco u otras sustancias." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name="consumoFrecuencia"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Frecuencia y cantidad</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Especificar frecuencia de consumo y cantidad" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name="ultimoConsumo"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Fecha de último consumo</FormLabel>
                            <FormControl>
                                <Input placeholder="Especifique la fecha" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                )}
                 <FormField
                    control={form.control}
                    name="medicamentosActuales"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>¿Utiliza actualmente algún medicamento? *</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Especifique los medicamentos o escriba 'Ninguno'."
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
                    name="estudiosPrevios"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>¿Le han realizado algún estudio de laboratorio, gabinete, imagen o pruebas psicológicas? *</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Especifique los estudios o escriba 'Ninguno'."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>Acudir a consulta con su reporte de resultados.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="eegTomografia"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Le han realizado Electroencefalograma, tomografía, resonancia magnética? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No sé" />
                                </FormControl>
                                <FormLabel className="font-normal">No sé</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                         <FormDescription>En caso de marcar SI, acudir a la consulta con su reporte de resultado.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="actividadFisica"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>¿Realiza alguna actividad física? *</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Especifique..."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>Especifique el tipo de actividad y la frecuencia semanal.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Separator />
                <div className='space-y-2'>
                    <h4 className="text-md font-semibold">Hábitos de Sueño</h4>
                </div>
                 <FormField
                    control={form.control}
                    name="duermeBien"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Duerme bien? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="dificultadDormir"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Le cuesta trabajo quedarse dormido? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="despiertaNoche"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Se despierta a lo largo de la noche? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="despiertaTemprano"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Se despierta antes de lo esperado? (Una hora) *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="ronca"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Usted ronca? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="horasSueno"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>¿Cuántas horas duerme de manera continua al día? *</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Ej. 7" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Separator />
                <div className='space-y-2'>
                    <h4 className="text-md font-semibold">Hábitos Alimenticios</h4>
                </div>
                 <FormField
                    control={form.control}
                    name="comidasDia"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>¿Cuántas veces come al día? *</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Ej. 3" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="alimentacionCotidiana"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Especifique en qué consiste su alimentación cotidianamente *</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describa su desayuno, comida, cena, etc."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Separator />
                <div className='space-y-2'>
                    <h4 className="text-md font-semibold">Otros Hábitos</h4>
                </div>
                <FormField
                    control={form.control}
                    name="tiempoLibreHoras"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>¿Cuántas horas tiene como "Tiempo libre" a la semana?</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Ej. 10" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="actividadesTiempoLibre"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>¿Qué hace en su tiempo libre? *</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describa sus actividades..."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                         <FormDescription>Mencione actividades culturales y recreativas.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="diaLaboralCotidiano"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Describa un día laboral cotidiano.</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describa sus actividades laborales diarias..."
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
                    name="organizacionTiempo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>¿De qué manera organiza su tiempo? *</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describa cómo organiza su tiempo..."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription>Especifique si usa agenda, lista de tareas, planificación desde un día antes, ninguno, etc.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="ambienteFamiliar"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Describa brevemente su ambiente familiar. *</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describa su ambiente familiar..."
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
                    name="economicamenteActivo"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Es económicamente activo? *</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 {watchedEconomicamenteActivo === 'Sí' && (
                    <FormField
                    control={form.control}
                    name="actividadEconomica"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Describa la actividad económica que realiza</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Si es empleado qué puesto desempeña, describir si trabaja de manera independiente..."
                            className="resize-y"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
                 <FormField
                    control={form.control}
                    name="empleosAnteriores"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Describa empleos en los que ha laborado y por cuánto tiempo.</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describa sus empleos anteriores..."
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
                    name="periodosSinEmpleo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Describa en qué momento de su vida ha permanecido sin empleo y por cuánto tiempo.</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describa los períodos sin empleo..."
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
                    name="llegaTardeCitas"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>¿Regularmente llega tarde a sus citas?</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center gap-4"
                            >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="Sí" />
                                </FormControl>
                                <FormLabel className="font-normal">Sí</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="No" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

            </div>


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
