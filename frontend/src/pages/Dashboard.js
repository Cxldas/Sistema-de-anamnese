import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Plus, Search, FileText, LogOut, User, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anamneses, setAnamneses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAnamneses();
  }, []);

  const fetchAnamneses = async (search = '') => {
    try {
      setLoading(true);
      const url = search ? `${API}/anamneses?search=${encodeURIComponent(search)}` : `${API}/anamneses`;
      const response = await axios.get(url, { withCredentials: true });
      setAnamneses(response.data);
    } catch (error) {
      console.error('Error fetching anamneses:', error);
      toast.error('Erro ao carregar anamneses');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAnamneses(searchTerm);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="glass-effect border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-xl">
              <FileText className="w-6 h-6 text-teal-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">PROMPT-MESTRE</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <Button
              data-testid="logout-btn"
              onClick={logout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Minhas Anamneses</h2>
            <p className="text-gray-600">Gerencie e visualize suas anamneses clínicas</p>
          </div>

          <Button
            data-testid="new-anamnese-btn"
            onClick={() => navigate('/anamnese/nova')}
            className="bg-teal-500 hover:bg-teal-600 text-white gap-2 h-11 px-6 rounded-xl"
          >
            <Plus className="w-5 h-5" />
            Nova Anamnese
          </Button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                data-testid="search-input"
                type="text"
                placeholder="Buscar por nome do paciente ou queixa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
            <Button
              data-testid="search-btn"
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-xl"
            >
              Buscar
            </Button>
          </div>
        </form>

        {/* Anamneses List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        ) : anamneses.length === 0 ? (
          <Card className="text-center py-12 glass-effect border-0">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Nenhuma anamnese encontrada
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Tente outro termo de busca' : 'Clique em "Nova Anamnese" para começar'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {anamneses.map((anamnese, index) => (
              <Card
                key={anamnese.id}
                data-testid={`anamnese-card-${index}`}
                className="card-hover glass-effect border-0 cursor-pointer"
                onClick={() => navigate(`/anamnese/${anamnese.id}`)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {anamnese.identificacao.nome_completo}
                        </h3>
                        <span className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full">
                          {anamnese.identificacao.idade.valor} {anamnese.identificacao.idade.unidade}
                        </span>
                      </div>

                      <p className="text-gray-600 line-clamp-2">
                        <span className="font-medium">QP:</span> {anamnese.queixa_principal.texto_entre_aspas}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(anamnese.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span>{anamnese.identificacao.grau_confiabilidade}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        data-testid={`view-btn-${index}`}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/anamnese/${anamnese.id}`);
                        }}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
