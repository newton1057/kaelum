
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
import { Input } from '@/components/ui/input';
import { MoreHorizontal, PlusCircle, SlidersHorizontal, Search, TestTube2 } from 'lucide-react';
import { ImportPatientsDialog } from '@/components/dashboard/import-patients-dialog';
import { PatientDetailsDialog } from '@/components/dashboard/patient-details-dialog';
import { format, subYears } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AddNoteDialog } from '@/components/dashboard/add-note-dialog';
import { ChatDialog } from '@/components/dashboard/chat-dialog';
import { ScreeningQuestionnaireDialog, type ScreeningFormValues } from '@/components/chat/screening-questionnaire-dialog';
import { AccessDeniedDialog } from '@/components/dashboard/access-denied-dialog';
import { PatientDocumentsDialog } from '@/components/dashboard/patient-documents-dialog';

type Patient = {
  id: string;
  name: string;
  age: number | string;
  gender: string;
  lastConsultation: string;
  status: string;
  [key: string]: any; // Allow other properties
};

const calculateAge = (birthDateString: string): number | string => {
    if (!birthDateString) return 'N/A';
    try {
        const birthDate = new Date(birthDateString);
        if (isNaN(birthDate.getTime())) {
          return "N/A";
        }
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    } catch (error) {
        console.error("Error parsing date:", birthDateString, error);
        return "N/A";
    }
};

const generateFakePatients = (count: number): Patient[] => {
    const fakePatients: Patient[] = [];
    const firstNames = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofia', 'Miguel', 'Elena'];
    const lastNames = ['García', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres'];
    const genders = ['Masculino', 'Femenino'];
    const statuses = ['Activo', 'Inactivo', 'En tratamiento'];

    for (let i = 0; i < count; i++) {
        const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const age = Math.floor(Math.random() * 60) + 18;
        const birthDate = subYears(new Date(), age);
        
        fakePatients.push({
            id: `demo-${i}`,
            name,
            age,
            gender: genders[Math.floor(Math.random() * genders.length)],
            lastConsultation: format(birthDate, 'yyyy-MM-dd'),
            status: statuses[Math.floor(Math.random() * statuses.length)],
            'Fecha de Nacimiento': format(birthDate, 'yyyy-MM-dd'),
            Sexo: genders[Math.floor(Math.random() * genders.length)],
            'CURP': `DEMO-CURP-${i}`,
        });
    }
    return fakePatients;
};


export default function ExpedientesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuth, setIsAuth] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);
  const [isScreeningDialogOpen, setIsScreeningDialogOpen] = useState(false);
  const [isAccessDeniedDialogOpen, setIsAccessDeniedDialogOpen] = useState(false);
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const storedUserType = localStorage.getItem('userType');
    const storedUserEmail = localStorage.getItem('userEmail');
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      setIsAuth(true);
      setUserType(storedUserType);
      setUserEmail(storedUserEmail);
      if (isDemoMode) {
        loadDemoData();
      } else {
        fetchPatients();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, isDemoMode]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = patients.filter((patient) =>
      patient.name.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredPatients(filtered);
  }, [searchQuery, patients]);
  
  const loadDemoData = () => {
    setIsLoading(true);
    setPatients(generateFakePatients(15));
    setIsLoading(false);
  };

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://kaelumapi-866322842519.northamerica-south1.run.app/medicalRecords/getRecords');
      if (!response.ok) {
        throw new Error('Error al obtener los expedientes');
      }
      const result = await response.json();
      
      const formattedPatients = result.data.map((record: any) => {
        const birthDateString = record['Fecha de Nacimiento'];
        const birthDate = new Date(birthDateString);
        const isValidDate = !isNaN(birthDate.getTime());

        return {
          ...record, // Keep all original data
          id: record.id || record['CURP del paciente'] || Math.random().toString(36).substring(2, 15),
          name: record.Nombre,
          age: calculateAge(birthDateString),
          gender: record.Sexo,
          lastConsultation: birthDateString && isValidDate ? format(birthDate, 'yyyy-MM-dd') : 'N/A',
          status: 'Activo', // Placeholder status
        }
      });
      
      setPatients(formattedPatients);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error de Carga',
        description: (error as Error).message || 'No se pudieron cargar los expedientes.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleDemoMode = () => {
      setIsDemoMode(prev => !prev);
  };

  const handleCreatePatient = async (formData: ScreeningFormValues) => {
    try {
      const dataToSend = {
        id: formData.curp,
        data: formData
      };

      const response = await fetch('https://kaelumapi-866322842519.northamerica-south1.run.app/medicalRecords/createRecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el expediente.');
      }

      toast({
        title: 'Expediente Creado',
        description: `El expediente para "${formData.nombre}" ha sido creado exitosamente.`
      });
      setIsScreeningDialogOpen(false);
      fetchPatients(); // Refresh the list
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Error al Crear',
        description: (error as Error).message || 'No se pudo crear el expediente.'
      });
    }
  };

  const handleViewDetails = (patient: Patient) => {
    if (userType === 'other' || userType === 'v2') {
        setSelectedPatient(patient);
        setIsDetailsDialogOpen(true);
        return;
    }
    setSelectedPatient(patient);
    setIsDetailsDialogOpen(true);
  }
  
  const handleAddNote = (patient: Patient) => {
    if (userType === 'v1' || userType === 'secondary') {
        setIsAccessDeniedDialogOpen(true);
        return;
    }
    setSelectedPatient(patient);
    setIsAddNoteDialogOpen(true);
  }

  const handleStartChat = async (patient: Patient) => {
    if (userType === 'other' || userType === 'v2') {
      setIsAccessDeniedDialogOpen(true);
      return;
    }
    setSelectedPatient(patient);
    setIsChatDialogOpen(true);
  };
  
  const handleOpenDocuments = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDocumentsDialogOpen(true);
  };
  
  const handleOpenAddPatientDialog = () => {
    if (userType === 'secondary' || userType === 'v3') {
      setIsAccessDeniedDialogOpen(true);
    } else {
      setIsScreeningDialogOpen(true);
    }
  };
  
  const handleOpenImportDialog = () => {
    if (userType === 'secondary' || userType === 'v3') {
      setIsAccessDeniedDialogOpen(true);
    } else {
      setIsImportDialogOpen(true);
    }
  };


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
          {userEmail === 'admin@mentalbeat.com.mx' && (
            <Button onClick={handleToggleDemoMode} variant={isDemoMode ? "default" : "outline"}>
              <TestTube2 className="mr-2 h-4 w-4" />
              Modo Demo
            </Button>
          )}
          <Button onClick={handleOpenAddPatientDialog}>
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
              <DropdownMenuItem onSelect={handleOpenImportDialog}>
                Importar Pacientes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
       <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre..."
          className="w-full pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Género</TableHead>
              <TableHead className="hidden sm:table-cell">Edad</TableHead>
              <TableHead className="hidden md:table-cell">
                Fecha de Nacimiento
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-row-${index}`}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-10" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : (
              filteredPatients.map((patient) => (
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
                      variant={'default'}
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
                        <DropdownMenuItem onSelect={() => handleViewDetails(patient)}>Ver Expediente</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleStartChat(patient)}>Chat</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleAddNote(patient)}>Añadir Nota Clínica</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOpenDocuments(patient)}>Documentos</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Archivar Paciente
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
    <ImportPatientsDialog isOpen={isImportDialogOpen} onOpenChange={setIsImportDialogOpen} onImportSuccess={isDemoMode ? loadDemoData : fetchPatients} />
    {selectedPatient && <PatientDetailsDialog isOpen={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen} patient={selectedPatient} onPatientUpdate={isDemoMode ? loadDemoData : fetchPatients} isDemoMode={isDemoMode} />}
    {selectedPatient && <AddNoteDialog isOpen={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen} patient={selectedPatient} isDemoMode={isDemoMode} />}
    {selectedPatient && <ChatDialog isOpen={isChatDialogOpen} onOpenChange={setIsChatDialogOpen} patient={selectedPatient} isDemoMode={isDemoMode} />}
    {selectedPatient && <PatientDocumentsDialog isOpen={isDocumentsDialogOpen} onOpenChange={setIsDocumentsDialogOpen} patient={selectedPatient} />}
    <ScreeningQuestionnaireDialog
        isOpen={isScreeningDialogOpen}
        onOpenChange={setIsScreeningDialogOpen}
        onSubmit={handleCreatePatient}
    />
    <AccessDeniedDialog isOpen={isAccessDeniedDialogOpen} onOpenChange={setIsAccessDeniedDialogOpen} />
    </>
  );
}
