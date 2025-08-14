'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from '@/components/icons';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const CORRECT_PASSWORD = '123456';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem('isAuthenticated', 'true');
      toast({
        title: '¡Bienvenido!',
        description: 'Has iniciado sesión correctamente.',
      });
      router.push('/chat');
    } else {
      setError('La contraseña es incorrecta.');
      toast({
        variant: 'destructive',
        title: 'Error de autenticación',
        description: 'La contraseña que ingresaste es incorrecta. Inténtalo de nuevo.',
      });
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
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Ingresar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
