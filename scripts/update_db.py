import os
import json
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCTS_FILE = os.path.join(BASE_DIR, 'assets', 'js', 'produtos-data.js')
VARIANTS_DIR = os.path.join(BASE_DIR, 'assets', 'images', 'products', 'variants')

FOLDER_MAP = {
    'cabo-subterraneo': 'cabo-subterr-aneo',
    'fio-eletroplastico': 'fio-eletropl-astico',
    'gancho-19cm': 'gancho-19-cm',
    'gancho-9cm': 'gancho-9-cm',
    'tubo-isolador': 'tubo-isolador-final'
}

# The raw data without colors
PRODUCTS = [
  { "id":'w-tradicional', "cat":'Isoladores Tipo W', "name":'Isolador W Tradicional',
    "desc":'O clássico isolador em formato W para cercas elétricas rurais. Fabricado em polietileno de alta densidade, oferece excelente isolamento elétrico e alta resistência às intempéries. Seu design em W garante encaixe firme no arame, evitando deslocamentos. Ideal para propriedades rurais de todos os portes.',
    "specs":{"categoria":'Isolador',"material":'Polietileno HD',"dimensao":'45mm',"peso":'14g'},
    "img":'assets/images/products/w-tradicional.png',
    "has3d":True, "model":'assets/models/10.glb' },
  { "id":'w-reforcado', "cat":'Isoladores Tipo W', "name":'Isolador W Reforçado',
    "desc":'Versão reforçada do isolador W com maior espessura e resistência mecânica. Projetado para cercas com maior tensão e áreas com animais de grande porte. Suporta maior pressão nos fios sem deformar, garantindo durabilidade superior em condições adversas.',
    "specs":{"categoria":'Isolador',"material":'Polietileno HD',"dimensao":'48mm',"peso":'18g'},
    "img":'assets/images/products/w-reforcado.png',
    "has3d":True, "model":'assets/models/07.glb' },
  { "id":'w-economico', "cat":'Isoladores Tipo W', "name":'Isolador W Econômico',
    "desc":'Opção econômica do isolador W, mantendo a funcionalidade essencial para cercas de menor porte. Ideal para propriedades menores que buscam proteção eficiente com excelente custo-benefício. Fabricação em polietileno resistente às intempéries.',
    "specs":{"categoria":'Isolador',"material":'Polietileno',"dimensao":'42mm',"peso":'10g'},
    "img":'assets/images/products/w-economico.png' },
  { "id":'roldana-36', "cat":'Roldanas Isoladoras', "name":'Roldana Isoladora 36mm',
    "desc":'Roldana isoladora de 36mm para passagem de fios em cantos e mudanças de direção da cerca elétrica. Seu design reduz o atrito e protege o fio contra desgaste, prolongando a vida útil da instalação. Parafuso incluso.',
    "specs":{"categoria":'Roldana',"material":'Polietileno HD',"dimensao":'36mm',"peso":'20g'},
    "img":'assets/images/products/roldana-36.png',
    "has3d":True, "model":'assets/models/09.glb' },
  { "id":'roldana-24', "cat":'Roldanas Isoladoras', "name":'Roldana Isoladora 24mm',
    "desc":'Roldana compacta de 24mm para instalações com espaço reduzido. Perfeita para passagem de fios em mourões e postes menores. Fabricada em polietileno de alta densidade para máxima durabilidade.',
    "specs":{"categoria":'Roldana',"material":'Polietileno HD',"dimensao":'24mm',"peso":'12g'},
    "img":'assets/images/products/roldana-24.png' },
  { "id":'roldana-30', "cat":'Roldanas Isoladoras', "name":'Roldana Isoladora 30mm',
    "desc":'Roldana de tamanho intermediário, versátil para a maioria das instalações de cerca elétrica. Excelente relação entre tamanho e capacidade de isolamento. Disponível em múltiplas cores.',
    "specs":{"categoria":'Roldana',"material":'Polietileno HD',"dimensao":'30mm',"peso":'16g'},
    "img":'assets/images/products/roldana-30.png' },
  { "id":'roldana-30-laranja', "cat":'Roldanas Isoladoras', "name":'Roldana 30mm Laranja',
    "desc":'Versão laranja da roldana de 30mm para maior visibilidade no campo. Facilita a identificação da linha da cerca e inspeções visuais. Mesma qualidade e resistência da versão tradicional.',
    "specs":{"categoria":'Roldana',"material":'Polietileno HD',"dimensao":'30mm',"peso":'16g'},
    "img":'assets/images/products/roldana-30-laranja.png' },
  { "id":'roldana-40-garra', "cat":'Roldanas Isoladoras', "name":'Roldana 40mm com Garra',
    "desc":'Roldana de 40mm com sistema de garra para fixação direta em arames lisos ou farpados. Instalação rápida sem necessidade de ferramentas adicionais. Design robusto para uso intensivo.',
    "specs":{"categoria":'Roldana',"material":'Polietileno HD',"dimensao":'40mm',"peso":'22g'},
    "img":'assets/images/products/roldana-40-garra.png' },
  { "id":'roldana-48', "cat":'Roldanas Isoladoras', "name":'Roldana Isoladora 48mm',
    "desc":'A maior roldana da linha CNI, ideal para instalações industriais e cercas de grande porte que exigem isolamento reforçado. Suporta maior carga e garante proteção superior.',
    "specs":{"categoria":'Roldana',"material":'Polietileno HD',"dimensao":'48mm',"peso":'28g'},
    "img":'assets/images/products/roldana-48.png' },
  { "id":'castanha', "cat":'Castanhas e Catracas', "name":'Castanha para Esticador',
    "desc":'Castanha plástica para esticador de cerca elétrica. Encaixa perfeitamente nos esticadores padrão do mercado, garantindo isolamento elétrico completo e resistência à tração. Fabricada em polietileno de alta densidade.',
    "specs":{"categoria":'Castanha',"material":'Polietileno HD',"dimensao":'35mm',"peso":'10g'},
    "img":'assets/images/products/castanha.png',
    "has3d":True, "model":'assets/models/02.glb' },
  { "id":'castanha-catraca', "cat":'Castanhas e Catracas', "name":'Castanha para Catraca',
    "desc":'Castanha quadrada reforçada projetada especificamente para o mecanismo de catraca. Design exclusivo para encaixe perfeito no sistema de tensionamento. Alta resistência mecânica para uso contínuo.',
    "specs":{"categoria":'Castanha',"material":'Polietileno HD',"dimensao":'40mm',"peso":'12g'},
    "img":'assets/images/products/castanha-catraca.png',
    "has3d":True, "model":'assets/models/03.glb' },
  { "id":'catraca-isolada', "cat":'Castanhas e Catracas', "name":'Catraca Isolada',
    "desc":'Catraca com isolamento integrado para tensionamento de cerca elétrica. Permite ajustar a tensão do fio sem perder o isolamento, aumentando a segurança na instalação e manutenção da cerca.',
    "specs":{"categoria":'Catraca',"material":'Aço + Polietileno',"dimensao":'120mm',"peso":'85g'},
    "img":'assets/images/products/catraca-isolada.png' },
  { "id":'catraca-lisa', "cat":'Castanhas e Catracas', "name":'Catraca Esticadora Lisa',
    "desc":'Catraca esticadora reforçada para tensionamento de arames e fios de cerca. Construção robusta em aço galvanizado com acabamento liso para maior durabilidade e resistência à corrosão.',
    "specs":{"categoria":'Catraca',"material":'Aço Galvanizado',"dimensao":'130mm',"peso":'95g'},
    "img":'assets/images/products/catraca-lisa.png' },
  { "id":'gancho-7cm', "cat":'Ganchos Isoladores', "name":'Gancho Isolador 7cm',
    "desc":'Gancho isolador curto de 7cm com anel. Ideal para fixação em mourões de madeira com pouco espaçamento. Modelo compacto e resistente, perfeito para cercas com múltiplos fios próximos.',
    "specs":{"categoria":'Gancho',"material":'Aço + Polietileno',"dimensao":'7cm',"peso":'18g'},
    "img":'assets/images/products/gancho-7cm.png'},
  { "id":'gancho-9cm', "cat":'Ganchos Isoladores', "name":'Gancho Afastador 9cm',
    "desc":'Gancho afastador de 9cm que mantém o fio a uma distância segura do mourão. Evita fugas de corrente por contato com a madeira, aumentando a eficiência da cerca elétrica.',
    "specs":{"categoria":'Gancho',"material":'Aço + Polietileno',"dimensao":'9cm',"peso":'22g'},
    "img":'assets/images/products/gancho-9cm.png' },
  { "id":'gancho-19cm', "cat":'Ganchos Isoladores', "name":'Gancho Longo 19cm',
    "desc":'Gancho isolador longo de 19cm para máximo afastamento do fio em relação ao mourão. Indicado para áreas com vegetação densa ou animais de grande porte que exigem maior distância de segurança.',
    "specs":{"categoria":'Gancho',"material":'Aço + Polietileno',"dimensao":'19cm',"peso":'32g'},
    "img":'assets/images/products/gancho-19cm.png' },
  { "id":'gancho-cni', "cat":'Ganchos Isoladores', "name":'Gancho CNI',
    "desc":'Gancho isolador exclusivo CNI com design diferenciado para máxima fixação e isolamento. Fabricado com materiais de alta qualidade para garantir durabilidade em condições extremas.',
    "specs":{"categoria":'Gancho',"material":'Aço + Polietileno',"dimensao":'Variável',"peso":'25g'},
    "img":'assets/images/products/gancho-cni.png'},
  { "id":'chave-interruptora', "cat":'Acessórios para Cerca Elétrica', "name":'Chave Interruptora CNI',
    "desc":'Chave interruptora reforçada para cerca elétrica. Permite desligar trechos da cerca de forma segura para manutenção. Fabricada em ABS resistente a UV com design ergonômico para fácil manuseio.',
    "specs":{"categoria":'Chave',"material":'ABS Reforçado',"dimensao":'80mm',"peso":'25g'},
    "img":'assets/images/products/chave-interruptora.png',
    "has3d":True, "model":'assets/models/Peça_com cor.glb' },
  { "id":'isolador-prego', "cat":'Acessórios para Cerca Elétrica', "name":'Isolador com Prego',
    "desc":'Isolador com prego integrado para fixação direta em mourões de madeira. Instalação rápida e prática, sem necessidade de furação prévia. Excelente isolamento elétrico e resistência à tração.',
    "specs":{"categoria":'Isolador',"material":'Polietileno / Aço',"dimensao":'28mm',"peso":'15g'},
    "img":'assets/images/products/isolador-prego.png',
    "has3d":True, "model":'assets/models/06.glb'},
  { "id":'engate', "cat":'Acessórios para Cerca Elétrica', "name":'Engate Batente para Porteira',
    "desc":'Engate batente plástico para porteiras de cerca elétrica. Permite abrir e fechar trechos da cerca com facilidade e segurança. Design robusto para uso diário intensivo.',
    "specs":{"categoria":'Engate',"material":'Polietileno HD',"dimensao":'60mm',"peso":'20g'},
    "img":'assets/images/products/engate.png' },
  { "id":'tubo-isolador', "cat":'Acessórios para Cerca Elétrica', "name":'Tubo Isolador Reforçado',
    "desc":'Tubo isolador reforçado para passagem do fio em porteiras e pontos de tensão. Protege o fio contra abrasão e garante isolamento em pontos críticos da instalação. Alta resistência mecânica.',
    "specs":{"categoria":'Tubo',"material":'Polietileno HD',"dimensao":'200mm',"peso":'30g'},
    "img":'assets/images/products/tubo-isolador.png' },
  { "id":'vergalhao', "cat":'Acessórios para Cerca Elétrica', "name":'Isolador Guia Vergalhão',
    "desc":'Isolador guia para vergalhão ou piquete de cerca elétrica. Fixação segura em hastes metálicas, mantendo o fio na posição correta. Ideal para cercas com vergalhões de aço.',
    "specs":{"categoria":'Isolador',"material":'Polietileno HD',"dimensao":'40mm',"peso":'12g'},
    "img":'assets/images/products/vergalhao.png' },
  { "id":'haste', "cat":'Acessórios para Cerca Elétrica', "name":'Haste Isoladora',
    "desc":'Haste isoladora para sustentação de fios de cerca elétrica. Permite elevar e direcionar os fios em pontos estratégicos da instalação. Fabricada em aço revestido com polietileno isolante.',
    "specs":{"categoria":'Haste',"material":'Aço + Polietileno',"dimensao":'50cm',"peso":'120g'},
    "img":'assets/images/products/haste.png' },
  { "id":'porteira', "cat":'Acessórios para Cerca Elétrica', "name":'Porteira para Cerca Elétrica',
    "desc":'Sistema completo de porteira para cerca elétrica. Facilita a passagem de veículos e animais com abertura e fechamento rápido. Disponível nos modelos curta e longa para diferentes larguras.',
    "specs":{"categoria":'Porteira',"material":'Polietileno HD',"dimensao":'Variável',"peso":'Variável'},
    "img":'assets/images/products/porteira.png'},
  { "id":'cabo-subterraneo', "cat":'Acessórios para Cerca Elétrica', "name":'Cabo Subterrâneo Reforçado',
    "desc":'Cabo subterrâneo reforçado para passagem de corrente elétrica por baixo de porteiras e estradas. Isolamento duplo para máxima segurança. Fácil instalação e alta durabilidade.',
    "specs":{"categoria":'Cabo',"material":'Cobre + PVC',"dimensao":'1.6mm',"peso":'Variável'},
    "img":'assets/images/products/cabo-subterraneo.png'},
  { "id":'fio-eletroplastico', "cat":'Acessórios para Cerca Elétrica', "name":'Fio Eletroplástico',
    "desc":'Fio eletroplástico condutor para cerca elétrica. Combina resistência mecânica com boa condutividade elétrica. Visível e durável, ideal para cercas de contenção animal em propriedades rurais.',
    "specs":{"categoria":'Fio',"material":'Aço + Polietileno',"dimensao":'--',"peso":'Variável'},
    "img":'assets/images/products/fio-eletroplastico.jpg'},
  { "id":'batoque', "cat":'Acessórios para Cerca Elétrica', "name":'Batoque Isolador',
    "desc":'Batoque isolador para vedação e isolamento de pontos de conexão da cerca elétrica. Protege contra umidade e contato acidental, garantindo a integridade do sistema elétrico.',
    "specs":{"categoria":'Batoque',"material":'Polietileno',"dimensao":'Variável',"peso":'5g'},
    "img":'assets/images/products/batoque.jpg'},
  { "id":'clip', "cat":'Niveladores para Pisos', "name":'Nivelador Clip para Porcelanato',
    "desc":'Clip nivelador profissional para assentamento de porcelanato e pisos cerâmicos. Garante um acabamento perfeito e nivelado. Sistema de encaixe fácil e uso profissional com resultados superiores.',
    "specs":{"categoria":'Nivelador',"material":'Polipropileno',"dimensao":'Variável',"peso":'3g'},
    "img":'assets/images/products/clip.png' },
  { "id":'cunha', "cat":'Niveladores para Pisos', "name":'Cunha para Nivelador',
    "desc":'Cunha reutilizável para sistema nivelador de pisos. Aplica pressão uniforme no clip, garantindo nivelamento perfeito entre peças de porcelanato e cerâmica. Economia pela reutilização.',
    "specs":{"categoria":'Nivelador',"material":'Polipropileno',"dimensao":'Variável',"peso":'4g'},
    "img":'assets/images/products/cunha.png' }
]

def capitalize_words(s):
    return ' '.join(word.capitalize() for word in s.replace('-', ' ').split())

def generate_db():
    for prod in PRODUCTS:
        folder_name = FOLDER_MAP.get(prod['id'], prod['id'])
        dir_path = os.path.join(VARIANTS_DIR, folder_name)
        
        if os.path.exists(dir_path):
            files = [f for f in os.listdir(dir_path) if f.endswith('.jpg')]
            variants_map = {}
            non_variant_files = []
            
            for file in files:
                match = re.match(r'^(.*)-(\d+)\.jpg$', file)
                if match:
                    slug = match.group(1)
                    if slug not in variants_map:
                        variants_map[slug] = []
                    variants_map[slug].append(f"assets/images/products/variants/{folder_name}/{file}")
                else:
                    non_variant_files.append(f"assets/images/products/variants/{folder_name}/{file}")
                    
            colors = []
            for slug, imgs in variants_map.items():
                imgs.sort()
                colors.append({
                    "name": capitalize_words(slug),
                    "class": slug,
                    "imgs": imgs
                })
                
            if colors:
                prod['colors'] = colors
                prod['img'] = colors[0]['imgs'][0]
            elif non_variant_files:
                non_variant_files.sort()
                prod['img'] = non_variant_files[0]
                
    # Write back to file
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        f.write("// CNI Plásticos — Product Data\n")
        f.write("const PRODUCTS = ")
        f.write(json.dumps(PRODUCTS, ensure_ascii=False, indent=2))
        f.write(";\n")
        
if __name__ == '__main__':
    generate_db()
    print("Database updated successfully!")
