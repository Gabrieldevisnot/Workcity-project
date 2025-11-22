# 🏗️ WorkCity - Plataforma de Conexão para Construção Civil

O **WorkCity** é uma aplicação Full Stack desenvolvida para conectar empresas de construção civil a profissionais qualificados (pedreiros, eletricistas, encanadores, etc.). O sistema facilita o recrutamento ativo e passivo através de um dashboard intuitivo.

---

## 🚀 Funcionalidades Principais

### 🏢 Para Empresas
* **Gestão de Vagas:** Criar, visualizar e gerenciar vagas de emprego.
* **Gestão de Candidatos:** Visualizar interessados, aprovar ou rejeitar candidaturas.
* **Recrutamento Ativo:** Buscar profissionais por localização/especialidade e enviar convites diretos.
* **Dashboard:** Estatísticas em tempo real de vagas e candidatos.

### 👷 Para Profissionais
* **Feed de Oportunidades:** Busca avançada de vagas com filtros inteligentes (IBGE).
* **Candidatura:** Aplicação rápida para vagas de interesse.
* **Gestão de Propostas:** Receber e aceitar/recusar convites de empresas.
* **Status:** Acompanhamento em tempo real do status das candidaturas (Enviada, Aprovada, Contratado).

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** HTML5, Tailwind CSS (CDN), JavaScript Vanilla (ES6+).
* **Backend:** Node.js, Express.js.
* **Banco de Dados:** PostgreSQL.
* **Autenticação:** JWT (JSON Web Token) e Bcrypt.js.
* **Integrações:** API de Localidades do IBGE (Estados e Municípios).

---

## 📋 Pré-requisitos

Para rodar este projeto localmente, você precisará de:
* [Node.js](https://nodejs.org/) (v14+)
* [PostgreSQL](https://www.postgresql.org/) (instalado e rodando)
* [Git](https://git-scm.com/)
* VS Code (recomendado)

---

## ⚙️ Instalação e Configuração

Siga os passos abaixo para configurar o ambiente de desenvolvimento.

### 1. Clonar o Repositório

```bash
git clone [https://github.com/SEU_USUARIO/workcity-app.git](https://github.com/SEU_USUARIO/workcity-app.git)
cd workcity-app
2. Configurar o Backend
Instale as dependências do servidor:

Bash

cd backend
npm install
Configuração do Banco de Dados: Abra o arquivo backend/server.js e localize a configuração do Pool. Certifique-se de que a senha e o usuário correspondem ao seu PostgreSQL local:

JavaScript

const pool = new Pool({
    connectionString: 'postgres://postgres:SUA_SENHA_AQUI@localhost:5432/workcity_db'
});
3. Criar o Banco de Dados (SQL)
Abra seu gerenciador de banco de dados (PgAdmin, DBeaver ou Terminal), crie um banco chamado workcity_db e execute o script abaixo para criar a estrutura completa:

SQL

-- 1. Tabela de Usuários (Unificada)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('empresa', 'profissional')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    city VARCHAR(100),
    state VARCHAR(2),
    address TEXT,
    cnpj VARCHAR(20),
    cpf VARCHAR(20),
    specialty VARCHAR(100),
    experience_years INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Vagas
CREATE TABLE vagas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    titulo VARCHAR(255) NOT NULL,
    especialidade VARCHAR(100),
    localizacao VARCHAR(255),
    descricao TEXT,
    salario_min DECIMAL(10, 2),
    salario_max DECIMAL(10, 2),
    tipo_contrato VARCHAR(50),
    experiencia_minima VARCHAR(100),
    requisitos TEXT,
    beneficios TEXT,
    status VARCHAR(20) DEFAULT 'aberta',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Candidaturas (Com Status)
CREATE TABLE candidaturas (
    id SERIAL PRIMARY KEY,
    vaga_id INTEGER REFERENCES vagas(id),
    profissional_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, aprovado, rejeitado, contratado
    data_candidatura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vaga_id, profissional_id)
);

-- 4. Tabela de Convites (Recrutamento Ativo)
CREATE TABLE convites (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES users(id),
    profissional_id INTEGER REFERENCES users(id),
    vaga_id INTEGER REFERENCES vagas(id),
    mensagem TEXT,
    status VARCHAR(20) DEFAULT 'enviado', -- enviado, aceito, recusado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vaga_id, profissional_id)
);
4. Rodar o Projeto
Passo 1: Iniciar o Backend No terminal, dentro da pasta backend:

Bash

node server.js
(Deve aparecer: Servidor rodando na porta 3000)

Passo 2: Iniciar o Frontend O Frontend deve ser servido para evitar erros de CORS.

Opção VS Code: Abra a pasta frontend, abra o arquivo index.html e clique em "Go Live" (Extensão Live Server).

Opção Terminal:

Bash

cd frontend
python -m http.server 5500
# Ou use npx serve
Acesse no navegador: http://127.0.0.1:5500

🧪 Como Testar o Fluxo Completo
Empresa: Cadastre uma empresa e publique uma vaga.

Profissional: Em aba anônima, cadastre um profissional.

Candidatura: No dashboard do profissional, busque a vaga (usando os filtros de cidade/especialidade) e candidate-se.

Aprovação: Volte ao dashboard da empresa, clique na vaga e aprove o candidato.

Convite: Ainda como empresa, vá em "Buscar Profissionais", encontre o usuário e envie um convite para uma vaga.

Aceite: Como profissional, vá na aba "Propostas" e aceite o convite.

🤝 Contribuição
Este projeto está em desenvolvimento contínuo (Branch develop). Para contribuir:

Faça um fork do projeto.

Crie uma branch para sua feature (git checkout -b feature/nova-feature).

Faça o commit (git commit -m 'Adiciona nova feature').

Faça o push (git push origin feature/nova-feature).

Abra um Pull Request.

Desenvolvido com 🧡 por Gabriel Magalhães de Almeida
