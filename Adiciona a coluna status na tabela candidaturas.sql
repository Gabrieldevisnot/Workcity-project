-- Adiciona a coluna status na tabela candidaturas
ALTER TABLE candidaturas 
ADD COLUMN status VARCHAR(20) DEFAULT 'pendente'; -- Valores: pendente, aprovado, rejeitado