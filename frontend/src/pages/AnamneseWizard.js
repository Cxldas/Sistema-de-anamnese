import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';

// Import wizard steps
import ConsentimentoStep from '@/components/wizard/ConsentimentoStep';
import IdentificacaoStep from '@/components/wizard/IdentificacaoStep';
import QueixaPrincipalStep from '@/components/wizard/QueixaPrincipalStep';
import HDAStep from '@/components/wizard/HDAStep';
import InterrogatorioStep from '@/components/wizard/InterrogatorioStep';
import AntecedentesHabitosStep from '@/components/wizard/AntecedentesHabitosStep';
import PsicossocialStep from '@/components/wizard/PsicossocialStep';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEPS = [
  { id: 'consentimento', title: 'Consentimento', component: ConsentimentoStep },
  { id: 'identificacao', title: 'Identificação', component: IdentificacaoStep },
  { id: 'queixa', title: 'Queixa Principal', component: QueixaPrincipalStep },
  { id: 'hda', title: 'HDA', component: HDAStep },
  { id: 'is', title: 'Interrogatório Sistemático', component: InterrogatorioStep },
  { id: 'antecedentes', title: 'Antecedentes & Hábitos', component: AntecedentesHabitosStep },
  { id: 'psicossocial', title: 'Psicossocial & Revisão', component: PsicossocialStep }
];

const AnamneseWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('anamnese_draft');
    return saved ? JSON.parse(saved) : getInitialData();
  });
  const [saving, setSaving] = useState(false);

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('anamnese_draft', JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  const updateFormData = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Calculate pack-years
      if (formData.habitos?.tabagismo) {
        formData.habitos.tabagismo.carga_tabagica_packyears = 
          formData.habitos.tabagismo.macos_dia * formData.habitos.tabagismo.anos;
      }

      const response = await axios.post(`${API}/anamneses`, formData, {
        withCredentials: true
      });

      localStorage.removeItem('anamnese_draft');
      toast.success('Anamnese salva com sucesso!');
      navigate(`/anamnese/${response.data.id}`);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar anamnese');
    } finally {
      setSaving(false);
    }
  };

  const StepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="glass-effect border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                data-testid="back-to-dashboard-btn"
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
                <h1 className="text-xl font-bold text-gray-800">Nova Anamnese</h1>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Etapa {currentStep + 1} de {STEPS.length}
            </div>
          </div>

          <Progress value={progress} className="h-2 progress-animate" />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {STEPS[currentStep].title}
          </h2>
          <div className="flex gap-2 flex-wrap">
            {STEPS.map((step, idx) => (
              <span
                key={step.id}
                className={`text-xs px-2 py-1 rounded-full ${
                  idx === currentStep
                    ? 'bg-teal-500 text-white'
                    : idx < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        <div className="fade-in">
          <StepComponent
            data={formData}
            updateData={updateFormData}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            data-testid="prev-step-btn"
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {currentStep === STEPS.length - 1 ? (
              <Button
                data-testid="save-anamnese-btn"
                onClick={handleSave}
                disabled={saving}
                className="bg-teal-500 hover:bg-teal-600 text-white gap-2 px-8"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Anamnese
                  </>
                )}
              </Button>
            ) : (
              <Button
                data-testid="next-step-btn"
                onClick={handleNext}
                className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
              >
                Próxima
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function getInitialData() {
  return {
    meta: {
      consentimento: false,
      profissional: { nome: '', registro: '', unidade: '' },
      timestamp_iso: new Date().toISOString()
    },
    identificacao: {
      nome_completo: '',
      nome_social: '',
      genero: '',
      sexo_biologico: 'masculino',
      idade: { valor: 0, unidade: 'anos' },
      cor_etnia: 'branca',
      estado_civil: 'solteiro',
      ocupacao: { atividade: '', local: '', condicoes: '' },
      escolaridade: '',
      religiao: '',
      naturalidade: { cidade: '', uf: '' },
      procedencia: { cidade: '', uf: '' },
      mae: '',
      responsavel_ou_cuidador: '',
      plano_ou_previdencia: '',
      grau_confiabilidade: 'bom'
    },
    queixa_principal: {
      texto_entre_aspas: '',
      inicio: { há: 0, unidade: 'dias' }
    },
    hda: {
      narrativa: '',
      sintomas_principais: [],
      impacto_vida: ''
    },
    interrogatorio_sistematico: {
      geral: { pergunta_guarda_chuva: '', itens: [] },
      respiratorio: { pergunta_guarda_chuva: '', itens: [] },
      cardiovascular: { pergunta_guarda_chuva: '', itens: [] },
      gastrointestinal: { pergunta_guarda_chuva: '', itens: [] },
      geniturinario: { pergunta_guarda_chuva: '', itens: [] },
      musculoesqueletico: { pergunta_guarda_chuva: '', itens: [] },
      neurologico: { pergunta_guarda_chuva: '', itens: [] },
      psiquiatrico: { pergunta_guarda_chuva: '', itens: [] },
      endocrino: { pergunta_guarda_chuva: '', itens: [] },
      hemato: { pergunta_guarda_chuva: '', itens: [] },
      pele: { pergunta_guarda_chuva: '', itens: [] },
      reprodutivo: { pergunta_guarda_chuva: '', itens: [] }
    },
    antecedentes: {
      pessoais: {
        cronicos: [],
        alergias: [],
        medicacoes_uso: [],
        cirurgias_hospitalizacoes: [],
        imunizacoes_relevantes: []
      },
      familiares: [],
      estado_atual: { fisico: '', mental: '' },
      linha_do_tempo: []
    },
    habitos: {
      atividade_fisica: { tipo: '', frequencia_semana: 0, duracao_min: 0 },
      sono: { horas: 0, qualidade: '' },
      alimentacao: { padrao: '', restricoes: '' },
      tabagismo: { status: 'nunca', macos_dia: 0, anos: 0, carga_tabagica_packyears: 0 },
      etilismo: { tipos: [], doses_semana: 0, uso_pesado_ep: false },
      outras_substancias: ''
    },
    psicossocial: {
      composicao_familiar: '',
      dependentes: 0,
      renda_familiar_faixa: '',
      saneamento: '',
      agua_segura: '',
      riscos_ocupacionais: '',
      suporte_social: '',
      crencas_praticas_culturais: '',
      barreiras_acesso: ''
    }
  };
}

export default AnamneseWizard;
