#!/usr/bin/env python3
"""
Clinical Anamnesis Backend API Testing
Tests all endpoints with authentication
"""

import requests
import json
import sys
from datetime import datetime
import time

class ClinicalAnamnesisAPITester:
    def __init__(self, base_url="https://clinical-flow-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session_token = "test_session_1762260730653"  # From MongoDB setup
        self.tests_run = 0
        self.tests_passed = 0
        self.anamnese_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        # Add auth header
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION ENDPOINTS")
        print("="*50)
        
        # Test /auth/me
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            print(f"   User: {response.get('name', 'Unknown')}")
            print(f"   Email: {response.get('email', 'Unknown')}")
        
        return success

    def test_anamnese_crud(self):
        """Test anamnese CRUD operations"""
        print("\n" + "="*50)
        print("TESTING ANAMNESE CRUD OPERATIONS")
        print("="*50)
        
        # Test list anamneses (empty initially)
        success, response = self.run_test(
            "List Anamneses (Empty)",
            "GET",
            "anamneses",
            200
        )
        
        if not success:
            return False
        
        # Create test anamnese
        test_anamnese = {
            "meta": {
                "consentimento": True,
                "profissional": {
                    "nome": "Dr. Teste",
                    "registro": "CRM123456",
                    "unidade": "Hospital Teste"
                },
                "timestamp_iso": datetime.now().isoformat()
            },
            "identificacao": {
                "nome_completo": "João da Silva Teste",
                "nome_social": "",
                "genero": "masculino",
                "sexo_biologico": "masculino",
                "idade": {"valor": 45, "unidade": "anos"},
                "cor_etnia": "branca",
                "estado_civil": "casado",
                "ocupacao": {
                    "atividade": "Engenheiro",
                    "local": "Empresa XYZ",
                    "condicoes": "Escritório"
                },
                "escolaridade": "Superior completo",
                "religiao": "Católica",
                "naturalidade": {"cidade": "São Paulo", "uf": "SP"},
                "procedencia": {"cidade": "São Paulo", "uf": "SP"},
                "mae": "Maria da Silva",
                "responsavel_ou_cuidador": "",
                "plano_ou_previdencia": "Unimed",
                "grau_confiabilidade": "bom"
            },
            "queixa_principal": {
                "texto_entre_aspas": "Dor no peito há 3 dias",
                "inicio": {"há": 3, "unidade": "dias"}
            },
            "hda": {
                "narrativa": "Paciente refere dor torácica de início há 3 dias, de caráter opressivo, localizada em região precordial, com irradiação para braço esquerdo. Dor piora com esforços e melhora com repouso. Nega dispneia, palpitações ou sudorese.",
                "sintomas_principais": [],
                "impacto_vida": "Limitação para atividades físicas"
            },
            "interrogatorio_sistematico": {
                "geral": {"pergunta_guarda_chuva": "", "itens": []},
                "respiratorio": {"pergunta_guarda_chuva": "", "itens": []},
                "cardiovascular": {"pergunta_guarda_chuva": "", "itens": []},
                "gastrointestinal": {"pergunta_guarda_chuva": "", "itens": []},
                "geniturinario": {"pergunta_guarda_chuva": "", "itens": []},
                "musculoesqueletico": {"pergunta_guarda_chuva": "", "itens": []},
                "neurologico": {"pergunta_guarda_chuva": "", "itens": []},
                "psiquiatrico": {"pergunta_guarda_chuva": "", "itens": []},
                "endocrino": {"pergunta_guarda_chuva": "", "itens": []},
                "hemato": {"pergunta_guarda_chuva": "", "itens": []},
                "pele": {"pergunta_guarda_chuva": "", "itens": []},
                "reprodutivo": {"pergunta_guarda_chuva": "", "itens": []}
            },
            "antecedentes": {
                "pessoais": {
                    "cronicos": ["Hipertensão arterial"],
                    "alergias": [{"agente": "Penicilina", "reacao": "Rash cutâneo"}],
                    "medicacoes_uso": [
                        {"nome": "Losartana", "dose": "50mg", "posologia": "1x/dia"}
                    ],
                    "cirurgias_hospitalizacoes": [],
                    "imunizacoes_relevantes": ["COVID-19", "Influenza"]
                },
                "familiares": [
                    {"parentesco": "Pai", "condicao": "Infarto do miocárdio aos 60 anos"}
                ],
                "estado_atual": {
                    "fisico": "Bom estado geral",
                    "mental": "Ansioso devido aos sintomas"
                },
                "linha_do_tempo": []
            },
            "habitos": {
                "atividade_fisica": {
                    "tipo": "Caminhada",
                    "frequencia_semana": 3,
                    "duracao_min": 30
                },
                "sono": {"horas": 7, "qualidade": "boa"},
                "alimentacao": {
                    "padrao": "Balanceada",
                    "restricoes": "Evita frituras"
                },
                "tabagismo": {
                    "status": "ex",
                    "macos_dia": 1,
                    "anos": 10,
                    "carga_tabagica_packyears": 10
                },
                "etilismo": {
                    "tipos": ["Vinho"],
                    "doses_semana": 2,
                    "uso_pesado_ep": False
                },
                "outras_substancias": ""
            },
            "psicossocial": {
                "composicao_familiar": "Casado, 2 filhos",
                "dependentes": 2,
                "renda_familiar_faixa": "5-10 salários mínimos",
                "saneamento": "Adequado",
                "agua_segura": "Sim",
                "riscos_ocupacionais": "Sedentarismo",
                "suporte_social": "Bom",
                "crencas_praticas_culturais": "Católico praticante",
                "barreiras_acesso": "Nenhuma"
            }
        }
        
        # Create anamnese
        success, response = self.run_test(
            "Create Anamnese",
            "POST",
            "anamneses",
            200,
            data=test_anamnese
        )
        
        if success and 'id' in response:
            self.anamnese_id = response['id']
            print(f"   Created anamnese ID: {self.anamnese_id}")
        else:
            print("❌ Failed to create anamnese - stopping CRUD tests")
            return False
        
        # Get specific anamnese
        success, response = self.run_test(
            "Get Anamnese by ID",
            "GET",
            f"anamneses/{self.anamnese_id}",
            200
        )
        
        if not success:
            return False
        
        # List anamneses (should have 1 now)
        success, response = self.run_test(
            "List Anamneses (With Data)",
            "GET",
            "anamneses",
            200
        )
        
        if success:
            print(f"   Found {len(response)} anamneses")
        
        # Test search
        success, response = self.run_test(
            "Search Anamneses",
            "GET",
            "anamneses?search=João",
            200
        )
        
        if success:
            print(f"   Search results: {len(response)} anamneses")
        
        return success

    def test_ai_summary(self):
        """Test AI summary generation"""
        print("\n" + "="*50)
        print("TESTING AI SUMMARY GENERATION")
        print("="*50)
        
        if not self.anamnese_id:
            print("❌ No anamnese ID available for AI summary test")
            return False
        
        print("⏳ Generating AI summary (this may take a few seconds)...")
        success, response = self.run_test(
            "Generate AI Summary",
            "POST",
            f"anamneses/{self.anamnese_id}/generate-summary",
            200
        )
        
        if success and 'resumo_clinico' in response:
            print(f"   Summary generated: {len(response['resumo_clinico'])} characters")
            print(f"   Preview: {response['resumo_clinico'][:100]}...")
        
        return success

    def test_exports(self):
        """Test PDF and JSON exports"""
        print("\n" + "="*50)
        print("TESTING EXPORT FUNCTIONALITY")
        print("="*50)
        
        if not self.anamnese_id:
            print("❌ No anamnese ID available for export tests")
            return False
        
        # Test PDF export
        success_pdf = self.test_pdf_export()
        
        # Test JSON export
        success_json = self.test_json_export()
        
        return success_pdf and success_json

    def test_pdf_export(self):
        """Test PDF export"""
        url = f"{self.base_url}/anamneses/{self.anamnese_id}/pdf"
        headers = {'Authorization': f'Bearer {self.session_token}'}
        
        print(f"\n🔍 Testing PDF Export...")
        print(f"   URL: {url}")
        
        try:
            response = requests.get(url, headers=headers)
            success = response.status_code == 200 and response.headers.get('content-type') == 'application/pdf'
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - PDF generated ({len(response.content)} bytes)")
            else:
                print(f"❌ Failed - Status: {response.status_code}, Content-Type: {response.headers.get('content-type')}")
            
            self.tests_run += 1
            return success
            
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.tests_run += 1
            return False

    def test_json_export(self):
        """Test JSON export"""
        url = f"{self.base_url}/anamneses/{self.anamnese_id}/json"
        headers = {'Authorization': f'Bearer {self.session_token}'}
        
        print(f"\n🔍 Testing JSON Export...")
        print(f"   URL: {url}")
        
        try:
            response = requests.get(url, headers=headers)
            success = response.status_code == 200
            
            if success:
                try:
                    json_data = response.json()
                    print(f"✅ Passed - JSON exported with {len(json_data)} fields")
                    self.tests_passed += 1
                except:
                    print(f"❌ Failed - Invalid JSON response")
                    success = False
            else:
                print(f"❌ Failed - Status: {response.status_code}")
            
            self.tests_run += 1
            return success
            
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.tests_run += 1
            return False

    def test_logout(self):
        """Test logout functionality"""
        print("\n" + "="*50)
        print("TESTING LOGOUT FUNCTIONALITY")
        print("="*50)
        
        success, response = self.run_test(
            "Logout",
            "POST",
            "auth/logout",
            200
        )
        
        return success

    def cleanup(self):
        """Clean up test data"""
        if self.anamnese_id:
            print(f"\n🧹 Cleaning up test anamnese: {self.anamnese_id}")
            success, _ = self.run_test(
                "Delete Test Anamnese",
                "DELETE",
                f"anamneses/{self.anamnese_id}",
                200
            )
            if success:
                print("✅ Test data cleaned up")

def main():
    print("🏥 CLINICAL ANAMNESIS API TESTING")
    print("=" * 60)
    
    tester = ClinicalAnamnesisAPITester()
    
    try:
        # Test authentication
        if not tester.test_auth_endpoints():
            print("\n❌ Authentication tests failed - stopping")
            return 1
        
        # Test CRUD operations
        if not tester.test_anamnese_crud():
            print("\n❌ CRUD tests failed - stopping")
            return 1
        
        # Test AI summary (may take time)
        tester.test_ai_summary()
        
        # Test exports
        tester.test_exports()
        
        # Test logout
        tester.test_logout()
        
    finally:
        # Cleanup
        tester.cleanup()
    
    # Print results
    print(f"\n📊 FINAL RESULTS")
    print("=" * 30)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())