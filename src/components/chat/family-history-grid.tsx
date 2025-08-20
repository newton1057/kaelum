
'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

export type FamilyHistoryData = Record<string, string[]>;

interface FamilyHistoryGridProps {
  value: FamilyHistoryData;
  onChange: (value: FamilyHistoryData) => void;
}

const familyMembers = [
  'Madre', 'Padre', 'Hermanos(a)', 'Abuela materna', 'Abuelo materno',
  'Abuela paterna', 'Abuelo paterno', 'Otro'
];

const conditions = [
  'Suicidio', 'Farmacodependencia', 'Alcoholismo',
  'Problemas de aprendizaje, lenguaje o audición', 'Epilepsia', 'Retraso mental',
  'Abuso sexual', 'Maltrato físico', 'Trastorno por déficit de atención e hiperactividad',
  'Ansiedad', 'Depresión', 'Trastorno bipolar', 'Esquizofrenia', 'Autismo',
  'Cáncer', 'Alergias', 'Obesidad', 'Hipertensión', 'Diabetes',
  'Enfermedades inmunológicas (lupus, reumatismo, púrpura)', 'Ninguno', 'No sé', 'Otro'
];

export function FamilyHistoryGrid({ value, onChange }: FamilyHistoryGridProps) {

  const handleCheckboxChange = (member: string, condition: string, checked: boolean) => {
    const updatedData = { ...value };
    const memberConditions = updatedData[member] || [];

    if (checked) {
      if (!memberConditions.includes(condition)) {
        updatedData[member] = [...memberConditions, condition];
      }
    } else {
      updatedData[member] = memberConditions.filter(c => c !== condition);
    }

    onChange(updatedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Antecedentes Familiares</CardTitle>
        <CardDescription>Marque si su familiar tiene o tuvo antecedentes de las siguientes condiciones.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="sticky left-0 bg-background p-2 text-left font-semibold">Familiar</th>
                {conditions.map(condition => (
                  <th key={condition} className="p-2 text-left font-semibold" style={{ minWidth: '120px' }}>{condition}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {familyMembers.map(member => (
                <tr key={member} className="border-b">
                  <td className="sticky left-0 bg-background p-2 font-medium">{member}</td>
                  {conditions.map(condition => (
                    <td key={condition} className="p-2 text-center">
                      <Checkbox
                        checked={(value[member] || []).includes(condition)}
                        onCheckedChange={(checked) => handleCheckboxChange(member, condition, !!checked)}
                        aria-label={`Checkbox for ${member} - ${condition}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
