-- 1. Tabela de Usuários (Empresas e Profissionais)
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

-- 3. Tabela de Candidaturas
CREATE TABLE candidaturas (
    id SERIAL PRIMARY KEY,
    vaga_id INTEGER REFERENCES vagas(id),
    profissional_id INTEGER REFERENCES users(id),
    data_candidatura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vaga_id, profissional_id)
);