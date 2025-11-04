import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const IdentificacaoStep = ({ data, updateData }) => {
  const ident = data.identificacao || {};

  const updateIdent = (field, value) => {
    updateData({
      identificacao: { ...ident, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-0">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Dados Pessoais</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                data-testid="patient-name-input"
                value={ident.nome_completo || ''}
                onChange={(e) => updateIdent('nome_completo', e.target.value)}
                placeholder="Nome completo sem abreviações"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="nome-social">Nome Social</Label>
              <Input
                id="nome-social"
                data-testid="social-name-input"
                value={ident.nome_social || ''}
                onChange={(e) => updateIdent('nome_social', e.target.value)}
                placeholder="Se aplicável"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="genero">Gênero</Label>
              <Input
                id="genero"
                data-testid="gender-input"
                value={ident.genero || ''}
                onChange={(e) => updateIdent('genero', e.target.value)}
                placeholder="Cisgênero, transgênero, não-binário..."
                className="mt-1"
              />
            </div>

            <div>
              <Label>Sexo Biológico *</Label>
              <Select
                value={ident.sexo_biologico || 'masculino'}
                onValueChange={(val) => updateIdent('sexo_biologico', val)}
              >
                <SelectTrigger data-testid="biological-sex-select" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Idade *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  data-testid="age-value-input"
                  type="number"
                  value={ident.idade?.valor || 0}
                  onChange={(e) => updateIdent('idade', {
                    ...ident.idade,
                    valor: parseInt(e.target.value) || 0
                  })}
                  className="flex-1"
                />
                <Select
                  value={ident.idade?.unidade || 'anos'}
                  onValueChange={(val) => updateIdent('idade', {
                    ...ident.idade,
                    unidade: val
                  })}
                >
                  <SelectTrigger data-testid="age-unit-select" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dias">Dias</SelectItem>
                    <SelectItem value="meses">Meses</SelectItem>
                    <SelectItem value="anos">Anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Cor/Etnia *</Label>
              <Select
                value={ident.cor_etnia || 'branca'}
                onValueChange={(val) => updateIdent('cor_etnia', val)}
              >
                <SelectTrigger data-testid="ethnicity-select" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="branca">Branca</SelectItem>
                  <SelectItem value="parda">Parda</SelectItem>
                  <SelectItem value="preta">Preta</SelectItem>
                  <SelectItem value="indigena">Indígena</SelectItem>
                  <SelectItem value="asiatica">Asiática</SelectItem>
                  <SelectItem value="outra">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Estado Civil *</Label>
              <Select
                value={ident.estado_civil || 'solteiro'}
                onValueChange={(val) => updateIdent('estado_civil', val)}
              >
                <SelectTrigger data-testid="marital-status-select" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                  <SelectItem value="casado">Casado(a)</SelectItem>
                  <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                  <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                  <SelectItem value="uniao_estavel">União Estável</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="escolaridade">Escolaridade</Label>
              <Input
                id="escolaridade"
                data-testid="education-input"
                value={ident.escolaridade || ''}
                onChange={(e) => updateIdent('escolaridade', e.target.value)}
                placeholder="Ex: Ensino superior completo"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-0">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Ocupação</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ocupacao">Atividade/Profissão</Label>
              <Input
                id="ocupacao"
                data-testid="occupation-input"
                value={ident.ocupacao?.atividade || ''}
                onChange={(e) => updateIdent('ocupacao', {
                  ...ident.ocupacao,
                  atividade: e.target.value
                })}
                placeholder="Ex: Enfermeiro(a)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="local-trabalho">Local de Trabalho</Label>
              <Input
                id="local-trabalho"
                data-testid="workplace-input"
                value={ident.ocupacao?.local || ''}
                onChange={(e) => updateIdent('ocupacao', {
                  ...ident.ocupacao,
                  local: e.target.value
                })}
                placeholder="Ex: Hospital XYZ"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-0">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">Localização</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nat-cidade">Naturalidade (Cidade)</Label>
              <Input
                id="nat-cidade"
                data-testid="birth-city-input"
                value={ident.naturalidade?.cidade || ''}
                onChange={(e) => updateIdent('naturalidade', {
                  ...ident.naturalidade,
                  cidade: e.target.value
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="nat-uf">UF</Label>
              <Input
                id="nat-uf"
                data-testid="birth-state-input"
                value={ident.naturalidade?.uf || ''}
                onChange={(e) => updateIdent('naturalidade', {
                  ...ident.naturalidade,
                  uf: e.target.value
                })}
                maxLength={2}
                placeholder="SP"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="proc-cidade">Procedência (Cidade)</Label>
              <Input
                id="proc-cidade"
                data-testid="residence-city-input"
                value={ident.procedencia?.cidade || ''}
                onChange={(e) => updateIdent('procedencia', {
                  ...ident.procedencia,
                  cidade: e.target.value
                })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="proc-uf">UF</Label>
              <Input
                id="proc-uf"
                data-testid="residence-state-input"
                value={ident.procedencia?.uf || ''}
                onChange={(e) => updateIdent('procedencia', {
                  ...ident.procedencia,
                  uf: e.target.value
                })}
                maxLength={2}
                placeholder="RJ"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IdentificacaoStep;
