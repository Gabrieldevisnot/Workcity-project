const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http'); 
const { Server } = require('socket.io'); 

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÃO DO SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('⚡ Cliente conectado:', socket.id);

    socket.on('join', (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`👤 Usuário ${userId} está online`);
    });

    socket.on('send_message', async (data) => {
        const { senderId, receiverId, content } = data;
        try {
            // Salva a mensagem usando os relacionamentos do schema 'messages'
            const savedMessage = await prisma.messages.create({
                data: {
                    content: content,
                    sender_id: parseInt(senderId),
                    receiver_id: parseInt(receiverId)
                }
            });

            const receiverSocketId = onlineUsers.get(parseInt(receiverId));
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_message', savedMessage);
            }
            socket.emit('message_sent', savedMessage);
        } catch (error) {
            console.error("Erro ao salvar mensagem no socket:", error);
        }
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
    });
});

// Middleware de Log
app.use((req, res, next) => {
    console.log(`📢 ${req.method} ${req.url}`);
    next();
});

// Middleware de Autenticação
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Token não fornecido." });

    jwt.verify(token, 'SEGREDO_WORKCITY', (err, user) => {
        if (err) return res.status(403).json({ message: "Token inválido." });
        req.user = user;
        next();
    });
}

// ================= ROTAS DA API =================

app.get('/ping', async (req, res) => {
    res.json({ status: "ONLINE", message: "Servidor rodando!" });
});

// --- AUTENTICAÇÃO ---
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.users.findUnique({ where: { email: email } });
        if (!user) return res.status(400).json({ message: "Usuário não encontrado" });

        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) return res.status(400).json({ message: "Senha incorreta" });

        const token = jwt.sign({ id: user.id, type: user.user_type }, 'SEGREDO_WORKCITY', { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, name: user.name, type: user.user_type, email: user.email, avatar_url: user.avatar_url } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro no login" });
    }
});

app.post('/auth/register', async (req, res) => {
    const { email, password, userType, telefone, cidade, estado, endereco, razaoSocial, cnpj, nome, cpf, especialidade, experiencia } = req.body;
    try {
        const userExists = await prisma.users.findUnique({ where: { email: email } });
        if (userExists) return res.status(400).json({ message: "Email já cadastrado." });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        const finalName = userType === 'empresa' ? razaoSocial : nome;
        const years = experiencia ? parseInt(String(experiencia).replace(/\D/g, '')) : null;

        const newUser = await prisma.users.create({
            data: {
                email, password_hash: hash, user_type: userType, name: finalName,
                phone: telefone, city: cidade, state: estado, address: endereco,
                cnpj: cnpj || null, cpf: cpf || null,
                specialty: especialidade || null, experience_years: years
            }
        });
        res.json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro no cadastro" });
    }
});

// --- PERFIL ---
app.get('/perfil', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.users.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
        const { password_hash, ...safeUser } = user;
        res.json(safeUser);
    } catch (err) { res.status(500).json({ message: "Erro ao buscar perfil" }); }
});

app.put('/perfil', authenticateToken, async (req, res) => {
    const { name, phone, city, state, address, specialty, experience_years, bio, avatar_url } = req.body;
    try {
        const updatedUser = await prisma.users.update({
            where: { id: req.user.id },
            data: { name, phone, city, state, address, specialty, experience_years: experience_years ? parseInt(experience_years) : null, bio, avatar_url }
        });
        res.json({ message: "Perfil atualizado!", user: updatedUser });
    } catch (err) { res.status(500).json({ message: "Erro ao atualizar" }); }
});

// --- VAGAS ---
app.post('/vagas', authenticateToken, async (req, res) => {
    const { titulo, especialidade, localizacao, descricao, salarioMin, salarioMax, tipoContrato, experienciaMinima, requisitos, beneficios } = req.body;
    try {
        const novaVaga = await prisma.vagas.create({
            data: {
                user_id: req.user.id, titulo, especialidade, localizacao, descricao,
                salario_min: salarioMin ? Number(salarioMin) : null,
                salario_max: salarioMax ? Number(salarioMax) : null,
                tipo_contrato: tipoContrato, experiencia_minima: experienciaMinima,
                requisitos, beneficios, status: 'aberta'
            }
        });
        res.json(novaVaga);
    } catch (err) { console.error(err); res.status(500).json({ message: "Erro ao criar vaga" }); }
});

app.get('/minhas-vagas', authenticateToken, async (req, res) => {
    try {
        const vagas = await prisma.vagas.findMany({
            where: { user_id: req.user.id },
            orderBy: { created_at: 'desc' },
            include: { _count: { select: { candidaturas: true } } }
        });
        const vagasFormatadas = vagas.map(v => ({ ...v, total_candidatos: v._count.candidaturas }));
        res.json(vagasFormatadas);
    } catch (err) { res.status(500).json({ message: "Erro ao buscar vagas" }); }
});

app.get('/vagas/feed', authenticateToken, async (req, res) => {
    const { busca, especialidade, cidade } = req.query;
    try {
        const whereClause = {
            status: 'aberta',
            candidaturas: { none: { profissional_id: req.user.id } }
        };
        if (busca) whereClause.OR = [{ titulo: { contains: busca, mode: 'insensitive' } }, { descricao: { contains: busca, mode: 'insensitive' } }];
        if (especialidade) whereClause.especialidade = { contains: especialidade, mode: 'insensitive' };
        if (cidade) whereClause.localizacao = { contains: cidade, mode: 'insensitive' };

        const vagas = await prisma.vagas.findMany({
            where: whereClause, orderBy: { created_at: 'desc' },
            // ATENÇÃO: No schema, o relacionamento com users na vaga chama 'users' (plural)
            include: { users: { select: { name: true } } }
        });
        const resultado = vagas.map(v => ({ 
            ...v, 
            nome_empresa: v.users?.name || "Confidencial",
            salario_min: v.salario_min ? Number(v.salario_min) : null,
            salario_max: v.salario_max ? Number(v.salario_max) : null
        }));
        res.json(resultado);
    } catch (err) { console.error(err); res.status(200).json([]); }
});

app.get('/vagas/:id', authenticateToken, async (req, res) => {
    try {
        const vaga = await prisma.vagas.findUnique({ where: { id: parseInt(req.params.id) } });
        if (!vaga) return res.status(404).json({ message: "Vaga não encontrada" });
        res.json(vaga);
    } catch (err) { res.status(500).json({ message: "Erro" }); }
});

// --- CANDIDATURAS E CONVITES ---

// 1. Candidatar-se
app.post('/candidaturas', authenticateToken, async (req, res) => {
    try {
        const nova = await prisma.candidaturas.create({
            data: { vaga_id: parseInt(req.body.vagaId), profissional_id: req.user.id, status: 'pendente' }
        });
        res.json({ message: "Sucesso!", candidature: nova });
    } catch (err) {
        if (err.code === 'P2002') return res.status(400).json({ message: "Já candidatado." });
        res.status(500).json({ message: "Erro ao candidatar." });
    }
});

// 2. Minhas Candidaturas (Profissional)
app.get('/minhas-candidaturas', authenticateToken, async (req, res) => {
    try {
        const cands = await prisma.candidaturas.findMany({
            where: { profissional_id: req.user.id },
            orderBy: { data_candidatura: 'desc' },
            include: { 
                vagas: { 
                    include: { 
                        users: { select: { name: true } } // users = Empresa dona da vaga
                    } 
                } 
            }
        });
        const resMap = cands.map(c => ({ 
            ...c, 
            titulo: c.vagas.titulo, 
            localizacao: c.vagas.localizacao, 
            nome_empresa: c.vagas.users?.name || "Empresa"
        }));
        res.json(resMap);
    } catch (err) { 
        console.error("Erro minhas-candidaturas:", err);
        res.status(500).json({ message: "Erro" }); 
    }
});

// 3. Listar Candidatos da Vaga (Empresa)
app.get('/vagas/:id/candidatos', authenticateToken, async (req, res) => {
    try {
        const cands = await prisma.candidaturas.findMany({
            where: { 
                vaga_id: parseInt(req.params.id), 
                vagas: { user_id: req.user.id } // Segurança: Só se for dono da vaga
            },
            include: { users: true } // users = Profissional candidato
        });
        const resMap = cands.map(c => ({
            candidatura_id: c.id, status: c.status, data_candidatura: c.data_candidatura,
            nome_profissional: c.users.name, email: c.users.email, phone: c.users.phone,
            city: c.users.city, especialidade: c.users.specialty, experience_years: c.users.experience_years
        }));
        res.json(resMap);
    } catch (err) { res.status(500).json({ message: "Erro" }); }
});

// 4. Remover Candidatura
app.delete('/candidaturas/:id', authenticateToken, async (req, res) => {
    try {
        const del = await prisma.candidaturas.deleteMany({ where: { id: parseInt(req.params.id), profissional_id: req.user.id } });
        if (del.count === 0) return res.status(404).json({ message: "Não encontrado." });
        res.json({ message: "Removido." });
    } catch (err) { res.status(500).json({ message: "Erro" }); }
});

// 5. Atualizar Status (Empresa)
app.patch('/candidaturas/:id/status', authenticateToken, async (req, res) => {
    try {
        await prisma.candidaturas.update({ where: { id: parseInt(req.params.id) }, data: { status: req.body.status } });
        res.json({ message: "Status atualizado" });
    } catch (err) { res.status(500).json({ message: "Erro" }); }
});

// 6. Buscar Profissionais (Empresa)
app.get('/profissionais', authenticateToken, async (req, res) => {
    const { busca, especialidade, cidade } = req.query;
    try {
        const filtro = { user_type: 'profissional' };
        if (busca) filtro.name = { contains: busca, mode: 'insensitive' };
        if (especialidade) filtro.specialty = { contains: especialidade, mode: 'insensitive' };
        if (cidade) filtro.city = { contains: cidade, mode: 'insensitive' };
        
        const profs = await prisma.users.findMany({
            where: filtro, orderBy: { created_at: 'desc' },
            select: { id: true, name: true, city: true, specialty: true, experience_years: true, email: true, phone: true }
        });
        res.json(profs);
    } catch (err) { res.status(500).json({ message: "Erro" }); }
});

// 7. Enviar Convite (Empresa)
app.post('/convites', authenticateToken, async (req, res) => {
    try {
        await prisma.convites.create({
            data: { 
                empresa_id: req.user.id, 
                profissional_id: parseInt(req.body.profissionalId), 
                vaga_id: parseInt(req.body.vagaId), 
                mensagem: req.body.mensagem, 
                status: 'enviado' 
            }
        });
        res.json({ message: "Enviado!" });
    } catch (err) { 
        if (err.code === 'P2002') return res.status(400).json({ message: "Já convidado." });
        res.status(500).json({ message: "Erro" }); 
    }
});

// 8. Minhas Propostas (Profissional)
app.get('/minhas-propostas', authenticateToken, async (req, res) => {
    try {
        const props = await prisma.convites.findMany({
            where: { profissional_id: req.user.id }, 
            orderBy: { created_at: 'desc' },
            // CORREÇÃO AQUI: Usando o nome da relação definida no schema ('empresa')
            include: { 
                empresa: { select: { name: true } }, 
                vagas: { select: { id: true, titulo: true, localizacao: true } } 
            }
        });
        const resMap = props.map(p => ({
            id: p.id, mensagem: p.mensagem, status: p.status, created_at: p.created_at,
            nome_empresa: p.empresa.name, // Acessa via .empresa
            titulo_vaga: p.vagas.titulo, vaga_id: p.vagas.id
        }));
        res.json(resMap);
    } catch (err) { 
        console.error("Erro propostas:", err);
        res.status(500).json({ message: "Erro" }); 
    }
});

// 9. Responder Proposta (Profissional)
app.post('/convites/:id/responder', authenticateToken, async (req, res) => {
    const { status, vagaId } = req.body;
    try {
        await prisma.$transaction(async (tx) => {
            await tx.convites.updateMany({ where: { id: parseInt(req.params.id), profissional_id: req.user.id }, data: { status } });
            if (status === 'aceito') {
                const jaExiste = await tx.candidaturas.findFirst({ where: { vaga_id: parseInt(vagaId), profissional_id: req.user.id } });
                if (!jaExiste) await tx.candidaturas.create({ data: { vaga_id: parseInt(vagaId), profissional_id: req.user.id, status: 'pendente' } });
            }
        });
        res.json({ message: "Respondido!" });
    } catch (err) { res.status(500).json({ message: "Erro" }); }
});

// --- CHAT ---

// Histórico de Mensagens
app.get('/chat/history/:contactId', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const contactId = parseInt(req.params.contactId);

    try {
        const messages = await prisma.messages.findMany({
            where: {
                OR: [
                    { sender_id: userId, receiver_id: contactId },
                    { sender_id: contactId, receiver_id: userId }
                ]
            },
            orderBy: { created_at: 'asc' }
        });
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
});

// ROTA: LISTAR CONTATOS DO CHAT (CORRIGIDA PARA O SCHEMA NOVO)
app.get('/chat/contacts', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const userType = req.user.type;

    try {
        let whereClause = {};

        if (userType === 'empresa') {
            // Contatos para a Empresa: Profissionais que se candidataram ou receberam convite
            whereClause = {
                user_type: 'profissional',
                OR: [
                    {
                        candidaturas: {
                            some: {
                                vagas: { user_id: userId } // Candidatos nas minhas vagas
                            }
                        }
                    },
                    {
                        convites_recebidos: { // Profissional recebeu convite
                            some: { empresa_id: userId } // De mim
                        }
                    }
                ]
            };
        } else {
            // Contatos para o Profissional: Empresas onde me candidatei ou recebi convite
            whereClause = {
                user_type: 'empresa',
                OR: [
                    {
                        vagas: {
                            some: {
                                candidaturas: {
                                    some: { profissional_id: userId } // Minhas candidaturas
                                }
                            }
                        }
                    },
                    {
                        convites_enviados: { // Empresa enviou convite
                            some: { profissional_id: userId } // Para mim
                        }
                    }
                ]
            };
        }

        const contatos = await prisma.users.findMany({
            where: whereClause,
            select: { id: true, name: true, avatar_url: true },
            distinct: ['id'],
            orderBy: { name: 'asc' }
        });

        res.json(contatos);

    } catch (err) {
        console.error("Erro contatos:", err);
        res.status(500).json([]);
    }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} 🚀`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`\n❌ ERRO: Porta ${PORT} em uso.`);
    }
});