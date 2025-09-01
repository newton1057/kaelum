
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, SlidersHorizontal } from 'lucide-react';
import { ImportPatientsDialog } from '@/components/dashboard/import-patients-dialog';

const patients = [
  {
    id: 'p001',
    name: 'Ana García Pérez',
    age: 34,
    gender: 'Femenino',
    lastConsultation: '2024-08-15',
    status: 'Activo',
  },
  {
    id: 'p002',
    name: 'Luis Martínez Rodríguez',
    age: 45,
    gender: 'Masculino',
    lastConsultation: '2024-07-22',
    status: 'Activo',
  },
  {
    id: 'p003',
    name: 'Sofía Hernández López',
    age: 28,
    gender: 'Femenino',
    lastConsultation: '2024-05-10',
    status: 'Seguimiento',
  },
  {
    id: 'p004',
    name: 'Carlos Sánchez Morales',
    age: 52,
    gender: 'Masculino',
    lastConsultation: '2023-11-30',
    status: 'Inactivo',
  },
  {
    id: 'p005',
    name: 'Elena Ramirez Diaz',
    age: 61,
    gender: 'Femenino',
    lastConsultation: '2024-08-20',
    status: 'Activo',
  },
];

export default function ExpedientesPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (!isAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Expedientes de Pacientes
        </h2>
        <div className="flex items-center gap-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Paciente
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => setIsImportDialogOpen(true)}>
                Importar Pacientes
              </DropdownMenuItem>
              <DropdownMenuItem>Exportar Pacientes</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Configuración</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Género</TableHead>
              <TableHead className="hidden sm:table-cell">Edad</TableHead>
              <TableHead className="hidden md:table-cell">
                Última Consulta
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.name}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  {patient.gender}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {patient.age}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {patient.lastConsultation}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      patient.status === 'Activo'
                        ? 'default'
                        : patient.status === 'Seguimiento'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {patient.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>Ver Expediente</DropdownMenuItem>
                      <DropdownMenuItem>Iniciar Consulta</DropdownMenuItem>
                      <DropdownMenuItem>Editar Paciente</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Archivar Paciente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
    <ImportPatientsDialog isOpen={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} />
    </>
  );
}
