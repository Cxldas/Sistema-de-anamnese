import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquareQuote } from 'lucide-react';

const PERGUNTAS_APOIO = [
  "Qual o motivo da consulta?",
  "O que está sentindo?",
  "Há quanto tempo?",
  "O que mais incomoda?"
];

const QueixaPrincipalStep = ({ data, updateData }) => {
  const qp = data.queixa_principal || {};

  const updateQP = (field, value) => {
    updateData({
      queixa_principal: { ...qp, [field]: value }
    });
  };

  return (
    <Card className="glass-effect border-0">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
          <MessageSquareQuote className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">Perguntas de Apoio</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              {PERGUNTAS_APOIO.map((p, i) => (
                <li key={i}>• {p}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <Label htmlFor="queixa">Queixa Principal (com as palavras do paciente) *</Label>
          <Textarea
            id="queixa"
            data-testid="chief-complaint-input"
            value={qp.texto_entre_aspas || ''}
            onChange={(e) => updateQP('texto_entre_aspas', e.target.value)}
            placeholder='"Estou com muita dor no peito há 3 dias"'
            rows={4}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Registre exatamente como o paciente descreve, entre aspas
          </p>
        </div>

        <div>
          <Label className="mb-2 block">Tempo de Evolução</Label>
          <div className="flex gap-2">
            <Input
              data-testid="complaint-duration-input"
              type="number"
              value={qp.inicio?.há || 0}
              onChange={(e) => updateQP('inicio', {
                ...qp.inicio,
                há: parseInt(e.target.value) || 0
              })}
              placeholder="3"
              className="flex-1"
            />
            <Select
              value={qp.inicio?.unidade || 'dias'}
              onValueChange={(val) => updateQP('inicio', {
                ...qp.inicio,
                unidade: val
              })}
            >
              <SelectTrigger data-testid="complaint-unit-select" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horas">Horas</SelectItem>
                <SelectItem value="dias">Dias</SelectItem>
                <SelectItem value="semanas">Semanas</SelectItem>
                <SelectItem value="meses">Meses</SelectItem>
                <SelectItem value="anos">Anos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QueixaPrincipalStep;
