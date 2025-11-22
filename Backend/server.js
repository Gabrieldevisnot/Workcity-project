// backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors()); // Permite que o Frontend acesse o Backend


// --- 🕵️‍♂️ O DETETIVE (Adicione este bloco AQUI) ---
app.use((req, res, next) => {
    console.log(`📢 CHEGOU: ${req.method} ${req.url}`);
    next(); // Passa para o próximo passo
});
// --------------------------------------------------
// CONEXÃO COM O BANCO (ATENÇÃO AQUI)
const pool = new Pool({
    // Formato: postgres://usuario:senha@localhost:5432/nome_do_banco
    connectionString: 'postgres://postgres:Sout.ln102030@localhost:5432/workcity_db'
});
// --- MIDDLEWARE DE AUTENTICAÇÃO (COM LOGS) ---
function authenticateToken(req, res, next) {
    console.log("👮‍♂️ Segurança: Verificando crachá...");

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log("👮‍♂️ Segurança: BARRADO! Nenhum token enviado.");
        return res.status(401).json({ message: "Token não fornecido." });
    }

    jwt.verify(token, 'SEGREDO_WORKCITY', (err, user) => {
        if (err) {
            console.log("👮‍♂️ Segurança: BARRADO! Token inválido ou expirado.");
            console.log("Erro:", err.message); // Vai mostrar o motivo exato
            return res.status(403).json({ message: "Token inválido." });
        }

        console.log(`👮‍♂️ Segurança: LIBERADO! Usuário ID: ${user.id}`);
        req.user = user;
        next(); // AQUI É O PASSE LIVRE PARA A ROTA
    });
}

// ... (imports e configurações iniciais) ...

app.use(cors());
app.use(express.json());

// ... (função authenticateToken) ...

// ======================================================
// 🚨 A ROTA DO FEED DEVE SER A PRIMEIRA DE TODAS AS ROTAS
// ======================================================
app.get('/vagas/feed', authenticateToken, async (req, res) => {
    const { busca, especialidade, cidade } = req.query;
    const profissionalId = req.user.id;

    console.log("--- PROCESSANDO FEED ---"); // Adicionei este log para confirmar

    try {
        let sql = `
            SELECT v.*, u.name as nome_empresa 
            FROM vagas v 
            JOIN users u ON v.user_id = u.id 
            WHERE v.status = 'aberta' 
            AND v.id NOT IN (SELECT vaga_id FROM candidaturas WHERE profissional_id = $1)
        `;

        const values = [profissionalId];
        let counter = 2;

        if (busca && busca.trim() !== '') {
            sql += ` AND (v.titulo ILIKE $${counter} OR v.descricao ILIKE $${counter})`;
            values.push(`%${busca}%`);
            counter++;
        }

        if (especialidade && especialidade.trim() !== '') {
            sql += ` AND v.especialidade ILIKE $${counter}`;
            values.push(especialidade);
            counter++;
        }

        if (cidade && cidade.trim() !== '') {
            sql += ` AND v.localizacao ILIKE $${counter}`;
            values.push(`%${cidade}%`);
            counter++;
        }

        sql += ` ORDER BY v.created_at DESC`;

        console.log("--- SQL GERADO ---");
        console.log(sql);
        console.log("Valores:", values);

        const result = await pool.query(sql, values);
        res.json(result.rows);

    } catch (err) {
        console.error("Erro SQL:", err);
        res.status(500).json({ message: "Erro ao buscar vagas" });
    }
});

// --- ROTA DE CRIAR VAGA (Protegida pelo authenticateToken) ---
app.post('/vagas', authenticateToken, async (req, res) => {
    const {
        titulo, especialidade, localizacao, descricao,
        salarioMin, salarioMax, tipoContrato,
        experienciaMinima, requisitos, beneficios
    } = req.body;

    try {
        const novaVaga = await pool.query(
            `INSERT INTO vagas (
                user_id, titulo, especialidade, localizacao, descricao,
                salario_min, salario_max, tipo_contrato, experiencia_minima,
                requisitos, beneficios
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *`,
            [
                req.user.id, // O ID vem do Token, não do formulário (Segurança!)
                titulo, especialidade, localizacao, descricao,
                salarioMin || null, salarioMax || null, tipoContrato, experienciaMinima,
                requisitos, beneficios
            ]
        );

        res.json(novaVaga.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao criar vaga" });
    }
});
// ROTA DE CADASTRO
app.post('/auth/register', async (req, res) => {
    const {
        email, password, userType, telefone, cidade, estado, endereco, // Comuns
        razaoSocial, cnpj, // Empresa
        nome, cpf, especialidade, experiencia // Profissional
    } = req.body;

    try {
        // 1. Verifica duplicidade
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Email já cadastrado." });
        }

        // 2. Criptografa senha
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // 3. Define nome e experiência
        const finalName = userType === 'empresa' ? razaoSocial : nome;
        // Remove texto e deixa só numeros na experiência
        const years = experiencia ? parseInt(String(experiencia).replace(/\D/g, '')) : null;

        // 4. Insere no banco
        const newUser = await pool.query(
            `INSERT INTO users (
                name, email, password_hash, user_type, phone, city, state, address,
                cnpj, cpf, specialty, experience_years
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
            RETURNING id, name, email, user_type`,
            [
                finalName, email, hash, userType, telefone, cidade, estado, endereco,
                cnpj || null, cpf || null, especialidade || null, years
            ]
        );

        res.json(newUser.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro no servidor" });
    }
});

// ROTA DE LOGIN
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) return res.status(400).json({ message: "Usuário não encontrado" });

        const user = result.rows[0];
        const validPass = await bcrypt.compare(password, user.password_hash);

        if (!validPass) return res.status(400).json({ message: "Senha incorreta" });

        const token = jwt.sign({ id: user.id }, 'SEGREDO_WORKCITY', { expiresIn: '1h' });

        res.json({ token, user: { name: user.name, type: user.user_type, email: user.email } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro no login" });
    }
});
// ROTA: LISTAR VAGAS DA EMPRESA (COM CONTAGEM DE CANDIDATOS)
app.get('/minhas-vagas', authenticateToken, async (req, res) => {
    try {
        // A mágica acontece aqui:
        // 1. COUNT(c.id) conta quantos registros existem na tabela de candidaturas para esta vaga.
        // 2. LEFT JOIN garante que a vaga apareça mesmo se tiver 0 candidatos.
        // 3. GROUP BY agrupa os resultados por vaga para fazer a conta certa.
        const result = await pool.query(`
            SELECT v.*, COUNT(c.id)::int as total_candidatos
            FROM vagas v
            LEFT JOIN candidaturas c ON v.id = c.vaga_id
            WHERE v.user_id = $1
            GROUP BY v.id
            ORDER BY v.created_at DESC
        `, [req.user.id]);
        
        res.json(result.rows); 
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar vagas" });
    }
});
// ROTA: OBTER DETALHES DE UMA ÚNICA VAGA
app.get('/vagas/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM vagas WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Vaga não encontrada" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar vaga" });
    }
});
// ROTA DO FEED (Filtrada: Não mostra o que eu já apliquei)
app.get('/vagas/feed', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT v.*, u.name as nome_empresa 
            FROM vagas v 
            JOIN users u ON v.user_id = u.id 
            WHERE v.status = 'aberta' 
            AND v.id NOT IN (
                SELECT vaga_id FROM candidaturas WHERE profissional_id = $1
            )
            ORDER BY v.created_at DESC
        `, [req.user.id]); // $1 é o ID do profissional logado

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar feed" });
    }
});
// ROTA PARA SE CANDIDATAR A UMA VAGA
app.post('/candidaturas', authenticateToken, async (req, res) => {
    const { vagaId } = req.body;
    const profissionalId = req.user.id; // Pega do token

    try {
        // Tenta inserir a candidatura
        const novaCandidatura = await pool.query(
            'INSERT INTO candidaturas (vaga_id, profissional_id) VALUES ($1, $2) RETURNING *',
            [vagaId, profissionalId]
        );

        res.json({ message: "Candidatura realizada com sucesso!", candidatura: novaCandidatura.rows[0] });

    } catch (err) {
        // Código 23505 no Postgres significa "Violação de Unicidade" (Duplicado)
        if (err.code === '23505') {
            return res.status(400).json({ message: "Você já se candidatou para esta vaga." });
        }
        console.error(err);
        res.status(500).json({ message: "Erro ao realizar candidatura." });
    }
});
// ROTA PARA CANCELAR (REMOVER) UMA CANDIDATURA
app.delete('/candidaturas/:id', authenticateToken, async (req, res) => {
    const idCandidatura = req.params.id;
    const idProfissional = req.user.id; // O ID de quem está logado

    try {
        // A query garante que só apaga se o ID bater E se o dono for o profissional logado
        const result = await pool.query(
            'DELETE FROM candidaturas WHERE id = $1 AND profissional_id = $2 RETURNING *',
            [idCandidatura, idProfissional]
        );

        if (result.rowCount === 0) {
            // Se não apagou nada, é porque a candidatura não existe ou não pertence a este utilizador
            return res.status(404).json({ message: "Candidatura não encontrada ou permissão negada." });
        }

        res.json({ message: "Candidatura removida com sucesso." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao cancelar candidatura." });
    }
});

// ROTA: LISTAR CANDIDATOS DE UMA VAGA ESPECÍFICA
app.get('/vagas/:id/candidatos', authenticateToken, async (req, res) => {
    const vagaId = req.params.id;
    const empresaId = req.user.id;

    try {
        // Query inteligente:
        // 1. Busca os dados do candidato (nome, email, telefone, etc)
        // 2. Garante que a vaga realmente pertence à empresa que está pedindo (Segurança!)
        const result = await pool.query(`
            SELECT 
                c.id as candidatura_id,
                c.status,
                c.data_candidatura,
                u.name as nome_profissional,
                u.email,
                u.phone,
                u.city,
                u.specialty as especialidade,
                u.experience_years
            FROM candidaturas c
            JOIN users u ON c.profissional_id = u.id
            JOIN vagas v ON c.vaga_id = v.id
            WHERE c.vaga_id = $1 AND v.user_id = $2
        `, [vagaId, empresaId]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar candidatos." });
    }
});

// ROTA: ALTERAR STATUS DA CANDIDATURA (Aprovar/Rejeitar)
app.patch('/candidaturas/:id/status', authenticateToken, async (req, res) => {
    const { status } = req.body; // Recebe 'aprovado' ou 'rejeitado'
    const candidaturaId = req.params.id;

    try {
        await pool.query(
            'UPDATE candidaturas SET status = $1 WHERE id = $2',
            [status, candidaturaId]
        );
        res.json({ message: "Status atualizado com sucesso!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao atualizar status." });
    }
});
// ROTA DO FEED (DEBUG DE SQL)
app.get('/vagas/feed', authenticateToken, async (req, res) => {
    const { busca, especialidade, cidade } = req.query;
    const profissionalId = req.user.id;

    try {
        // 1. Começa a frase SQL base
        let sql = `
            SELECT v.*, u.name as nome_empresa 
            FROM vagas v 
            JOIN users u ON v.user_id = u.id 
            WHERE v.status = 'aberta' 
            AND v.id NOT IN (SELECT vaga_id FROM candidaturas WHERE profissional_id = $1)
        `;

        const values = [profissionalId];
        let counter = 2; // Próximo parâmetro será o $2

        // 2. Adiciona os filtros se existirem
        if (busca && busca.trim() !== '') {
            sql += ` AND (v.titulo ILIKE $${counter} OR v.descricao ILIKE $${counter})`;
            values.push(`%${busca}%`);
            counter++;
        }

        if (especialidade && especialidade.trim() !== '') {
            sql += ` AND v.especialidade ILIKE $${counter}`;
            values.push(especialidade);
            counter++;
        }

        if (cidade && cidade.trim() !== '') {
            sql += ` AND v.localizacao ILIKE $${counter}`;
            values.push(`%${cidade}%`);
            counter++;
        }

        sql += ` ORDER BY v.created_at DESC`;

        // --- LOG PARA DESCOBRIR O ERRO ---
        console.log("--- SQL GERADO ---");
        console.log(sql);
        console.log("Valores:", values);
        // ---------------------------------

        const result = await pool.query(sql, values);

        console.log(`Encontradas: ${result.rows.length}`);
        res.json(result.rows);

    } catch (err) {
        console.error("Erro SQL:", err);
        res.status(500).json({ message: "Erro ao buscar vagas" });
    }
});
// (BÔNUS) ROTA PARA VER MINHAS CANDIDATURAS (Para a aba "Minhas Candidaturas")
app.get('/minhas-candidaturas', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.*, v.titulo, v.localizacao, v.salario_min, v.salario_max, u.name as nome_empresa
            FROM candidaturas c
            JOIN vagas v ON c.vaga_id = v.id
            JOIN users u ON v.user_id = u.id
            WHERE c.profissional_id = $1
            ORDER BY c.data_candidatura DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar candidaturas" });
    }
});
// ROTA: BUSCAR PROFISSIONAIS (Para a empresa encontrar talentos)
app.get('/profissionais', authenticateToken, async (req, res) => {
    const { busca, especialidade, cidade } = req.query;

    try {
        let sql = `
            SELECT id, name, city, specialty, experience_years, email, phone 
            FROM users 
            WHERE user_type = 'profissional'
        `;
        
        const values = [];
        let counter = 1;

        if (busca) {
            sql += ` AND name ILIKE $${counter}`;
            values.push(`%${busca}%`);
            counter++;
        }
        if (especialidade) {
            sql += ` AND specialty ILIKE $${counter}`; // ILIKE ignora maiúsculas
            values.push(especialidade);
            counter++;
        }
        if (cidade) {
            sql += ` AND city ILIKE $${counter}`;
            values.push(`%${cidade}%`);
            counter++;
        }

        sql += ` ORDER BY created_at DESC`;

        const result = await pool.query(sql, values);
        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar profissionais." });
    }
});

// ROTA: ENVIAR CONVITE (PROPOSTA)
app.post('/convites', authenticateToken, async (req, res) => {
    const { profissionalId, vagaId, mensagem } = req.body;
    const empresaId = req.user.id;

    try {
        await pool.query(
            `INSERT INTO convites (empresa_id, profissional_id, vaga_id, mensagem) 
             VALUES ($1, $2, $3, $4)`,
            [empresaId, profissionalId, vagaId, mensagem]
        );

        res.json({ message: "Convite enviado com sucesso!" });

    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: "Você já convidou este profissional para esta vaga." });
        }
        console.error(err);
        res.status(500).json({ message: "Erro ao enviar convite." });
    }
});

// ROTA: VER CONVITES RECEBIDOS (Para o Profissional)
app.get('/minhas-propostas', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT c.id, c.mensagem, c.status, c.created_at,
                   u.name as nome_empresa,
                   v.titulo as titulo_vaga, v.id as vaga_id, v.localizacao
            FROM convites c
            JOIN users u ON c.empresa_id = u.id
            JOIN vagas v ON c.vaga_id = v.id
            WHERE c.profissional_id = $1
            ORDER BY c.created_at DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar propostas" });
    }
});

// ROTA: RESPONDER PROPOSTA (Aceitar/Recusar)
app.post('/convites/:id/responder', authenticateToken, async (req, res) => {
    const { status, vagaId } = req.body; // status: 'aceito' ou 'recusado'
    const conviteId = req.params.id;
    const profissionalId = req.user.id;

    // Usamos 'client' para fazer uma Transação (tudo ou nada)
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Inicia transação

        // 1. Atualiza o status do convite na tabela 'convites'
        await client.query(
            'UPDATE convites SET status = $1 WHERE id = $2 AND profissional_id = $3',
            [status, conviteId, profissionalId]
        );

        // 2. Se ACEITOU, cria automaticamente a candidatura!
        if (status === 'aceito') {
            // Verifica se já não era candidato antes para não dar erro
            const check = await client.query(
                'SELECT * FROM candidaturas WHERE vaga_id = $1 AND profissional_id = $2',
                [vagaId, profissionalId]
            );

            if (check.rowCount === 0) {
                // Insere na tabela de candidaturas (aparecerá para a empresa!)
                await client.query(
                    'INSERT INTO candidaturas (vaga_id, profissional_id, status) VALUES ($1, $2, $3)',
                    [vagaId, profissionalId, 'pendente'] 
                );
            }
        }

        await client.query('COMMIT'); // Confirma tudo
        res.json({ message: `Proposta ${status} com sucesso!` });

    } catch (err) {
        await client.query('ROLLBACK'); // Desfaz se der erro
        console.error(err);
        res.status(500).json({ message: "Erro ao responder proposta" });
    } finally {
        client.release();
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});