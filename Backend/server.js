// backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors()); // Permite que o Frontend acesse o Backend

// CONEXÃO COM O BANCO (ATENÇÃO AQUI)
const pool = new Pool({
    // Formato: postgres://usuario:senha@localhost:5432/nome_do_banco
    connectionString: 'postgres://postgres:Sout.ln102030@localhost:5432/workcity_db'
});
// --- MIDDLEWARE DE AUTENTICAÇÃO (O Segurança) ---
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Pega o token "Bearer XYZ..."

    if (!token) return res.status(401).json({ message: "Acesso negado. Faça login." });

    jwt.verify(token, 'SEGREDO_WORKCITY', (err, user) => {
        if (err) return res.status(403).json({ message: "Token inválido." });
        req.user = user; // Salva os dados do usuário na requisição
        next(); // Pode passar!
    });
}

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
// ROTA PARA LISTAR VAGAS DA EMPRESA LOGADA
app.get('/minhas-vagas', authenticateToken, async (req, res) => {
    try {
        // Busca vagas onde o user_id é igual ao ID de quem está logado
        const result = await pool.query(
            'SELECT * FROM vagas WHERE user_id = $1 ORDER BY created_at DESC', 
            [req.user.id]
        );
        
        res.json(result.rows); // Devolve a lista para o frontend
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar vagas" });
    }
});
// ROTA PÚBLICA DE VAGAS (FEED)
// Nota: Usei 'authenticateToken' para garantir que só usuários logados vejam as vagas,
// mas se quiser que seja público, é só tirar o authenticateToken.
/*app.get('/vagas/feed', authenticateToken, async (req, res) => {
    try {
        // Busca todas as vagas abertas, da mais recente para a mais antiga
        // Também fazemos um JOIN para trazer o nome da empresa que postou!
        const result = await pool.query(`
            SELECT v.*, u.name as nome_empresa 
            FROM vagas v 
            JOIN users u ON v.user_id = u.id 
            WHERE v.status = 'aberta' 
            ORDER BY v.created_at DESC
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar feed de vagas" });
    }
});*/
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

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});