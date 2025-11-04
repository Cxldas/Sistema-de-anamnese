from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, status
from fastapi.responses import StreamingResponse, JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER
import io
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# LLM Configuration
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# =======================
# MODELS
# =======================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionDataResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

# Anamnese Models
class IdadeModel(BaseModel):
    valor: int
    unidade: str  # "anos", "meses", "dias"

class LocalidadeModel(BaseModel):
    cidade: str
    uf: str

class OcupacaoModel(BaseModel):
    atividade: str
    local: str = ""
    condicoes: str = ""

class IdentificacaoModel(BaseModel):
    nome_completo: str
    nome_social: str = ""
    genero: str = ""
    sexo_biologico: str  # masculino, feminino
    idade: IdadeModel
    cor_etnia: str
    estado_civil: str
    ocupacao: OcupacaoModel
    escolaridade: str
    religiao: str = ""
    naturalidade: LocalidadeModel
    procedencia: LocalidadeModel
    mae: str = ""
    responsavel_ou_cuidador: str = ""
    plano_ou_previdencia: str = ""
    grau_confiabilidade: str = "bom"

class QueixaPrincipalModel(BaseModel):
    texto_entre_aspas: str
    inicio: Dict[str, Any]  # {"há": 3, "unidade": "dias"}

class CronologiaModel(BaseModel):
    inicio: str = ""
    duracao: str = ""
    frequencia: str = ""

class SintomaModel(BaseModel):
    nome: str
    localizacao: str = ""
    caracteristicas: str = ""
    intensidade_0a10: Optional[int] = None
    cronologia: CronologiaModel
    situacoes: str = ""
    fatores_agrava: str = ""
    fatores_alivia: str = ""
    associados: str = ""
    pertinentes_positivos: List[str] = []
    pertinentes_negativos: List[str] = []

class HDAModel(BaseModel):
    narrativa: str
    sintomas_principais: List[SintomaModel] = []
    impacto_vida: str = ""

class SistemaISModel(BaseModel):
    pergunta_guarda_chuva: str = ""
    itens: List[Dict[str, Any]] = []  # [{"sintoma": "tosse", "presente": true, "detalhes": "..."}]

class InterrogatorioSistematicoModel(BaseModel):
    geral: SistemaISModel = SistemaISModel()
    respiratorio: SistemaISModel = SistemaISModel()
    cardiovascular: SistemaISModel = SistemaISModel()
    gastrointestinal: SistemaISModel = SistemaISModel()
    geniturinario: SistemaISModel = SistemaISModel()
    musculoesqueletico: SistemaISModel = SistemaISModel()
    neurologico: SistemaISModel = SistemaISModel()
    psiquiatrico: SistemaISModel = SistemaISModel()
    endocrino: SistemaISModel = SistemaISModel()
    hemato: SistemaISModel = SistemaISModel()
    pele: SistemaISModel = SistemaISModel()
    reprodutivo: SistemaISModel = SistemaISModel()

class AlergiaModel(BaseModel):
    agente: str
    reacao: str

class MedicacaoModel(BaseModel):
    nome: str
    dose: str
    posologia: str

class AntecedentePessoalModel(BaseModel):
    cronicos: List[str] = []
    alergias: List[AlergiaModel] = []
    medicacoes_uso: List[MedicacaoModel] = []
    cirurgias_hospitalizacoes: List[str] = []
    imunizacoes_relevantes: List[str] = []

class AntecedenteFamiliarModel(BaseModel):
    parentesco: str
    condicao: str

class EstadoAtualModel(BaseModel):
    fisico: str = ""
    mental: str = ""

class EventoLinhaTempoModel(BaseModel):
    ano: str
    evento: str

class AntecedentesModel(BaseModel):
    pessoais: AntecedentePessoalModel
    familiares: List[AntecedenteFamiliarModel] = []
    estado_atual: EstadoAtualModel = EstadoAtualModel()
    linha_do_tempo: List[EventoLinhaTempoModel] = []

class AtividadeFisicaModel(BaseModel):
    tipo: str = ""
    frequencia_semana: int = 0
    duracao_min: int = 0

class SonoModel(BaseModel):
    horas: float = 0
    qualidade: str = ""

class AlimentacaoModel(BaseModel):
    padrao: str = ""
    restricoes: str = ""

class TabagismoModel(BaseModel):
    status: str = "nunca"  # nunca, ex, atual
    macos_dia: float = 0
    anos: int = 0
    carga_tabagica_packyears: float = 0

class EtilismoModel(BaseModel):
    tipos: List[str] = []
    doses_semana: int = 0
    uso_pesado_ep: bool = False

class HabitosModel(BaseModel):
    atividade_fisica: AtividadeFisicaModel = AtividadeFisicaModel()
    sono: SonoModel = SonoModel()
    alimentacao: AlimentacaoModel = AlimentacaoModel()
    tabagismo: TabagismoModel = TabagismoModel()
    etilismo: EtilismoModel = EtilismoModel()
    outras_substancias: str = ""

class PsicossocialModel(BaseModel):
    composicao_familiar: str = ""
    dependentes: int = 0
    renda_familiar_faixa: str = ""
    saneamento: str = ""
    agua_segura: str = ""
    riscos_ocupacionais: str = ""
    suporte_social: str = ""
    crencas_praticas_culturais: str = ""
    barreiras_acesso: str = ""

class AuditoriaModel(BaseModel):
    data_hora_anamnese: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    versao_registro: int = 1

class MetaModel(BaseModel):
    consentimento: bool = False
    profissional: Dict[str, str] = {"nome": "", "registro": "", "unidade": ""}
    timestamp_iso: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Anamnese(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    meta: MetaModel
    identificacao: IdentificacaoModel
    queixa_principal: QueixaPrincipalModel
    hda: HDAModel
    interrogatorio_sistematico: InterrogatorioSistematicoModel = InterrogatorioSistematicoModel()
    antecedentes: AntecedentesModel
    habitos: HabitosModel
    psicossocial: PsicossocialModel
    auditoria: AuditoriaModel = AuditoriaModel()
    resumo_clinico_ia: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnamneseCreate(BaseModel):
    meta: MetaModel
    identificacao: IdentificacaoModel
    queixa_principal: QueixaPrincipalModel
    hda: HDAModel
    interrogatorio_sistematico: InterrogatorioSistematicoModel = InterrogatorioSistematicoModel()
    antecedentes: AntecedentesModel
    habitos: HabitosModel
    psicossocial: PsicossocialModel

class AnamneseUpdate(BaseModel):
    meta: Optional[MetaModel] = None
    identificacao: Optional[IdentificacaoModel] = None
    queixa_principal: Optional[QueixaPrincipalModel] = None
    hda: Optional[HDAModel] = None
    interrogatorio_sistematico: Optional[InterrogatorioSistematicoModel] = None
    antecedentes: Optional[AntecedentesModel] = None
    habitos: Optional[HabitosModel] = None
    psicossocial: Optional[PsicossocialModel] = None

class GenerateSummaryResponse(BaseModel):
    resumo_clinico: str

# =======================
# AUTH HELPERS
# =======================

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token (cookie or header)"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
    
    if not session_token:
        return None
    
    session = await db.user_sessions.find_one({"session_token": session_token})
    if not session:
        return None
    
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    
    if expires_at < datetime.now(timezone.utc):
        await db.user_sessions.delete_one({"session_token": session_token})
        return None
    
    user_doc = await db.users.find_one({"id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        return None
    
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

async def require_auth(request: Request) -> User:
    """Require authentication, raise 401 if not authenticated"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# =======================
# AUTH ROUTES
# =======================

@api_router.post("/auth/session-data", response_model=SessionDataResponse)
async def get_session_data(request: Request):
    """Proxy to Emergent auth service"""
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="X-Session-ID header required")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Auth failed")
        
        data = response.json()
    
    user_doc = await db.users.find_one({"email": data["email"]}, {"_id": 0})
    
    if not user_doc:
        user = User(
            id=str(uuid.uuid4()),
            email=data["email"],
            name=data["name"],
            picture=data.get("picture")
        )
        user_dict = user.model_dump()
        user_dict["created_at"] = user_dict["created_at"].isoformat()
        await db.users.insert_one(user_dict)
        user_id = user.id
    else:
        user_id = user_doc["id"]
    
    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session = UserSession(
        user_id=user_id,
        session_token=session_token,
        expires_at=expires_at
    )
    
    session_dict = session.model_dump()
    session_dict["expires_at"] = session_dict["expires_at"].isoformat()
    session_dict["created_at"] = session_dict["created_at"].isoformat()
    
    await db.user_sessions.insert_one(session_dict)
    
    return SessionDataResponse(
        id=user_id,
        email=data["email"],
        name=data["name"],
        picture=data.get("picture"),
        session_token=session_token
    )

@api_router.get("/auth/me", response_model=User)
async def get_me(request: Request):
    """Get current user"""
    user = await require_auth(request)
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie("session_token", path="/", domain=None)
    return {"message": "Logged out"}

# =======================
# ANAMNESE ROUTES
# =======================

@api_router.post("/anamneses", response_model=Anamnese)
async def create_anamnese(input: AnamneseCreate, request: Request):
    """Create new anamnese"""
    user = await require_auth(request)
    
    anamnese_data = input.model_dump()
    anamnese_data["user_id"] = user.id
    anamnese_data["id"] = str(uuid.uuid4())
    anamnese_data["auditoria"] = AuditoriaModel().model_dump()
    anamnese_data["created_at"] = datetime.now(timezone.utc)
    anamnese_data["updated_at"] = datetime.now(timezone.utc)
    
    anamnese_obj = Anamnese(**anamnese_data)
    
    doc = anamnese_obj.model_dump()
    doc["meta"]["timestamp_iso"] = doc["meta"]["timestamp_iso"].isoformat()
    doc["auditoria"]["data_hora_anamnese"] = doc["auditoria"]["data_hora_anamnese"].isoformat()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    
    await db.anamneses.insert_one(doc)
    
    return anamnese_obj

@api_router.get("/anamneses", response_model=List[Anamnese])
async def list_anamneses(request: Request, search: Optional[str] = None):
    """List anamneses for current user"""
    user = await require_auth(request)
    
    query = {"user_id": user.id}
    if search:
        query["$or"] = [
            {"identificacao.nome_completo": {"$regex": search, "$options": "i"}},
            {"queixa_principal.texto_entre_aspas": {"$regex": search, "$options": "i"}}
        ]
    
    anamneses = await db.anamneses.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for a in anamneses:
        for field in ["created_at", "updated_at"]:
            if isinstance(a.get(field), str):
                a[field] = datetime.fromisoformat(a[field])
        if isinstance(a.get("meta", {}).get("timestamp_iso"), str):
            a["meta"]["timestamp_iso"] = datetime.fromisoformat(a["meta"]["timestamp_iso"])
        if isinstance(a.get("auditoria", {}).get("data_hora_anamnese"), str):
            a["auditoria"]["data_hora_anamnese"] = datetime.fromisoformat(a["auditoria"]["data_hora_anamnese"])
    
    return anamneses

@api_router.get("/anamneses/{anamnese_id}", response_model=Anamnese)
async def get_anamnese(anamnese_id: str, request: Request):
    """Get specific anamnese"""
    user = await require_auth(request)
    
    anamnese = await db.anamneses.find_one({"id": anamnese_id, "user_id": user.id}, {"_id": 0})
    if not anamnese:
        raise HTTPException(status_code=404, detail="Anamnese not found")
    
    for field in ["created_at", "updated_at"]:
        if isinstance(anamnese.get(field), str):
            anamnese[field] = datetime.fromisoformat(anamnese[field])
    if isinstance(anamnese.get("meta", {}).get("timestamp_iso"), str):
        anamnese["meta"]["timestamp_iso"] = datetime.fromisoformat(anamnese["meta"]["timestamp_iso"])
    if isinstance(anamnese.get("auditoria", {}).get("data_hora_anamnese"), str):
        anamnese["auditoria"]["data_hora_anamnese"] = datetime.fromisoformat(anamnese["auditoria"]["data_hora_anamnese"])
    
    return anamnese

@api_router.put("/anamneses/{anamnese_id}", response_model=Anamnese)
async def update_anamnese(anamnese_id: str, input: AnamneseUpdate, request: Request):
    """Update anamnese"""
    user = await require_auth(request)
    
    existing = await db.anamneses.find_one({"id": anamnese_id, "user_id": user.id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Anamnese not found")
    
    update_data = input.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.anamneses.update_one(
        {"id": anamnese_id, "user_id": user.id},
        {"$set": update_data}
    )
    
    updated = await db.anamneses.find_one({"id": anamnese_id}, {"_id": 0})
    
    for field in ["created_at", "updated_at"]:
        if isinstance(updated.get(field), str):
            updated[field] = datetime.fromisoformat(updated[field])
    if isinstance(updated.get("meta", {}).get("timestamp_iso"), str):
        updated["meta"]["timestamp_iso"] = datetime.fromisoformat(updated["meta"]["timestamp_iso"])
    if isinstance(updated.get("auditoria", {}).get("data_hora_anamnese"), str):
        updated["auditoria"]["data_hora_anamnese"] = datetime.fromisoformat(updated["auditoria"]["data_hora_anamnese"])
    
    return updated

@api_router.delete("/anamneses/{anamnese_id}")
async def delete_anamnese(anamnese_id: str, request: Request):
    """Delete anamnese"""
    user = await require_auth(request)
    
    result = await db.anamneses.delete_one({"id": anamnese_id, "user_id": user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Anamnese not found")
    
    return {"message": "Anamnese deleted"}

# =======================
# AI SUMMARY
# =======================

@api_router.post("/anamneses/{anamnese_id}/generate-summary", response_model=GenerateSummaryResponse)
async def generate_summary(anamnese_id: str, request: Request):
    """Generate AI clinical summary"""
    user = await require_auth(request)
    
    anamnese = await db.anamneses.find_one({"id": anamnese_id, "user_id": user.id}, {"_id": 0})
    if not anamnese:
        raise HTTPException(status_code=404, detail="Anamnese not found")
    
    # Build prompt
    prompt = f"""Você é um médico experiente. Gere um resumo clínico estruturado e profissional em português a partir dos seguintes dados de anamnese:

**IDENTIFICAÇÃO:**
Nome: {anamnese['identificacao']['nome_completo']}
Idade: {anamnese['identificacao']['idade']['valor']} {anamnese['identificacao']['idade']['unidade']}
Sexo: {anamnese['identificacao']['sexo_biologico']}
Ocupação: {anamnese['identificacao']['ocupacao']['atividade']}

**QUEIXA PRINCIPAL:**
{anamnese['queixa_principal']['texto_entre_aspas']}
Início: há {anamnese['queixa_principal']['inicio'].get('há', 0)} {anamnese['queixa_principal']['inicio'].get('unidade', '')}

**HISTÓRIA DA DOENÇA ATUAL:**
{anamnese['hda']['narrativa']}

**ANTECEDENTES PESSOAIS:**
Crônicos: {', '.join(anamnese['antecedentes']['pessoais']['cronicos']) if anamnese['antecedentes']['pessoais']['cronicos'] else 'Nenhum'}
Alergias: {', '.join([f"{a['agente']} ({a['reacao']})" for a in anamnese['antecedentes']['pessoais']['alergias']]) if anamnese['antecedentes']['pessoais']['alergias'] else 'Nenhuma'}
Medicações: {', '.join([f"{m['nome']} {m['dose']} {m['posologia']}" for m in anamnese['antecedentes']['pessoais']['medicacoes_uso']]) if anamnese['antecedentes']['pessoais']['medicacoes_uso'] else 'Nenhuma'}

**HÁBITOS:**
Tabagismo: {anamnese['habitos']['tabagismo']['status']} (carga tabágica: {anamnese['habitos']['tabagismo']['carga_tabagica_packyears']} pack-years)
Etilismo: {anamnese['habitos']['etilismo']['doses_semana']} doses/semana
Atividade física: {anamnese['habitos']['atividade_fisica']['tipo']}

Gere um resumo clínico conciso (máximo 300 palavras) destacando os pontos mais relevantes para o diagnóstico e conduta."""
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"anamnese_{anamnese_id}",
            system_message="Você é um assistente médico especializado em resumos clínicos estruturados."
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=prompt)
        summary = await chat.send_message(user_message)
        
        # Save summary to database
        await db.anamneses.update_one(
            {"id": anamnese_id},
            {"$set": {"resumo_clinico_ia": summary}}
        )
        
        return GenerateSummaryResponse(resumo_clinico=summary)
    
    except Exception as e:
        logging.error(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

# =======================
# PDF EXPORT
# =======================

@api_router.get("/anamneses/{anamnese_id}/pdf")
async def export_pdf(anamnese_id: str, request: Request):
    """Export anamnese as PDF"""
    user = await require_auth(request)
    
    anamnese = await db.anamneses.find_one({"id": anamnese_id, "user_id": user.id}, {"_id": 0})
    if not anamnese:
        raise HTTPException(status_code=404, detail="Anamnese not found")
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor='#2C5F7C',
        spaceAfter=12,
        alignment=TA_CENTER
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor='#2C5F7C',
        spaceAfter=8,
        spaceBefore=12
    )
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        spaceAfter=6
    )
    
    story = []
    
    # Title
    story.append(Paragraph("ANAMNESE CLÍNICA", title_style))
    story.append(Spacer(1, 0.5*cm))
    
    # Identificação
    story.append(Paragraph("IDENTIFICAÇÃO", heading_style))
    ident = anamnese['identificacao']
    story.append(Paragraph(f"<b>Nome:</b> {ident['nome_completo']}", body_style))
    if ident.get('nome_social'):
        story.append(Paragraph(f"<b>Nome Social:</b> {ident['nome_social']}", body_style))
    story.append(Paragraph(f"<b>Idade:</b> {ident['idade']['valor']} {ident['idade']['unidade']}", body_style))
    story.append(Paragraph(f"<b>Sexo Biológico:</b> {ident['sexo_biologico']}", body_style))
    if ident.get('genero'):
        story.append(Paragraph(f"<b>Gênero:</b> {ident['genero']}", body_style))
    story.append(Paragraph(f"<b>Cor/Etnia:</b> {ident['cor_etnia']}", body_style))
    story.append(Paragraph(f"<b>Estado Civil:</b> {ident['estado_civil']}", body_style))
    story.append(Paragraph(f"<b>Ocupação:</b> {ident['ocupacao']['atividade']}", body_style))
    story.append(Paragraph(f"<b>Escolaridade:</b> {ident['escolaridade']}", body_style))
    story.append(Paragraph(f"<b>Naturalidade:</b> {ident['naturalidade']['cidade']}/{ident['naturalidade']['uf']}", body_style))
    story.append(Paragraph(f"<b>Procedência:</b> {ident['procedencia']['cidade']}/{ident['procedencia']['uf']}", body_style))
    story.append(Spacer(1, 0.3*cm))
    
    # Queixa Principal
    story.append(Paragraph("QUEIXA PRINCIPAL", heading_style))
    qp = anamnese['queixa_principal']
    story.append(Paragraph(f"{qp['texto_entre_aspas']}", body_style))
    story.append(Paragraph(f"Início: há {qp['inicio'].get('há', 0)} {qp['inicio'].get('unidade', '')}", body_style))
    story.append(Spacer(1, 0.3*cm))
    
    # HDA
    story.append(Paragraph("HISTÓRIA DA DOENÇA ATUAL", heading_style))
    story.append(Paragraph(anamnese['hda']['narrativa'], body_style))
    if anamnese['hda'].get('impacto_vida'):
        story.append(Paragraph(f"<b>Impacto na vida:</b> {anamnese['hda']['impacto_vida']}", body_style))
    story.append(Spacer(1, 0.3*cm))
    
    # Antecedentes
    story.append(Paragraph("ANTECEDENTES", heading_style))
    ant = anamnese['antecedentes']['pessoais']
    if ant['cronicos']:
        story.append(Paragraph(f"<b>Crônicos:</b> {', '.join(ant['cronicos'])}", body_style))
    if ant['alergias']:
        alergia_text = ', '.join([f"{a['agente']} ({a['reacao']})" for a in ant['alergias']])
        story.append(Paragraph(f"<b>Alergias:</b> {alergia_text}", body_style))
    if ant['medicacoes_uso']:
        med_text = '<br/>'.join([f"• {m['nome']} - {m['dose']} - {m['posologia']}" for m in ant['medicacoes_uso']])
        story.append(Paragraph(f"<b>Medicações em uso:</b><br/>{med_text}", body_style))
    story.append(Spacer(1, 0.3*cm))
    
    # Hábitos
    story.append(Paragraph("HÁBITOS DE VIDA", heading_style))
    hab = anamnese['habitos']
    story.append(Paragraph(f"<b>Tabagismo:</b> {hab['tabagismo']['status']} (Carga tabágica: {hab['tabagismo']['carga_tabagica_packyears']} pack-years)", body_style))
    story.append(Paragraph(f"<b>Etilismo:</b> {hab['etilismo']['doses_semana']} doses/semana", body_style))
    if hab['atividade_fisica']['tipo']:
        story.append(Paragraph(f"<b>Atividade física:</b> {hab['atividade_fisica']['tipo']}", body_style))
    story.append(Spacer(1, 0.3*cm))
    
    # AI Summary if available
    if anamnese.get('resumo_clinico_ia'):
        story.append(Paragraph("RESUMO CLÍNICO (IA)", heading_style))
        story.append(Paragraph(anamnese['resumo_clinico_ia'], body_style))
        story.append(Spacer(1, 0.3*cm))
    
    # Footer info
    story.append(Spacer(1, 1*cm))
    if isinstance(anamnese.get('created_at'), str):
        created = anamnese['created_at']
    else:
        created = anamnese.get('created_at', datetime.now(timezone.utc)).isoformat()
    story.append(Paragraph(f"<i>Documento gerado em: {created[:10]} às {created[11:16]}</i>", body_style))
    story.append(Paragraph(f"<i>Grau de confiabilidade: {ident['grau_confiabilidade']}</i>", body_style))
    
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=anamnese_{anamnese_id}.pdf"}
    )

# =======================
# JSON EXPORT
# =======================

@api_router.get("/anamneses/{anamnese_id}/json")
async def export_json(anamnese_id: str, request: Request):
    """Export anamnese as JSON"""
    user = await require_auth(request)
    
    anamnese = await db.anamneses.find_one({"id": anamnese_id, "user_id": user.id}, {"_id": 0})
    if not anamnese:
        raise HTTPException(status_code=404, detail="Anamnese not found")
    
    # Convert datetime to ISO strings for JSON export
    def serialize_dates(obj):
        if isinstance(obj, dict):
            return {k: serialize_dates(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [serialize_dates(item) for item in obj]
        elif isinstance(obj, datetime):
            return obj.isoformat()
        return obj
    
    anamnese_json = serialize_dates(anamnese)
    
    return JSONResponse(
        content=anamnese_json,
        headers={"Content-Disposition": f"attachment; filename=anamnese_{anamnese_id}.json"}
    )

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
