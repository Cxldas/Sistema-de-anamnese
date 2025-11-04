import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen } from 'lucide-react';

const HDAStep = ({ data, updateData }) => {
  const hda = data.hda || {};

  const updateHDA = (field, value) => {
    updateData({
      hda: { ...hda, [field]: value }
    });
  };

  return (
    <Card className="glass-effect border-0">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
          <BookOpen className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Atributos do Sintoma</h3>
            <p className="text-sm text-blue-800">
              Inclua na narrativa: <strong>localização, características, intensidade,
              cronologia, situações de ocorrência, fatores que agravam/aliviam</strong> e
              manifestações associadas.
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="hda-narrativa">História da Doença Atual (HDA) *</Label>
          <Textarea
            id="hda-narrativa"
            data-testid="hda-narrative-input"
            value={hda.narrativa || ''}
            onChange={(e) => updateHDA('narrativa', e.target.value)}
            placeholder="Descreva cronologicamente o início, evolução e características dos sintomas..."
            rows={8}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="hda-impacto">Impacto na Vida Diária</Label>
          <Textarea
            id="hda-impacto"
            data-testid="hda-impact-input"
            value={hda.impacto_vida || ''}
            onChange={(e) => updateHDA('impacto_vida', e.target.value)}
            placeholder="Como os sintomas afetam as atividades diárias, trabalho, sono, etc."
            rows={3}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default HDAStep;
