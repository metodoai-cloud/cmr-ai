import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CrmLogo from './CrmLogo';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Credenciales incorrectas. Verifica tu correo y contraseña.');
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('El correo aún no ha sido confirmado. Puedes activarlo directamente en Supabase.');
        } else {
          setErrorMessage(error.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar el inicio de sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#090d16',
        color: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: '24px 16px',
      }}
    >
      {/* Dynamic Ambient Background Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(99, 102, 241, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '15%',
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          right: '35%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0) 70%)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Form Container Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'rgba(15, 22, 36, 0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px -5px rgba(99, 102, 241, 0.15)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Header with Glowing CRM Monitor Icon */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '18px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(14, 165, 233, 0.35)',
              }}
            >
              <CrmLogo size={52} />
            </div>
          </div>

          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.85rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              margin: '0 0 8px 0',
              lineHeight: 1.2,
            }}
          >
            CRM IA
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              margin: 0,
              fontWeight: 400,
            }}
          >
            Acceso Autorizado • Gestión Comercial &amp; Operativa
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              marginBottom: '24px',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              lineHeight: 1.45,
            }}
          >
            <AlertCircle size={17} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email Field */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '8px',
                letterSpacing: '0.01em',
              }}
            >
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                  color: '#64748b',
                }}
              >
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@metodoai.tech"
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 42px',
                  backgroundColor: 'rgba(10, 15, 26, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#818cf8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: '8px',
                letterSpacing: '0.01em',
              }}
            >
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                  color: '#64748b',
                }}
              >
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 42px',
                  backgroundColor: 'rgba(10, 15, 26, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  letterSpacing: showPassword ? 'normal' : '0.15em',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#818cf8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#cbd5e1')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '13px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #10b981 100%)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.95rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 25px -4px rgba(99, 102, 241, 0.45), 0 4px 15px -2px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.65 : 1,
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.filter = 'brightness(1.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.filter = 'none';
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <span>Iniciar Sesión Segura</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Security Badges */}
        <div
          style={{
            marginTop: '28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: '#94a3b8',
              fontWeight: 500,
            }}
          >
            <ShieldCheck size={16} color="#10b981" />
            <span>Cifrado SSL 256-bit • Supabase Auth</span>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              color: '#64748b',
              lineHeight: 1.3,
            }}
          >
            <Lock size={12} color="#64748b" />
            <span>Sistema Privado — Acceso restringido exclusivamente a personal autorizado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
