-- Criação da Tabela Unificada de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    -- Dados de Login
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('empresa', 'profissional')),
    
    -- Dados Pessoais/Empresariais
    name VARCHAR(255) NOT NULL, -- Razão Social ou Nome Completo
    phone VARCHAR(50),
    city VARCHAR(100),
    state VARCHAR(2),
    address TEXT,

    -- Específicos
    cnpj VARCHAR(20),
    cpf VARCHAR(20),
    specialty VARCHAR(100),
    experience_years INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);