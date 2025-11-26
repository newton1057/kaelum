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
import { Input } from '@/components/ui/input';
import { MoreHorizontal, PlusCircle, SlidersHorizontal, Search, TestTube2, FileDown } from 'lucide-react';
import { ImportPatientsDialog } from '@/components/dashboard/import-patients-dialog';
import { PatientDetailsDialog } from '@/components/dashboard/patient-details-dialog';
import { format, subYears } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AddNoteDialog } from '@/components/dashboard/add-note-dialog';
import { ChatDialog } from '@/components/dashboard/chat-dialog';
import { ScreeningQuestionnaireDialog, type ScreeningFormValues } from '@/components/chat/screening-questionnaire-dialog';
import { AccessDeniedDialog } from '@/components/dashboard/access-denied-dialog';
import { PatientDocumentsDialog } from '@/components/dashboard/patient-documents-dialog';

// --- STYLES & CONSTANTS ---
const palette = {
  text: "#ffffff",
  textMuted: "rgba(255,255,255,0.6)",
  accent: "#D2F252", // Lime green inferred from shadow
  ink: "#031718",    // Dark teal background
  border: "rgba(255,255,255,0.1)",
  surface: "#031718",
  danger: "#ff6b6b",
};

const COL_WIDTHS = [280, 100, 80, 160, 120, 80]; // Name, Gender, Age, BirthDate, Status, Actions

const thStyle = (key: string): React.CSSProperties => ({
  padding: "12px 16px",
  textAlign: key === "actions" || key === "status" || key === "age" || key === "gender" ? "center" : "left",
  fontSize: 13,
  fontWeight: 700,
  color: palette.ink,
  background: palette.accent,
  // textTransform: "uppercase", // Removed to allow sentence case
  letterSpacing: "0.5px",
  whiteSpace: "nowrap",
});

const tdStyle = (key: string): React.CSSProperties => ({
  padding: "14px 16px",
  color: key === "status" ? palette.text : "rgb(233, 255, 208)",
  fontSize: 14,
  textAlign: key === "actions" || key === "status" || key === "age" || key === "gender" ? "center" : "left",
  verticalAlign: "middle",
});

const TRUNCATE_STYLE: React.CSSProperties = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

type Patient = {
  id: string;
  name: string;
  age: number | string;
  gender: string;
  lastConsultation: string;
  status: string;
  [key: string]: any;
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
      <div className="flex h-screen w-full items-center justify-center bg-[#031718]">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full bg-slate-800" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px] bg-slate-800" />
            <Skeleton className="h-4 w-[200px] bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      style={{
        padding: "24px 32px",
        display: "grid",
        gap: 18,
        alignContent: "start",
        justifyItems: "start",
        textAlign: "left",
        minHeight: "100vh",
        background: "#02080a", // Very dark background for the page
      }}
    >
      {/* Header */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 24, margin: 0, fontWeight: 800, color: palette.text, textAlign: "left" }}>
          Expedientes de Pacientes
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              className="search-input focus:outline-none focus:ring-1 focus:ring-[#D2F252]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre..."
              style={{
                width: 260,
                padding: "10px 12px 10px 36px",
                borderRadius: 10,
                color: palette.text,
                fontSize: 13,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${palette.border}`,
              }}
            />
          </div>

          {userEmail === 'admin@mentalbeat.com.mx' && (
            <button
              type="button"
              onClick={handleToggleDemoMode}
              style={{
                padding: "10px 16px",
                border: `1px solid ${isDemoMode ? palette.accent : palette.border}`,
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 12,
                background: isDemoMode ? palette.accent : "transparent",
                color: isDemoMode ? palette.ink : palette.text,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <TestTube2 className="h-4 w-4" />
              Modo Demo
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAddPatientDialog}
            style={{
              padding: "10px 16px",
              border: "none",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 12,
              background: palette.accent,
              color: palette.ink,
              boxShadow: "0 0 30px 6px rgba(210, 242, 82, 0.25)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <PlusCircle className="h-4 w-4" />
            Añadir Paciente
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                style={{
                  padding: "10px",
                  border: `1px solid ${palette.border}`,
                  borderRadius: 10,
                  background: "transparent",
                  color: palette.text,
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#031718] border-gray-800 text-white">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onSelect={handleOpenImportDialog} className="focus:bg-gray-800 focus:text-white cursor-pointer">
                <FileDown className="mr-2 h-4 w-4" />
                Importar Pacientes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* TABLA */}
      <div
        style={{
          width: "100%",
          border: `1px solid ${palette.border}`,
          borderRadius: 12,
          overflow: "hidden",
          background: "rgba(3,23,24,0.30)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ maxHeight: "calc(100vh - 180px)", overflow: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: "1000px",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <colgroup>
              {COL_WIDTHS.map((w, i) => (
                <col key={i} style={{ width: `${w}px` }} />
              ))}
            </colgroup>

            <thead>
              <tr>
                <th style={thStyle("name")}>Nombre</th>
                <th style={thStyle("gender")}>Género</th>
                <th style={thStyle("age")}>Edad</th>
                <th style={thStyle("birthDate")}>Fecha de nacimiento</th>
                <th style={thStyle("status")}>Estado</th>
                <th style={thStyle("actions")}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} style={{ borderBottom: `1px solid ${palette.border}` }}>
                    {COL_WIDTHS.map((_, j) => (
                      <td key={j} style={{ padding: 16 }}>
                        <Skeleton className="h-5 w-full bg-slate-800/50" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!isLoading && filteredPatients.length === 0 && (
                <tr>
                  <td
                    colSpan={COL_WIDTHS.length}
                    style={{ padding: 32, color: palette.text, opacity: 0.8, fontStyle: "italic", textAlign: "center" }}
                  >
                    {searchQuery ? "No hay registros que coincidan con la búsqueda." : "Aún no hay registros."}
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredPatients.map((r, idx) => (
                  <tr
                    key={r.id}
                    style={{
                      background: idx % 2 === 0 ? "rgba(3,23,24,0.20)" : "rgba(3,23,24,0.30)",
                      borderBottom: `1px solid ${palette.border}`,
                    }}
                  >
                    {/* Nombre */}
                    <td style={tdStyle("name")}>
                      <div style={TRUNCATE_STYLE}>
                        <strong>{r.name}</strong>
                      </div>
                    </td>

                    {/* Género */}
                    <td style={tdStyle("gender")}>
                      <div style={TRUNCATE_STYLE}>{r.gender}</div>
                    </td>

                    {/* Edad */}
                    <td style={tdStyle("age")}>
                      <div style={TRUNCATE_STYLE}>{r.age}</div>
                    </td>

                    {/* Fecha de Nacimiento */}
                    <td style={tdStyle("birthDate")}>
                      <div style={TRUNCATE_STYLE}>{r.lastConsultation}</div>
                    </td>

                    {/* Estado */}
                    <td style={tdStyle("status")}>
                      <div style={{ display: "grid", placeItems: "center" }}>
                        <Badge
                          variant={'default'}
                          className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/50"
                        >
                          {r.status}
                        </Badge>
                      </div>
                    </td>

                    {/* Acciones */}
                    <td style={tdStyle("actions")}>
                      <div style={{ display: "grid", placeItems: "center" }}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              title="Ver detalles"
                              aria-label="Ver detalles"
                              style={{
                                border: "none",
                                background: "transparent",
                                padding: 6,
                                cursor: "pointer",
                                display: "grid",
                                placeItems: "center",
                                borderRadius: 6,
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                              <MoreHorizontal color={palette.accent} size={20} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#031718] border-gray-800 text-white">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleViewDetails(r)} className="focus:bg-gray-800 focus:text-white cursor-pointer">Ver Expediente</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleStartChat(r)} className="focus:bg-gray-800 focus:text-white cursor-pointer">Chat</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleAddNote(r)} className="focus:bg-gray-800 focus:text-white cursor-pointer">Añadir Nota Clínica</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleOpenDocuments(r)} className="focus:bg-gray-800 focus:text-white cursor-pointer">Documentos</DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-800" />
                            <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-gray-800 cursor-pointer">
                              Archivar Paciente
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
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
    </main>
  );
}
