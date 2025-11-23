🏗️ WorkCity - Plataforma de Conexão para Construção Civil

O WorkCity é uma aplicação Full Stack desenvolvida para conectar empresas de construção civil a profissionais qualificados (pedreiros, eletricistas, encanadores, etc.). O sistema facilita o recrutamento ativo e passivo através de um dashboard intuitivo.

🚀 Funcionalidades Principais

🏢 Para Empresas

Gestão de Vagas: Criar, visualizar e gerenciar vagas de emprego com localização padronizada.

Gestão de Candidatos: Visualizar interessados, aprovar ou rejeitar candidaturas.

Recrutamento Ativo: Buscar profissionais por localização/especialidade e enviar convites diretos.

Dashboard: Estatísticas em tempo real de vagas e candidatos.

👷 Para Profissionais

Feed de Oportunidades: Busca avançada de vagas com filtros inteligentes (IBGE).

Candidatura: Aplicação rápida para vagas de interesse.

Gestão de Propostas: Receber e aceitar/recusar convites de empresas.

Perfil Profissional: Edição completa de dados pessoais, experiência, bio e foto.

Status: Acompanhamento em tempo real do status das candidaturas.

🛠️ Tecnologias Utilizadas

Frontend: HTML5, Tailwind CSS (CDN), JavaScript Vanilla (ES6+).

Backend: Node.js, Express.js.

Banco de Dados: PostgreSQL.

ORM: Prisma (Gestão de Schema, Migrations e Queries).

Autenticação: JWT (JSON Web Token) e Bcrypt.js.

Integrações: API de Localidades do IBGE (Estados e Municípios).

📋 Pré-requisitos

Para rodar este projeto localmente, você precisará de:

Node.js (v18 ou superior recomendado)

PostgreSQL (instalado e rodando)

Git

VS Code (recomendado)

Extensão "Prisma" no VS Code (opcional, mas ajuda na leitura do schema)

⚙️ Instalação e Configuração

Siga os passos abaixo para configurar o ambiente de desenvolvimento.

1. Clonar o Repositório

git clone [https://github.com/Gabrieldevisnot/Workcity-project.git](https://github.com/Gabrieldevisnot/Workcity-project.git)
cd workcity-app


2. Configurar o Backend e Banco de Dados

A configuração do banco agora é feita automaticamente pelo Prisma.

Acesse a pasta do backend:

cd backend


Instale as dependências:

npm install


Configurar Variáveis de Ambiente:

Crie um arquivo chamado .env dentro da pasta backend (se não existir).

Adicione a seguinte linha, substituindo SUA_SENHA pela senha do seu PostgreSQL local:

DATABASE_URL="postgres://postgres:SUA_SENHA@localhost:5432/workcity_db?schema=public"


(Nota: Se seu usuário do Postgres não for 'postgres', altere também).

Criar o Banco de Dados (Migrations):
Não é necessário criar tabelas manualmente no pgAdmin. O Prisma fará isso por você com base no código. Rode:

npx prisma migrate dev


Isso criará o banco workcity_db, todas as tabelas e relacionamentos automaticamente.

Iniciar o Servidor:

node server.js


(Deve aparecer: Servidor rodando na porta 3000)

3. Rodar o Frontend

O Frontend deve ser servido através de um servidor local para evitar erros de CORS e permitir o funcionamento correto dos módulos.

Opção A (VS Code - Recomendada):

Instale a extensão "Live Server" no VS Code.

Abra a pasta frontend no VS Code.

Abra o arquivo index.html (ou login).

Clique em "Go Live" no canto inferior direito do VS Code.

Opção B (Via Terminal com Python):
Se tiver Python instalado:

cd frontend
python -m http.server 5500


Acesse no navegador: http://127.0.0.1:5500

🧪 Como Testar o Fluxo Completo

Cadastro Empresa: Crie uma conta de empresa e publique uma vaga (teste o seletor de cidades do IBGE).

Cadastro Profissional: Em aba anônima, cadastre um profissional e edite seu perfil na aba "Meu Perfil".

Candidatura: No dashboard do profissional, busque a vaga e candidate-se.

Gestão: Volte ao dashboard da empresa, clique na vaga e aprove o candidato.

Recrutamento: Como empresa, vá em "Buscar Talentos", encontre o profissional e envie um convite.

Aceite: Como profissional, vá na aba "Propostas", veja o convite e clique em aceitar.

📁 Estrutura do Projeto

workcity-app/
├── backend/            # API Node.js
│   ├── prisma/         # Configuração do Prisma (Schema e Migrations)
│   ├── node_modules/   # Dependências instaladas
│   ├── server.js       # Lógica do servidor e todas as rotas
│   └── package.json    # Lista de pacotes
│
├── frontend/           # Interface do Usuário
│   ├── scripts/        # Lógica JS (auth.js, main.js, ibge.js, etc.)
│   ├── *.html          # Páginas (dashboards, login, cadastro, busca)
│   └── ...
└── README.md           # Documentação do projeto


Desenvolvido com 🧡 por [Seu Nome]