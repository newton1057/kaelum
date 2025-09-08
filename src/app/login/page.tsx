
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from '@/components/icons';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://kaelumapi-703555916890.northamerica-south1.run.app/access/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: password }),
      });

      if (response.ok) {
        const result = await response.json();
        
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userFullName', result.fullName || 'Usuario');
        localStorage.setItem('userEmail', result.email || 'email@desconocido.com');
        localStorage.setItem('userType', result.type || 'No especificado');

        toast({
          title: '¡Bienvenido!',
          description: `Has iniciado sesión correctamente. Tipo de usuario: ${result.type || 'No especificado'}`,
        });
        router.push('/chat');
      } else {
        const errorText = 'Acceso no autorizado. Verifica tu PIN e inténtalo de nuevo.';
        setError(errorText);
        toast({
          variant: 'destructive',
          title: 'Error de autenticación',
          description: errorText,
        });
      }
    } catch (err) {
      const errorText = 'No se pudo conectar con el servidor. Por favor, intenta más tarde.';
      setError(errorText);
      toast({
        variant: 'destructive',
        title: 'Error de Red',
        description: errorText,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <AppLogo />
            </div>
            <CardTitle>Bienvenido a Kaelum</CardTitle>
            <CardDescription>
              Ingresa tu PIN de 6 dígitos para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">PIN de Acceso</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={6}
                placeholder="••••••"
                className="text-center text-lg tracking-[0.5em]"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
