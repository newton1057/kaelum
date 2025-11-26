
'use client';

import { useState, useRef, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from '@/components/icons';

const PIN_LENGTH = 6;

export default function LoginPage() {
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [touched, setTouched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([...Array(PIN_LENGTH)].map(() => null));
  const router = useRouter();
  const { toast } = useToast();

  const pin = digits.join('');
  const isValid = pin.length === PIN_LENGTH;

  const setDigit = (i: number, v: string) => {
    const next = [...digits];
    next[i] = v;
    setDigits(next);
  };

  const handleChange = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const char = val.slice(-1);
    setDigit(i, char);
    if (errorMsg) setErrorMsg('');
    if (char && i < PIN_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        setDigit(i, '');
        if (errorMsg) setErrorMsg('');
        return;
      }
      if (i > 0) {
        refs.current[i - 1]?.focus();
        setDigit(i - 1, '');
        if (errorMsg) setErrorMsg('');
      }
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < PIN_LENGTH - 1) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text') || '';
    const digitsOnly = text.replace(/\D/g, '').slice(0, PIN_LENGTH).split('');
    if (!digitsOnly.length) return;
    const next = Array(PIN_LENGTH).fill('');
    for (let i = 0; i < digitsOnly.length; i++) next[i] = digitsOnly[i];
    setDigits(next);
    const last = Math.min(digitsOnly.length, PIN_LENGTH) - 1;
    refs.current[last]?.focus();
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('https://kaelumapi-866322842519.northamerica-south1.run.app/access/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: pin }),
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
        router.push('/dashboard/expedientes');
      } else {
        setErrorMsg('PIN incorrecto. Inténtalo de nuevo.');
        setDigits(Array(PIN_LENGTH).fill(''));
        refs.current[0]?.focus();
      }
    } catch (err) {
      setErrorMsg('No se pudo conectar con el servidor. Por favor, intenta más tarde.');
      setDigits(Array(PIN_LENGTH).fill(''));
      refs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="full-screen-login">
      <form
        onSubmit={handleSubmit}
        style={{
          width: 520,
          maxWidth: '92vw',
          background: 'rgba(3, 23, 24, 0.85)',
          border: '1px solid rgba(210, 242, 82, 0.15)',
          borderRadius: 12,
          boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
          padding: '28px 32px 24px',
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <AppLogo />
        </div>

        <h1
          style={{
            textAlign: 'center',
            fontSize: 28,
            fontWeight: 800,
            color: '#f4fccb',
            margin: '0 0 6px',
          }}
        >
          Bienvenido a <span style={{ color: '#D2F252' }}>MentalBeat</span>
        </h1>

        <p
          style={{
            textAlign: 'center',
            color: '#fbfee7',
            margin: '0 0 22px',
            lineHeight: 1.0,
            fontSize: 14,
          }}
        >
          Ingrese su PIN de 6 dígitos para continuar.
        </p>

        <div
          onPaste={handlePaste}
          onBlur={() => setTouched(true)}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 14,
            margin: '0 auto 18px',
            padding: '0 4px',
            width: '100%',
            maxWidth: 420,
            boxSizing: 'border-box',
          }}
        >
          {digits.map((d, i) => {
            const error = touched && !isValid;
            return (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                value={d}
                onChange={handleChange(i)}
                onKeyDown={handleKeyDown(i)}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                type="password"
                autoComplete="one-time-code"
                aria-label={`Dígito ${i + 1} del PIN`}
                style={{
                  width: 'clamp(40px, 8.5vw, 56px)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `3px solid ${error ? '#ff6b6b' : 'rgba(210, 242, 82, 0.6)'}`,
                  outline: 'none',
                  height: 48,
                  fontSize: 28,
                  textAlign: 'center',
                  color: '#E9FFD0',
                  padding: 0,
                  transition: 'border-color .15s, transform .05s',
                  // @ts-ignore - WebkitTextSecurity is a vendor-specific property
                  WebkitTextSecurity: 'disc',
                } as React.CSSProperties}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              margin: '0 auto 28px',
              width: '100%',
              maxWidth: 420,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid rgba(255, 107, 107, 0.7)',
              background: 'rgba(255, 107, 107, 0.10)',
              color: '#ff6b6b',
              fontSize: 14,
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || isLoading}
          style={{
            width: '100%',
            height: 44,
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            background: '#D2F252',
            color: '#082323',
            boxShadow: '0 0 30px 6px rgba(210, 242, 82, 0.35)',
            cursor: isValid && !isLoading ? 'pointer' : 'not-allowed',
            opacity: isValid && !isLoading ? 1 : 0.6,
            transition: 'opacity 0.2s',
          }}
        >
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
