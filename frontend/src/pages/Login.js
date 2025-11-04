import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Stethoscope, Heart, FileText, Sparkles } from 'lucide-react';

const Login = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left side - Hero */}
        <div className="space-y-6 fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 rounded-2xl">
              <Stethoscope className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">PROMPT-MESTRE</h1>
          </div>
          
          <p className="text-xl text-gray-600">
            Plataforma inteligente de anamnese clínica com IA
          </p>

          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg mt-1">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Anamnese Estruturada</h3>
                <p className="text-sm text-gray-600">Coleta completa com wizard guiado</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg mt-1">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Resumos com IA</h3>
                <p className="text-sm text-gray-600">Síntese clínica automática e inteligente</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-100 rounded-lg mt-1">
                <Heart className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Acolhedor & Profissional</h3>
                <p className="text-sm text-gray-600">Design moderno com foco no cuidado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login */}
        <div className="glass-effect rounded-3xl p-8 space-y-6 slide-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">Bem-vindo(a)</h2>
            <p className="text-gray-600">Entre com sua conta Google para continuar</p>
          </div>

          <div className="space-y-4">
            <Button
              data-testid="login-google-btn"
              onClick={login}
              className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium text-base"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Entrar com Google
            </Button>

            <p className="text-xs text-center text-gray-500">
              Ao entrar, você concorda com a coleta de dados clínicos<br />
              para fins de registro de anamnese médica
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
