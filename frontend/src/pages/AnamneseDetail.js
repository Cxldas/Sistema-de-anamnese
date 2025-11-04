import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, FileText, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AnamneseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anamnese, setAnamnese] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    fetchAnamnese();
  }, [id]);

  const fetchAnamnese = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/anamneses/${id}`, {
        withCredentials: true
      });
      setAnamnese(response.data);
    } catch (error) {
      console.error('Error fetching anamnese:', error);
      toast.error('Erro ao carregar anamnese');
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    try {
      setGeneratingSummary(true);
      const response = await axios.post(
        `${API}/anamneses/${id}/generate-summary`,
        {},
        { withCredentials: true }
      );
      
      setAnamnese(prev => ({
        ...prev,
        resumo_clinico_ia: response.data.resumo_clinico
      }));
      
      toast.success('Resumo gerado com sucesso!');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Erro ao gerar resumo');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const downloadPDF = () => {
    window.open(`${API}/anamneses/${id}/pdf`, '_blank');
  };

  const downloadJSON = () => {
    window.open(`${API}/anamneses/${id}/json`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!anamnese) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Anamnese não encontrada</p>
      </div>
    );
  }

  const ident = anamnese.identificacao;
  const qp = anamnese.queixa_principal;
  const hda = anamnese.hda;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="glass-effect border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-btn"
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <h1 className="text-xl font-bold text-gray-800">Detalhes da Anamnese</h1>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              data-testid="download-pdf-btn"
              onClick={downloadPDF}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button
              data-testid="download-json-btn"
              onClick={downloadJSON}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              JSON
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Identificação */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-800">Identificação</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Nome:</strong> {ident.nome_completo}</p>
            {ident.nome_social && <p><strong>Nome Social:</strong> {ident.nome_social}</p>}
            <p>
              <strong>Idade:</strong> {ident.idade.valor} {ident.idade.unidade} | 
              <strong> Sexo:</strong> {ident.sexo_biologico}
              {ident.genero && ` (${ident.genero})`}
            </p>
            <p><strong>Cor/Etnia:</strong> {ident.cor_etnia} | <strong>Estado Civil:</strong> {ident.estado_civil}</p>
            <p><strong>Ocupação:</strong> {ident.ocupacao.atividade}</p>
            <p>
              <strong>Naturalidade:</strong> {ident.naturalidade.cidade}/{ident.naturalidade.uf} | 
              <strong> Procedência:</strong> {ident.procedencia.cidade}/{ident.procedencia.uf}
            </p>
            <div className="pt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                ident.grau_confiabilidade === 'otimo' ? 'bg-green-100 text-green-700' :
                ident.grau_confiabilidade === 'bom' ? 'bg-blue-100 text-blue-700' :
                ident.grau_confiabilidade === 'regular' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                Confiabilidade: {ident.grau_confiabilidade}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Queixa Principal */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-800">Queixa Principal</h2>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 italic">{qp.texto_entre_aspas}</p>
            <p className="text-sm text-gray-600 mt-2">
              Início: há {qp.inicio.há} {qp.inicio.unidade}
            </p>
          </CardContent>
        </Card>

        {/* HDA */}
        <Card className="glass-effect border-0">
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-800">História da Doença Atual</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700 whitespace-pre-line">{hda.narrativa}</p>
            {hda.impacto_vida && (
              <div className="pt-3 border-t">
                <p><strong>Impacto na vida:</strong> {hda.impacto_vida}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Antecedentes */}
        {anamnese.antecedentes?.pessoais && (
          <Card className="glass-effect border-0">
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-800">Antecedentes</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {anamnese.antecedentes.pessoais.cronicos?.length > 0 && (
                <p><strong>Crônicos:</strong> {anamnese.antecedentes.pessoais.cronicos.join(', ')}</p>
              )}
              {anamnese.antecedentes.pessoais.alergias?.length > 0 && (
                <p><strong>Alergias:</strong> {anamnese.antecedentes.pessoais.alergias.map(a => `${a.agente} (${a.reacao})`).join(', ')}</p>
              )}
              {anamnese.antecedentes.pessoais.medicacoes_uso?.length > 0 && (
                <div>
                  <p><strong>Medicações em uso:</strong></p>
                  <ul className="list-disc pl-6 mt-1">
                    {anamnese.antecedentes.pessoais.medicacoes_uso.map((m, i) => (
                      <li key={i}>{m.nome} - {m.dose} - {m.posologia}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Hábitos */}
        {anamnese.habitos && (
          <Card className="glass-effect border-0">
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-800">Hábitos de Vida</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Tabagismo:</strong> {anamnese.habitos.tabagismo.status}
                {anamnese.habitos.tabagismo.status !== 'nunca' && 
                  ` (${anamnese.habitos.tabagismo.carga_tabagica_packyears} pack-years)`
                }
              </p>
              <p><strong>Etilismo:</strong> {anamnese.habitos.etilismo.doses_semana} doses/semana</p>
              {anamnese.habitos.atividade_fisica?.tipo && (
                <p><strong>Atividade física:</strong> {anamnese.habitos.atividade_fisica.tipo}</p>
              )}
              {anamnese.habitos.sono?.horas > 0 && (
                <p><strong>Sono:</strong> {anamnese.habitos.sono.horas} horas/dia</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Summary */}
        <Card className="glass-effect border-0 border-2 border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">Resumo Clínico (IA)</h2>
              </div>
              {!anamnese.resumo_clinico_ia && (
                <Button
                  data-testid="generate-summary-btn"
                  onClick={generateSummary}
                  disabled={generatingSummary}
                  className="bg-purple-500 hover:bg-purple-600 text-white gap-2"
                >
                  {generatingSummary ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Resumo
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {anamnese.resumo_clinico_ia ? (
              <p className="text-gray-700 whitespace-pre-line">{anamnese.resumo_clinico_ia}</p>
            ) : (
              <p className="text-gray-500 italic">
                Clique em "Gerar Resumo" para criar um resumo clínico automatizado com IA
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnamneseDetail;
