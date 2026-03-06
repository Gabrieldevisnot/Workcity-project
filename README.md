🏗️ WorkCity - Plataforma de Conexão Profissional

O WorkCity é um marketplace de empregos focado em conectar Empresas e Profissionais (especialmente do setor de serviços e construção civil, como pedreiros, eletricistas, encanadores, etc.). A plataforma permite o recrutamento passivo (candidaturas a vagas) e ativo (empresas convidando profissionais), além de oferecer um chat em tempo real para negociações.

🚀 Status do Projeto

Fase Atual: MVP (Produto Mínimo Viável) Funcional.

✨ Funcionalidades Implementadas até o momento:

Autenticação Segura: Cadastro e Login separados para Empresas e Profissionais, com senhas criptografadas (Bcrypt) e autenticação via JWT.

Dashboards Personalizados:

Empresa: Criação de vagas, gestão de candidaturas, busca de talentos (com filtros) e envio de propostas.

Profissional: Feed de vagas inteligentes (não mostra vagas já aplicadas), gestão de convites recebidos e candidaturas.

Sistema de Match (Conexão Real): O chat entre Empresa e Profissional só é liberado caso haja uma candidatura a uma vaga ou uma proposta aceita.

Chat em Tempo Real: Comunicação instantânea implementada com WebSockets (Socket.io). Histórico de mensagens salvo no banco de dados.

Gestão de Perfil: Atualização de dados cadastrais, especialidades, bio e foto de perfil (via URL).

Integração IBGE: Seleção dinâmica de Estados e Cidades consumindo a API pública do IBGE.

UI/UX Moderna: - Interface responsiva utilizando Tailwind CSS.

Suporte completo a Dark Mode (Tema Escuro/Claro).

Menu Dropdown no cabeçalho e notificações interativas (Toasts).

🛠️ Tecnologias Utilizadas

Frontend (Interface)

HTML5 & CSS3

JavaScript (Vanilla)

Tailwind CSS (Estilização utilitária via CDN)

Socket.io-client (Comunicação em tempo real)

Hospedagem: Vercel

Backend (Servidor & API)

Node.js com Express.js (API RESTful)

Prisma ORM (Modelagem e manipulação do banco de dados)

Socket.io (Servidor de WebSockets)

JWT & Bcrypt (Segurança e Autenticação)

Multer (Preparado para upload de arquivos)

Banco de Dados & Infraestrutura

PostgreSQL (Banco de dados relacional)

Docker & Docker Compose (Containerização do ambiente de desenvolvimento/backend)

Ngrok (Tunelamento para expor o backend local para o frontend na nuvem)

🗄️ Modelagem do Banco de Dados (DER)

O sistema possui 5 entidades principais:

Users (Centraliza Empresas e Profissionais, diferenciados por user_type).

Vagas (Oportunidades criadas pelas empresas).

Candidaturas (Tabela pivô: Profissional aplica para Vaga).

Convites (Tabela pivô: Empresa convida Profissional para Vaga).

Messages (Histórico do chat entre usuários).

⚙️ Como Rodar o Projeto (Ambiente de Desenvolvimento)

Devido à arquitetura híbrida adotada para desenvolvimento (Frontend na Vercel e Backend Local), siga os passos abaixo para iniciar a aplicação:

Pré-requisitos

Docker Desktop rodando.

Node.js instalado.

Ngrok instalado globalmente (npm install -g ngrok).

Passo 1: Iniciar o Backend e Banco de Dados

Abra o terminal e navegue até a pasta backend.

Suba os containers do Docker:

docker-compose up -d --build


Execute as migrações do Prisma para sincronizar as tabelas:

npx prisma migrate dev


Passo 2: Expor o Backend (Túnel Ngrok)

Como o Frontend está na web, ele precisa acessar seu backend local.

Abra um novo terminal e inicie o Ngrok na porta do servidor (3000):

ngrok http 3000


Copie o link HTTPS gerado pelo Ngrok (ex: https://abcd-1234.ngrok-free.app).

Passo 3: Configurar o Frontend

Vá até o arquivo frontend/scripts/auth.js.

Substitua a constante API_URL pelo novo link gerado pelo Ngrok:

const API_URL = '[https://abcd-1234.ngrok-free.app](https://abcd-1234.ngrok-free.app)';


Salve o arquivo. Se estiver usando a Vercel, faça o commit e push para a branch de produção para atualizar o site online.

🔜 Próximos Passos (Roadmap)

[ ] Implementar o upload real de imagens para a foto de perfil usando o Multer (substituindo a entrada de URL).

[ ] Implementar recuperação de senha.

[ ] Refinar validações de formulário no Frontend.

[ ] Paginação no feed de vagas e na busca de profissionais.

Desenvolvido com 💻 e ☕