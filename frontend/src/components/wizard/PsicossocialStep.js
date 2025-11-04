import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, CheckCircle } from 'lucide-react';

const PsicossocialStep = ({ data, updateData }) => {
  const ps = data.psicossocial || {};
  const ident = data.identificacao || {};

  const updatePsicossocial = (field, value) => {
    updateData({
      psicossocial: {
        ...ps,
        [field]: value
      }
    });
  };

  const updateGrauConfiabilidade = (value) => {
    updateData({
      identificacao: {
        ...ident,
        grau_confiabilidade: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-0">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">Condições Psicossociais</h3>
          </div>

          <div>
            <Label htmlFor="composicao">Composição Familiar</Label>
            <Textarea
              id="composicao"
              data-testid="family-composition-input"
              value={ps.composicao_familiar || ''}
              onChange={(e) => updatePsicossocial('composicao_familiar', e.target.value)}
              placeholder="Com quem mora? Quantas pessoas?"
              rows={2}
              className="mt-1"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dependentes">Número de Dependentes</Label>
              <Input
                id="dependentes"
                data-testid="dependents-input"
                type="number"
                value={ps.dependentes || 0}
                onChange={(e) => updatePsicossocial('dependentes', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="renda">Renda Familiar (faixa)</Label>
              <Input
                id="renda"
                data-testid="income-input"
                value={ps.renda_familiar_faixa || ''}
                onChange={(e) => updatePsicossocial('renda_familiar_faixa', e.target.value)}
                placeholder="Ex: 2-3 salários mínimos"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="saneamento">Saneamento Básico</Label>
            <Input
              id="saneamento"
              data-testid="sanitation-input"
              value={ps.saneamento || ''}
              onChange={(e) => updatePsicossocial('saneamento', e.target.value)}
              placeholder="Esgoto, coleta de lixo, etc."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="barreiras">Barreiras de Acesso à Saúde</Label>
            <Textarea
              id="barreiras"
              data-testid="barriers-input"
              value={ps.barreiras_acesso || ''}
              onChange={(e) => updatePsicossocial('barreiras_acesso', e.target.value)}
              placeholder="Transporte, tempo, alfabetização em saúde, etc."
              rows={2}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Revisão Final */}
      <Card className="glass-effect border-0 border-2 border-teal-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-teal-600" />
            <h3 className="font-semibold text-gray-800">Revisão Final</h3>
          </div>

          <div>
            <Label>Grau de Confiabilidade da História</Label>
            <Select
              value={ident.grau_confiabilidade || 'bom'}
              onValueChange={updateGrauConfiabilidade}
            >
              <SelectTrigger data-testid="reliability-select" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="otimo">Ótimo</SelectItem>
                <SelectItem value="bom">Bom</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="ruim">Ruim</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-teal-50 rounded-lg">
            <p className="text-sm text-teal-800">
              <strong>Lembre-se:</strong> Revise todos os dados antes de salvar. A anamnese
              será registrada com data e hora automaticamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PsicossocialStep;
