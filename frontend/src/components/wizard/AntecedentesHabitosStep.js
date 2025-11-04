import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, Heart } from 'lucide-react';

const AntecedentesHabitosStep = ({ data, updateData }) => {
  const ant = data.antecedentes?.pessoais || {};
  const hab = data.habitos || {};

  const updateAntecedentes = (field, value) => {
    updateData({
      antecedentes: {
        ...data.antecedentes,
        pessoais: {
          ...ant,
          [field]: value
        }
      }
    });
  };

  const updateHabitos = (field, value) => {
    updateData({
      habitos: {
        ...hab,
        [field]: value
      }
    });
  };

  // Calculate pack-years
  const packYears = (hab.tabagismo?.macos_dia || 0) * (hab.tabagismo?.anos || 0);

  return (
    <div className="space-y-6">
      {/* Antecedentes */}
      <Card className="glass-effect border-0">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Antecedentes Pessoais</h3>
          </div>

          <div>
            <Label htmlFor="cronicos">Doenças Crônicas</Label>
            <Textarea
              id="cronicos"
              data-testid="chronic-diseases-input"
              value={ant.cronicos?.join(', ') || ''}
              onChange={(e) => updateAntecedentes('cronicos', 
                e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              )}
              placeholder="Ex: Diabetes, Hipertensão (separe por vírgula)"
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="cirurgias">Cirurgias e Hospitalizações</Label>
            <Textarea
              id="cirurgias"
              data-testid="surgeries-input"
              value={ant.cirurgias_hospitalizacoes?.join(', ') || ''}
              onChange={(e) => updateAntecedentes('cirurgias_hospitalizacoes',
                e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              )}
              placeholder="Ex: Apendicectomia 2015, Internação por pneumonia 2020"
              rows={2}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hábitos */}
      <Card className="glass-effect border-0">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600" />
            <h3 className="font-semibold text-gray-800">Hábitos de Vida</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="atividade">Atividade Física</Label>
              <Input
                id="atividade"
                data-testid="physical-activity-input"
                value={hab.atividade_fisica?.tipo || ''}
                onChange={(e) => updateHabitos('atividade_fisica', {
                  ...hab.atividade_fisica,
                  tipo: e.target.value
                })}
                placeholder="Ex: Caminhada 3x/semana"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="sono">Sono (horas/dia)</Label>
              <Input
                id="sono"
                data-testid="sleep-hours-input"
                type="number"
                value={hab.sono?.horas || 0}
                onChange={(e) => updateHabitos('sono', {
                  ...hab.sono,
                  horas: parseFloat(e.target.value) || 0
                })}
                placeholder="8"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="alimentacao">Padrão Alimentar</Label>
              <Textarea
                id="alimentacao"
                data-testid="diet-input"
                value={hab.alimentacao?.padrao || ''}
                onChange={(e) => updateHabitos('alimentacao', {
                  ...hab.alimentacao,
                  padrao: e.target.value
                })}
                placeholder="Descreva o padrão alimentar..."
                rows={2}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabagismo */}
      <Card className="glass-effect border-0">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Tabagismo</h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select
                value={hab.tabagismo?.status || 'nunca'}
                onValueChange={(val) => updateHabitos('tabagismo', {
                  ...hab.tabagismo,
                  status: val
                })}
              >
                <SelectTrigger data-testid="smoking-status-select" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nunca">Nunca fumou</SelectItem>
                  <SelectItem value="ex">Ex-fumante</SelectItem>
                  <SelectItem value="atual">Fumante atual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hab.tabagismo?.status !== 'nunca' && (
              <>
                <div>
                  <Label htmlFor="macos">Maços/dia</Label>
                  <Input
                    id="macos"
                    data-testid="packs-per-day-input"
                    type="number"
                    step="0.5"
                    value={hab.tabagismo?.macos_dia || 0}
                    onChange={(e) => updateHabitos('tabagismo', {
                      ...hab.tabagismo,
                      macos_dia: parseFloat(e.target.value) || 0
                    })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="anos">Anos</Label>
                  <Input
                    id="anos"
                    data-testid="smoking-years-input"
                    type="number"
                    value={hab.tabagismo?.anos || 0}
                    onChange={(e) => updateHabitos('tabagismo', {
                      ...hab.tabagismo,
                      anos: parseInt(e.target.value) || 0
                    })}
                    className="mt-1"
                  />
                </div>
              </>
            )}
          </div>

          {hab.tabagismo?.status !== 'nunca' && packYears > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Carga Tabágica:</strong> {packYears.toFixed(1)} pack-years
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Etilismo */}
      <Card className="glass-effect border-0">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Etilismo</h3>

          <div>
            <Label htmlFor="doses">Doses/semana</Label>
            <Input
              id="doses"
              data-testid="alcohol-doses-input"
              type="number"
              value={hab.etilismo?.doses_semana || 0}
              onChange={(e) => updateHabitos('etilismo', {
                ...hab.etilismo,
                doses_semana: parseInt(e.target.value) || 0
              })}
              placeholder="0"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">1 dose = 14g de álcool puro</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AntecedentesHabitosStep;
