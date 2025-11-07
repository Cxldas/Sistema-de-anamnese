
# Sistema de Anamnese

Sistema de Anamnese é uma plataforma web inteligente para anamnese clínica, projetada para auxiliar profissionais de saúde a coletar, gerenciar e analisar históricos de pacientes de forma estruturada.

A aplicação utiliza uma interface de usuário moderna em React e um backend robusto em FastAPI com MongoDB. Um dos principais recursos é a capacidade de gerar resumos clínicos coesos e profissionais utilizando IA (GPT-4o-mini), otimizando o tempo do profissional e auxiliando na tomada de decisão.

## ✨ Principais Funcionalidades

  * **Autenticação Segura:** Login via Google, gerenciado por um serviço de proxy e sessões de usuário.
  * **Dashboard de Pacientes:** Visualize, busque e gerencie todas as anamneses criadas. A busca permite filtrar por nome do paciente ou pela queixa principal.
  * **Wizard de Anamnese:** Um formulário guiado de múltiplas etapas para a coleta completa de dados, incluindo:
      * Consentimento
      * Identificação
      * Queixa Principal (QP)
      * História da Doença Atual (HDA)
      * Interrogatório Sistemático (IS)
      * Antecedentes e Hábitos
      * Psicossocial
  * **Salvamento Automático:** O progresso da criação da anamnese é salvo automaticamente no `localStorage` para evitar perda de dados.
  * **Geração de Resumo com IA:** Com um clique, o sistema gera um resumo clínico estruturado com base nos dados fornecidos, utilizando um modelo de LLM.
  * **Exportação de Dados:** Exporte qualquer anamnese completa nos formatos PDF ou JSON.

## 🚀 Tecnologias Utilizadas

Este projeto é um monorepo (ou sistema full-stack) dividido em duas partes principais:

### Frontend (React)

  * **Framework:** **React**
  * **Roteamento:** **React Router** (`react-router-dom`)
  * **Cliente HTTP:** **Axios**
  * **Gerenciamento de Estado:** **React Context** (para autenticação) e hooks (`useState`, `useEffect`)
  * **UI/Estilização:** **Tailwind CSS**
  * **Componentes:** **shadcn/ui** (inferido pelos imports `components/ui/*`)
  * **Ícones:** **Lucide React**
  * **Notificações:** **Sonner** (para toasts)

### Backend (Python/FastAPI)

  * **Framework:** **FastAPI**
  * **Banco de Dados:** **MongoDB** (utilizando `motor` como driver assíncrono)
  * **Geração de PDF:** **ReportLab**
  * **Modelagem de Dados:** **Pydantic**
  * **Integração com IA:** `emergentintegrations` para se conectar a um serviço de LLM (GPT-4o-mini).
  * **Autenticação:** Gerenciamento de sessão via proxy (Emergent) e tokens de sessão no MongoDB.
  * **CORS:** Configurado para permitir a comunicação com o frontend.

## 🏁 Como Executar (Guia de Instalação)

Para executar este projeto, você precisará configurar e iniciar o backend e o frontend separadamente.

### 1\. Backend (FastAPI)

1.  **Clone o repositório** e navegue até a pasta do backend.
2.  **Crie um ambiente virtual:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # No Windows: venv\Scripts\activate
    ```
3.  **Instale as dependências** (assumindo um arquivo `requirements.txt`):
    ```bash
    pip install fastapi "uvicorn[standard]" motor pydantic python-dotenv httpx reportlab emergentintegrations
    ```
4.  **Crie um arquivo `.env`** na raiz do backend com as seguintes variáveis:
    ```.env
    MONGO_URL=mongodb://seu_usuario:sua_senha@host:port/
    DB_NAME=prompt-mestre
    EMERGENT_LLM_KEY=sua_chave_api_llm
    CORS_ORIGINS=http://localhost:3000
    ```
5.  **Inicie o servidor:**
    ```bash
    uvicorn main:app --reload
    ```
    O backend estará disponível em `http://localhost:8000`.

### 2\. Frontend (React)

1.  **Navegue até a pasta do frontend** em um novo terminal.
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Crie um arquivo `.env`** na raiz do frontend:
    ```.env
    REACT_APP_BACKEND_URL=http://localhost:8000
    ```
4.  **Inicie a aplicação React:**
    ```bash
    npm start
    ```
    O frontend estará disponível em `http://localhost:3000`.

## 📂 Arquivos Analisados

Este README foi gerado com base nos seguintes arquivos:

1.  `Dashboard.jsx`: Componente React que exibe a lista de anamneses, permite a busca e a navegação para a criação de uma nova.
2.  `AnamneseWizard.jsx`: Componente React que gerencia o fluxo de criação de anamnese em múltiplas etapas.
3.  `Login.jsx`: Componente React para a página de login, que utiliza o `useAuth` para autenticar o usuário via Google.
4.  `main.py`: O arquivo principal do backend FastAPI, contendo:
      * Modelos Pydantic para `User`, `Anamnese` e todas as suas subseções.
      * Rotas de autenticação (`/auth/session-data`, `/auth/me`, `/auth/logout`).
      * Rotas CRUD completas para `/anamneses`.
      * Rotas de IA e Exportação (`/generate-summary`, `/pdf`, `/json`).
      * Lógica de conexão com o MongoDB e geração de PDF.

## 🗺️ API Endpoints (Resumo)

Todos os endpoints estão prefixados com `/api`.

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/auth/session-data` | Valida a sessão de um provedor (ex: Google) e cria uma sessão local. |
| `GET` | `/auth/me` | Retorna os dados do usuário autenticado. |
| `POST` | `/auth/logout` | Desloga o usuário e expira o cookie de sessão. |
| `POST` | `/anamneses` | Cria uma nova anamnese. |
| `GET` | `/anamneses` | Lista todas as anamneses do usuário (suporta `?search=...`). |
| `GET` | `/anamneses/{id}` | Obtém os detalhes de uma anamnese específica. |
| `PUT` | `/anamneses/{id}` | Atualiza uma anamnese existente. |
| `DELETE` | `/anamneses/{id}` | Deleta uma anamnese. |
| `POST` | `/anamneses/{id}/generate-summary` | Gera e salva o resumo clínico via IA. |
| `GET` | `/anamneses/{id}/pdf` | Exporta a anamnese como um arquivo PDF. |
| `GET` | `/anamneses/{id}/json` | Exporta a anamnese como um arquivo JSON. |
