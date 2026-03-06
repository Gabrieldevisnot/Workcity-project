// backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// ----------------------------------------------
 const app = express();
app.use(express.json());
app.use(cors());


// --- 🕵️‍♂️ O DETETIVE
app.use((req, res, next) => {
    console.log(`📢 CHEGOU: ${req.method} ${req.url}`);
    next(); // Passa para o próximo passo
});

// --- MIDDLEWARE DE AUTENTICAÇÃO (COM LOGS) ---
function authenticateToken(req, res, next) {
    console.log("👮‍♂️ Segurança: Verificando crachá...");

   const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Token ausente" });

    jwt.verify(token, 'SEGREDO_WORKCITY', (err, user) => {
        if (err) return res.status(403).json({ message: "Token inválido" });
        req.user = user;
        next();
    });
}

// ... (função authenticateToken) ...

// ======================================================
// 🚨 A ROTA DO FEED DEVE SER A PRIMEIRA DE TODAS AS ROTAS
// ======================================================
// ROTA: FEED DE VAGAS
app.get('/vagas/feed', authenticateToken, async (req, res) => {
    const { busca, especialidade, cidade } = req.query;
    const profissionalId = req.user.id;

    console.log("--- FEED REQUEST ---");

    try {
        const whereClause = {
            status: 'aberta',
            candidaturas: {
                none: { profissional_id: profissionalId }
            }
        };

        if (busca && busca.trim().length > 0) {
            whereClause.OR = [
                { titulo: { contains: busca, mode: 'insensitive' } },
                { descricao: { contains: busca, mode: 'insensitive' } }
            ];
        }

        if (especialidade && especialidade.trim().length > 0) {
            whereClause.especialidade = { contains: especialidade, mode: 'insensitive' };
        }

        if (cidade && cidade.trim().length > 0) {
            whereClause.localizacao = { contains: cidade, mode: 'insensitive' };
        }

        const vagas = await prisma.vagas.findMany({
            where: whereClause,
            orderBy: { created_at: 'desc' },
            include: {
                // CORREÇÃO 1: PLURAL AQUI 👇
                users: { 
                    select: { name: true }
                }
            }
        });

        console.log(`Vagas encontradas: ${vagas.length}`);

        const resultado = vagas.map(vaga => ({
            ...vaga,
            // CORREÇÃO 2: PLURAL AQUI TAMBÉM 👇
            nome_empresa: vaga.users?.name || "Empresa Confidencial", 
            salario_min: vaga.salario_min ? Number(vaga.salario_min) : null,
            salario_max: vaga.salario_max ? Number(vaga.salario_max) : null
        }));

        res.json(resultado);

    } catch (err) {
        console.error("ERRO CRÍTICO NO FEED:", err);
        res.status(200).json([]); 
    }
});

// --- ROTA DE CRIAR VAGA (Protegida pelo authenticateToken) ---
// ROTA: CRIAR VAGA (VERSÃO PRISMA)
app.post('/vagas', authenticateToken, async (req, res) => {
    const {
        titulo, especialidade, localizacao, descricao,
        salarioMin, salarioMax, tipoContrato,
        experienciaMinima, requisitos, beneficios
    } = req.body;

    try {
        const novaVaga = await prisma.vagas.create({
            data: {
                user_id: req.user.id, // Pega do token logado
                titulo: titulo,
                especialidade: especialidade,
                localizacao: localizacao,
                descricao: descricao,
                
                // Conversão importante: O Prisma precisa de números ou null
                salario_min: salarioMin ? Number(salarioMin) : null,
                salario_max: salarioMax ? Number(salarioMax) : null,
                
                tipo_contrato: tipoContrato,
                experiencia_minima: experienciaMinima,
                requisitos: requisitos,
                beneficios: beneficios,
                status: 'aberta' // Define padrão como aberta
            }
        });

        res.json(novaVaga);

    } catch (err) {
        console.error("Erro ao criar vaga:", err);
        res.status(500).json({ message: "Erro ao criar vaga" });
    }
});
// ROTA DE CADASTRO
app.post('/auth/register', async (req, res) => {
    const { 
        email, password, userType, telefone, cidade, estado, endereco,
        razaoSocial, cnpj, nome, cpf, especialidade, experiencia 
    } = req.body;

    try {
        // 1. Verifica se já existe (Prisma findUnique)
        const userExists = await prisma.users.findUnique({
            where: { email: email }
        });

        if (userExists) {
            return res.status(400).json({ message: "Email já cadastrado." });
        }

        // 2. Criptografia (Igual)
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // 3. Prepara dados
        const finalName = userType === 'empresa' ? razaoSocial : nome;
        const years = experiencia ? parseInt(String(experiencia).replace(/\D/g, '')) : null;

        // 4. Salvar no Banco (Prisma create)
        const newUser = await prisma.users.create({
            data: {
                email: email,
                password_hash: hash,
                user_type: userType, // O Prisma aceita a string se bater com o Enum
                name: finalName,
                phone: telefone,
                city: cidade, // Agora salva "Cidade - UF" direto
                state: estado,
                address: endereco,
                cnpj: cnpj || null,
                cpf: cpf || null,
                specialty: especialidade || null,
                experience_years: years
            }
        });

        res.json(newUser);

    } catch (err) {
        console.error("Erro no cadastro:", err);
        res.status(500).json({ message: "Erro no servidor" });
    }
});

// ROTA DE LOGIN
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca usuário
        const user = await prisma.users.findUnique({
            where: { email: email }
        });
        
        if (!user) {
            return res.status(400).json({ message: "Usuário não encontrado" });
        }

        // Verifica senha
        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) {
            return res.status(400).json({ message: "Senha incorreta" });
        }

        // Gera Token
        const token = jwt.sign(
            { id: user.id, type: user.user_type }, 
            'SEGREDO_WORKCITY', 
            { expiresIn: '1h' }
        );

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                type: user.user_type, 
                email: user.email 
            } 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro no login" });
    }
});
// ROTA: LISTAR VAGAS DA EMPRESA
// ROTA: LISTAR MINHAS VAGAS (VERSÃO PRISMA)
app.get('/minhas-vagas', authenticateToken, async (req, res) => {
    try {
        const vagas = await prisma.vagas.findMany({
            where: {
                user_id: req.user.id // Filtra pelas vagas da empresa logada
            },
            orderBy: {
                created_at: 'desc'
            },
            include: {
                _count: { // Conta as candidaturas automaticamente
                    select: { candidaturas: true }
                }
            }
        });

        // Formata para o frontend (transforma _count em total_candidatos)
        const vagasFormatadas = vagas.map(vaga => ({
            ...vaga,
            total_candidatos: vaga._count.candidaturas,
            // Garante conversão de números decimais se necessário
            salario_min: vaga.salario_min ? Number(vaga.salario_min) : null,
            salario_max: vaga.salario_max ? Number(vaga.salario_max) : null
        }));
        
        res.json(vagasFormatadas);

    } catch (err) {
        console.error("Erro ao buscar vagas:", err);
        res.status(500).json({ message: "Erro ao buscar vagas" });
    }
});
// ROTA: OBTER DETALHES DE UMA ÚNICA VAGA
app.get('/vagas/:id', authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const vaga = await prisma.vagas.findUnique({
            where: { id: id }
        });

        if (!vaga) {
            return res.status(404).json({ message: "Vaga não encontrada" });
        }

        res.json(vaga);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar vaga" });
    }
});

// ROTA: FEED DE VAGAS (VERSÃO PRISMA 100%)
app.get('/vagas/feed', authenticateToken, async (req, res) => {
    const { busca, especialidade, cidade } = req.query;
    const profissionalId = req.user.id;

    try {
        // 1. Construção dinâmica do filtro (WHERE)
        const whereClause = {
            status: 'aberta',
            // TRADUÇÃO DO "NOT IN":
            // "Onde NENHUMA (none) das candidaturas pertence a este profissional"
            candidaturas: {
                none: {
                    profissional_id: profissionalId
                }
            }
        };

        // 2. Adiciona filtros se o usuário digitou algo
        if (busca && busca.trim().length > 0) {
            whereClause.OR = [
                { titulo: { contains: busca, mode: 'insensitive' } },
                { descricao: { contains: busca, mode: 'insensitive' } }
            ];
        }

        if (especialidade && especialidade.trim().length > 0) {
            whereClause.especialidade = { contains: especialidade, mode: 'insensitive' };
        }

        if (cidade && cidade.trim().length > 0) {
            whereClause.localizacao = { contains: cidade, mode: 'insensitive' };
        }

        // 3. Busca no Banco
        const vagas = await prisma.vagas.findMany({
            where: whereClause,
            orderBy: { created_at: 'desc' },
            include: {
                // Traz o nome da empresa (lembre-se que o Prisma chamou de 'users')
                users: { 
                    select: { name: true }
                }
            }
        });

        // 4. Formata para o Frontend (Flattening)
        const resultado = vagas.map(vaga => ({
            ...vaga,
            nome_empresa: vaga.users?.name || "Empresa Confidencial",
            // Garante que decimais virem números normais
            salario_min: vaga.salario_min ? Number(vaga.salario_min) : null,
            salario_max: vaga.salario_max ? Number(vaga.salario_max) : null
        }));

        res.json(resultado);

    } catch (err) {
        console.error("Erro no Feed Prisma:", err);
        // Retorna array vazio em vez de erro 500 para não quebrar a tela do usuário
        res.status(200).json([]); 
    }
});
// ROTA PARA SE CANDIDATAR A UMA VAGA
// ROTA: CANDIDATAR-SE (VERSÃO PRISMA)
app.post('/candidaturas', authenticateToken, async (req, res) => {
    const { vagaId } = req.body;
    const profissionalId = req.user.id;

    try {
        // O Prisma tenta criar. Se violar o UNIQUE (já existe), ele lança erro.
        const novaCandidatura = await prisma.candidaturas.create({
            data: {
                vaga_id: parseInt(vagaId),
                profissional_id: profissionalId,
                status: 'pendente'
            }
        });

        res.json({ message: "Candidatura realizada com sucesso!", candidatura: novaCandidatura });

    } catch (err) {
        // Código P2002 no Prisma = Violação de Unicidade (Duplicado)
        if (err.code === 'P2002') {
            return res.status(400).json({ message: "Você já se candidatou para esta vaga." });
        }
        console.error("Erro candidatura:", err);
        res.status(500).json({ message: "Erro ao realizar candidatura." });
    }
});
// ROTA PARA CANCELAR (REMOVER) UMA CANDIDATURA
app.delete('/candidaturas/:id', authenticateToken, async (req, res) => {
    const idCandidatura = parseInt(req.params.id);
    const profissionalId = req.user.id;

    try {
        // O deleteMany com 'count' é uma forma segura de deletar verificando dono
        // Mas o 'delete' padrão exige ID único.
        // Vamos usar deleteMany para garantir que só apaga se o profissional for o dono
        const result = await prisma.candidaturas.deleteMany({
            where: {
                id: idCandidatura,
                profissional_id: profissionalId
            }
        });

        if (result.count === 0) {
            return res.status(404).json({ message: "Candidatura não encontrada ou permissão negada." });
        }

        res.json({ message: "Candidatura removida com sucesso." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao cancelar candidatura." });
    }
});

// ROTA: LISTAR CANDIDATOS DE UMA VAGA ESPECÍFICA
// 1. LISTAR CANDIDATOS DE UMA VAGA
app.get('/vagas/:id/candidatos', authenticateToken, async (req, res) => {
    const vagaId = parseInt(req.params.id);
    const empresaId = req.user.id;

    try {
        // Verifica se a vaga pertence à empresa antes de buscar
        // O Prisma permite buscar "Candidaturas onde a Vaga tem user_id = empresaId"
        const candidaturas = await prisma.candidaturas.findMany({
            where: {
                vaga_id: vagaId,
                vagas: { user_id: empresaId } // Segurança: Só mostra se for dono da vaga
            },
            include: {
                users: true // Traz os dados do profissional (nome, email, etc)
            }
        });

        // Formata para o frontend (achatando o objeto)
        const resultado = candidaturas.map(c => ({
            candidatura_id: c.id,
            status: c.status,
            data_candidatura: c.data_candidatura,
            // Dados do profissional
            nome_profissional: c.users.name,
            email: c.users.email,
            phone: c.users.phone,
            city: c.users.city,
            especialidade: c.users.specialty,
            experience_years: c.users.experience_years
        }));

        res.json(resultado);

    } catch (err) {
        console.error("Erro listar candidatos:", err);
        res.status(500).json({ message: "Erro ao buscar candidatos." });
    }
});

// ROTA: ALTERAR STATUS DA CANDIDATURA (Aprovar/Rejeitar)
// 2. ALTERAR STATUS (Aprovar/Rejeitar)
app.patch('/candidaturas/:id/status', authenticateToken, async (req, res) => {
    const { status } = req.body;
    const candidaturaId = parseInt(req.params.id);

    try {
        await prisma.candidaturas.update({
            where: { id: candidaturaId },
            data: { status: status }
        });
        res.json({ message: "Status atualizado!" });
    } catch (err) {
        console.error("Erro status:", err);
        res.status(500).json({ message: "Erro ao atualizar." });
    }
});
// ROTA DO FEED (DEBUG DE SQL)
app.get('/vagas/feed', authenticateToken, async (req, res) => {
    const { busca, especialidade, cidade } = req.query;
    const profissionalId = req.user.id;

    try {
        // 1. Construção dinâmica do filtro (WHERE)
        const whereClause = {
            status: 'aberta',
            // TRADUÇÃO DO "NOT IN":
            // "Onde NENHUMA (none) das candidaturas pertence a este profissional"
            candidaturas: {
                none: {
                    profissional_id: profissionalId
                }
            }
        };

        // 2. Adiciona filtros se o usuário digitou algo
        if (busca && busca.trim().length > 0) {
            whereClause.OR = [
                { titulo: { contains: busca, mode: 'insensitive' } },
                { descricao: { contains: busca, mode: 'insensitive' } }
            ];
        }

        if (especialidade && especialidade.trim().length > 0) {
            whereClause.especialidade = { contains: especialidade, mode: 'insensitive' };
        }

        if (cidade && cidade.trim().length > 0) {
            whereClause.localizacao = { contains: cidade, mode: 'insensitive' };
        }

        // 3. Busca no Banco
        const vagas = await prisma.vagas.findMany({
            where: whereClause,
            orderBy: { created_at: 'desc' },
            include: {
                // Traz o nome da empresa (lembre-se que o Prisma chamou de 'users')
                users: { 
                    select: { name: true }
                }
            }
        });

        // 4. Formata para o Frontend (Flattening)
        const resultado = vagas.map(vaga => ({
            ...vaga,
            // Mapeia o nome da empresa que veio no objeto aninhado 'users'
            nome_empresa: vaga.users?.name || "Empresa Confidencial",
            
            // Garante que decimais virem números normais para não dar erro no JSON
            salario_min: vaga.salario_min ? Number(vaga.salario_min) : null,
            salario_max: vaga.salario_max ? Number(vaga.salario_max) : null
        }));

        res.json(resultado);

    } catch (err) {
        console.error("Erro no Feed Prisma:", err);
        // Retorna array vazio em vez de erro 500 para não quebrar a tela do usuário
        res.status(200).json([]); 
    }
});
// (BÔNUS) ROTA PARA VER MINHAS CANDIDATURAS (Para a aba "Minhas Candidaturas")
app.get('/minhas-candidaturas', authenticateToken, async (req, res) => {
    try {
        const candidaturas = await prisma.candidaturas.findMany({
            where: {
                profissional_id: req.user.id
            },
            orderBy: {
                data_candidatura: 'desc'
            },
            include: {
                // Trazemos os dados da VAGA
                vagas: {
                    include: {
                        // Dentro da vaga, trazemos o nome da EMPRESA
                        users: { select: { name: true } } 
                    }
                }
            }
        });

        // Formatamos para o frontend (achatando a estrutura)
        const resultado = candidaturas.map(c => ({
            ...c,
            titulo: c.vagas.titulo,
            localizacao: c.vagas.localizacao,
            salario_min: c.vagas.salario_min, // Prisma já trata o tipo se configurado certo, senão use Number()
            salario_max: c.vagas.salario_max,
            nome_empresa: c.vagas.users.name
        }));
        
        res.json(resultado);

    } catch (err) {
        console.error("Erro minhas candidaturas:", err);
        res.status(500).json({ message: "Erro ao buscar candidaturas" });
    }
});
// ROTA: BUSCAR PROFISSIONAIS (Para a empresa encontrar talentos)
app.get('/profissionais', authenticateToken, async (req, res) => {
    const { busca, especialidade, cidade } = req.query;

    try {
        const filtro = { user_type: 'profissional' }; // Filtro base

        if (busca) filtro.name = { contains: busca, mode: 'insensitive' };
        if (especialidade) filtro.specialty = { contains: especialidade, mode: 'insensitive' };
        if (cidade) filtro.city = { contains: cidade, mode: 'insensitive' };

        const profissionais = await prisma.users.findMany({
            where: filtro,
            orderBy: { created_at: 'desc' },
            select: { // Selecionamos apenas campos seguros (sem senha!)
                id: true, name: true, city: true, specialty: true, 
                experience_years: true, email: true, phone: true 
            }
        });

        res.json(profissionais);

    } catch (err) {
        console.error("Erro buscar profissionais:", err);
        res.status(500).json({ message: "Erro na busca." });
    }
});

// ROTA: ENVIAR CONVITE (PROPOSTA)
app.post('/convites', authenticateToken, async (req, res) => {
    const { profissionalId, vagaId, mensagem } = req.body;
    const empresaId = req.user.id;

    try {
        await prisma.convites.create({
            data: {
                empresa_id: empresaId,
                profissional_id: parseInt(profissionalId),
                vaga_id: parseInt(vagaId),
                mensagem: mensagem,
                status: 'enviado'
            }
        });
        res.json({ message: "Convite enviado!" });

    } catch (err) {
        if (err.code === 'P2002') {
            return res.status(400).json({ message: "Já existe um convite para esta vaga." });
        }
        console.error("Erro convite:", err);
        res.status(500).json({ message: "Erro ao enviar convite." });
    }
});


// ROTA: MINHAS PROPOSTAS
app.get('/minhas-propostas', authenticateToken, async (req, res) => {
    try {
        const propostas = await prisma.convites.findMany({
            where: {
                profissional_id: req.user.id
            },
            orderBy: {
                created_at: 'desc'
            },
            include: {
                // Traz dados da empresa (usando o relacionamento definido no schema)
                // Se der erro aqui, verifique o nome no schema.prisma (pode ser users_convites_empresa...)
                // Mas se você usou o enum anterior, deve ser 'empresa' ou 'users_convites_empresa_idTousers'
                // Vamos tentar pelo nome genérico da tabela se o alias falhar, mas o ideal é o alias.
                // VOU USAR O PADRÃO MAIS COMUM DE INTROSPECTION AQUI PARA GARANTIR:
                users_convites_empresa_idTousers: { select: { name: true } }, 
                vagas: { select: { id: true, titulo: true, localizacao: true } }
            }
        });

        const resultado = propostas.map(p => ({
            id: p.id,
            mensagem: p.mensagem,
            status: p.status,
            created_at: p.created_at,
            // Ajuste aqui conforme o nome que o Prisma gerou no seu arquivo schema.prisma
            nome_empresa: p.users_convites_empresa_idTousers ? p.users_convites_empresa_idTousers.name : "Empresa",
            titulo_vaga: p.vagas.titulo,
            vaga_id: p.vagas.id,
            localizacao: p.vagas.localizacao
        }));

        res.json(resultado);
    } catch (err) {
        console.error("Erro propostas:", err);
        res.status(500).json({ message: "Erro ao buscar propostas" });
    }
});

// ROTA: RESPONDER PROPOSTA (Aceitar/Recusar)
// ROTA: RESPONDER PROPOSTA (VERSÃO PRISMA - TRANSAÇÃO)
app.post('/convites/:id/responder', authenticateToken, async (req, res) => {
    const { status, vagaId } = req.body;
    const conviteId = parseInt(req.params.id);
    const profissionalId = req.user.id;

    try {
        // Inicia a transação (Tudo ou nada)
        await prisma.$transaction(async (tx) => {
            
            // 1. Atualiza o convite
            await tx.convites.updateMany({
                where: { 
                    id: conviteId,
                    profissional_id: profissionalId
                },
                data: { status: status }
            });

            // 2. Se aceitou, cria a candidatura
            if (status === 'aceito') {
                // Verifica se já existe
                const jaCandidato = await tx.candidaturas.findFirst({
                    where: {
                        vaga_id: parseInt(vagaId),
                        profissional_id: profissionalId
                    }
                });

                if (!jaCandidato) {
                    await tx.candidaturas.create({
                        data: {
                            vaga_id: parseInt(vagaId),
                            profissional_id: profissionalId,
                            status: 'pendente'
                        }
                    });
                }
            }
        });

        res.json({ message: `Proposta ${status} com sucesso!` });

    } catch (err) {
        console.error("Erro responder convite:", err);
        res.status(500).json({ message: "Erro ao processar resposta." });
    }
});


// ==========================================
// GESTÃO DE PERFIL (NOVO)
// ==========================================

// 1. OBTER MEU PERFIL
app.get('/perfil', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.users.findUnique({
            where: { id: req.user.id }
        });

        if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

        // Removemos a senha antes de enviar para o frontend (Segurança!)
        const { password_hash, ...safeUser } = user;
        res.json(safeUser);

    } catch (err) {
        console.error("Erro ver perfil:", err);
        res.status(500).json({ message: "Erro ao buscar perfil" });
    }
});

// 2. ATUALIZAR MEU PERFIL
app.put('/perfil', authenticateToken, async (req, res) => {
    // Adicionamos 'address' e 'state' na desestruturação
    const { name, phone, city, state, address, specialty, experience_years, bio, avatar_url } = req.body;

    try {
        const updatedUser = await prisma.users.update({
            where: { id: req.user.id },
            data: {
                name,
                phone,
                city, 
                state,   // Novo campo
                address, // Novo campo (importante para empresas)
                specialty,
                experience_years: experience_years ? parseInt(experience_years) : null,
                bio,
                avatar_url
            }
        });

        res.json({ message: "Perfil atualizado com sucesso!", user: updatedUser });

    } catch (err) {
        console.error("Erro atualizar perfil:", err);
        res.status(500).json({ message: "Erro ao atualizar perfil" });
    }
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});