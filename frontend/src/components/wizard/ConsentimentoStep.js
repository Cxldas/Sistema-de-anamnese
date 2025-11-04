import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shield, CheckCircle2 } from 'lucide-react';

const ConsentimentoStep = ({ data, updateData }) => {
  return (
    <Card className="glass-effect border-0">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
          <Shield className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Termo de Confidencialidade</h3>
            <p className="text-sm text-blue-800">
              Os dados coletados nesta anamnese serão utilizados exclusivamente para fins clínicos,
              respeitando o sigilo médico-paciente conforme previsto no Código de Ética Médica e
              na Lei Geral de Proteção de Dados (LGPD).
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            Dados do Profissional
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prof-nome">Nome do Profissional *</Label>
              <Input
                id="prof-nome"
                data-testid="professional-name-input"
                value={data.meta?.profissional?.nome || ''}
                onChange={(e) => updateData({
                  meta: {
                    ...data.meta,
                    profissional: {
                      ...data.meta?.profissional,
                      nome: e.target.value
                    }
                  }
                })}
                placeholder="Dr(a). João Silva"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="prof-registro">Registro Profissional</Label>
              <Input
                id="prof-registro"
                data-testid="professional-registration-input"
                value={data.meta?.profissional?.registro || ''}
                onChange={(e) => updateData({
                  meta: {
                    ...data.meta,
                    profissional: {
                      ...data.meta?.profissional,
                      registro: e.target.value
                    }
                  }
                })}
                placeholder="CRM 12345"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="prof-unidade">Unidade de Atendimento</Label>
              <Input
                id="prof-unidade"
                data-testid="professional-unit-input"
                value={data.meta?.profissional?.unidade || ''}
                onChange={(e) => updateData({
                  meta: {
                    ...data.meta,
                    profissional: {
                      ...data.meta?.profissional,
                      unidade: e.target.value
                    }
                  }
                })}
                placeholder="Hospital Central"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 border border-teal-200 rounded-xl bg-teal-50">
          <Checkbox
            id="consent"
            data-testid="consent-checkbox"
            checked={data.meta?.consentimento || false}
            onCheckedChange={(checked) => updateData({
              meta: { ...data.meta, consentimento: checked }
            })}
            className="mt-1"
          />
          <Label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
            Confirmo que obtive o consentimento do paciente para coleta e registro dos dados clínicos,
            esclarecendo sobre a confidencialidade das informações e o uso exclusivo para fins de
            atendimento médico.
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConsentimentoStep;
