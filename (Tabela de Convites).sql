CREATE TABLE convites (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES users(id),
    profissional_id INTEGER REFERENCES users(id),
    vaga_id INTEGER REFERENCES vagas(id),
    mensagem TEXT,
    status VARCHAR(20) DEFAULT 'enviado', -- enviado, aceito, recusado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(vaga_id, profissional_id) -- Impede convidar a mesma pessoa 2x para a mesma vaga
);
