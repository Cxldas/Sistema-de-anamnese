import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Activity } from 'lucide-react';

const SISTEMAS = [
  {
    key: 'geral',
    title: 'Geral',
    pergunta: 'Como tem se sentido no geral? Febre, perda de peso, fadiga?'
  },
  {
    key: 'respiratorio',
    title: 'Respiratório',
    pergunta: 'Como tem estado sua respiração? Falta de ar, tosse, chiado?'
  },
  {
    key: 'cardiovascular',
    title: 'Cardiovascular',
    pergunta: 'Sente palpítações, dor no peito, inchazo nas pernas?'
  },
  {
    key: 'gastrointestinal',
    title: 'Gastrointestinal',
    pergunta: 'Algum problema com alimentação ou intestinos? Náusea, vômito, diarreia?'
  },
  {
    key: 'geniturinario',
    title: 'Geniturinário',
    pergunta: 'Como está a urina? Dor ao urinar, sangue, frequência alterada?'
  },
  {
    key: 'musculoesqueletico',
    title: 'Musculoesquelético',
    pergunta: 'Sente dores nas articulações ou músculos? Rigidez, limitação de movimento?'
  },
  {
    key: 'neurologico',
    title: 'Neurológico',
    pergunta: 'Tem tonturas, dor de cabeça, formigamentos, fraqueza?'
  },
  {
    key: 'psiquiatrico',
    title: 'Psiquiátrico',
    pergunta: 'Como tem se sentido emocionalmente? Ansiedade, tristeza, sono?'
  },
  {
    key: 'pele',
    title: 'Pele e Anexos',
    pergunta: 'Manchas, coceira, lesões na pele? Problemas com cabelo ou unhas?'
  }
];

const InterrogatorioStep = ({ data, updateData }) => {
  const is = data.interrogatorio_sistematico || {};

  const updateSistema = (key, value) => {
    updateData({
      interrogatorio_sistematico: {
        ...is,
        [key]: value
      }
    });
  };

  return (
    <Card className="glass-effect border-0">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-start gap-4 p-4 bg-teal-50 rounded-xl">
          <Activity className="w-6 h-6 text-teal-600 mt-1" />
          <div>
            <h3 className="font-semibold text-teal-900 mb-2">Interrogatório Sistemático</h3>
            <p className="text-sm text-teal-800">
              Perguntas amplas e não indutoras sobre cada sistema. Registre observações
              relevantes (positivas ou negativas).
            </p>
          </div>
        </div>

        <Accordion type="multiple" className="space-y-2">
          {SISTEMAS.map((sistema) => (
            <AccordionItem
              key={sistema.key}
              value={sistema.key}
              className="border rounded-xl px-4 bg-white"
            >
              <AccordionTrigger
                data-testid={`accordion-${sistema.key}`}
                className="hover:no-underline"
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{sistema.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{sistema.pergunta}</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-3">
                <div>
                  <Label htmlFor={`${sistema.key}-resp`}>Resposta do Paciente</Label>
                  <Textarea
                    id={`${sistema.key}-resp`}
                    data-testid={`is-${sistema.key}-input`}
                    value={is[sistema.key]?.pergunta_guarda_chuva || ''}
                    onChange={(e) => updateSistema(sistema.key, {
                      ...is[sistema.key],
                      pergunta_guarda_chuva: e.target.value
                    })}
                    placeholder="Registre a resposta do paciente..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default InterrogatorioStep;
