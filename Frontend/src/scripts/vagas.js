// vagas.js - Lógica de Múltiplas Vagas e Sistema de Avaliações
const API_URL = 'http://localhost:3000';
// Obter todas as vagas
function getVagas() {
    return loadFromStorage(StorageKeys.VAGAS) || [];
}

// Salvar vagas
function saveVagas(vagas) {
    saveToStorage(StorageKeys.VAGAS, vagas);
}

// Criar nova vaga
/* function criarVaga(vagaData) {
//     const vagas = getVagas();
//     const novaVaga = {
//         id: generateId(),
//         ...vagaData,
//         dataPublicacao: new Date().toISOString(),
//         status: 'ativa',
//         candidatos: []
     };
    
//     vagas.push(novaVaga);
//     saveVagas(vagas);
    
//     return novaVaga;
// }*/
async function criarVaga(vagaData) {
    // 1. Recuperar o Token que salvamos no Login
    // Nota: No passo anterior salvamos como 'token' (string pura)
    // Se você salvou dentro de um JSON, ajuste aqui.
    const token = localStorage.getItem('token'); 
    
    if (!token) {
        alert('Você precisa estar logado!');
        window.location.href = 'login-empresa.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/vagas`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // <--- O SEGREDO ESTÁ AQUI
            },
            body: JSON.stringify(vagaData)
        });

        if (!response.ok) {
            throw new Error('Erro ao salvar vaga');
        }
        
        // Se chegou aqui, deu tudo certo!
        // O alert de sucesso já está no seu HTML, então não preciso por aqui.

    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar vaga. Verifique o console.');
    }
}
// Atualizar vaga existente
function atualizarVaga(vagaId, vagaData) {
    const vagas = getVagas();
    const index = vagas.findIndex(v => v.id === vagaId);
    
    if (index !== -1) {
        vagas[index] = {
            ...vagas[index],
            ...vagaData
        };
        saveVagas(vagas);
        return vagas[index];
    }
    
    return null;
}

// Deletar vaga
function deletarVaga(vagaId) {
    const vagas = getVagas();
    const filtered = vagas.filter(v => v.id !== vagaId);
    saveVagas(filtered);
}

// Obter vaga por ID
function getVagaById(vagaId) {
    const vagas = getVagas();
    return vagas.find(v => v.id === vagaId);
}

// Adicionar candidato a uma vaga
function adicionarCandidato(vagaId, candidatoData) {
    const vagas = getVagas();
    const vaga = vagas.find(v => v.id === vagaId);
    
    if (vaga) {
        if (!vaga.candidatos) {
            vaga.candidatos = [];
        }
        
        const novoCandidato = {
            id: generateId(),
            ...candidatoData,
            dataCandidatura: new Date().toISOString(),
            status: 'pendente'
        };
        
        vaga.candidatos.push(novoCandidato);
        saveVagas(vagas);
        return novoCandidato;
    }
    
    return null;
}

// Atualizar status do candidato
function atualizarStatusCandidato(vagaId, candidatoId, novoStatus) {
    const vagas = getVagas();
    const vaga = vagas.find(v => v.id === vagaId);
    
    if (vaga && vaga.candidatos) {
        const candidato = vaga.candidatos.find(c => c.id === candidatoId);
        if (candidato) {
            candidato.status = novoStatus;
            saveVagas(vagas);
            return candidato;
        }
    }
    
    return null;
}

// Sistema de Avaliações

// Obter todas as avaliações
function getAvaliacoes() {
    return loadFromStorage(StorageKeys.AVALIACOES) || [];
}

// Salvar avaliações
function saveAvaliacoes(avaliacoes) {
    saveToStorage(StorageKeys.AVALIACOES, avaliacoes);
}

// Criar nova avaliação
function criarAvaliacao(avaliacaoData) {
    const avaliacoes = getAvaliacoes();
    
    const novaAvaliacao = {
        id: generateId(),
        ...avaliacaoData,
        data: new Date().toISOString()
    };
    
    avaliacoes.push(novaAvaliacao);
    saveAvaliacoes(avaliacoes);
    
    // Atualizar rating do profissional
    atualizarRatingProfissional(avaliacaoData.profissionalId);
    
    return novaAvaliacao;
}

// Calcular média de avaliações de um profissional
function calcularMediaAvaliacoes(profissionalId) {
    const avaliacoes = getAvaliacoes();
    const avaliacoesProfissional = avaliacoes.filter(a => a.profissionalId === profissionalId);
    
    if (avaliacoesProfissional.length === 0) {
        return 0;
    }
    
    const somaRatings = avaliacoesProfissional.reduce((sum, avaliacao) => sum + avaliacao.rating, 0);
    const media = somaRatings / avaliacoesProfissional.length;
    
    // Arredondar para uma casa decimal
    return Math.round(media * 10) / 10;
}

// Atualizar rating do profissional
function atualizarRatingProfissional(profissionalId) {
    const profissionais = getProfissionais();
    const profissional = profissionais.find(p => p.id === profissionalId);
    
    if (profissional) {
        profissional.rating = calcularMediaAvaliacoes(profissionalId);
        profissional.totalAvaliacoes = getAvaliacoes().filter(a => a.profissionalId === profissionalId).length;
        saveProfissionais(profissionais);
    }
}

// Obter avaliações de um profissional
function getAvaliacoesProfissional(profissionalId) {
    const avaliacoes = getAvaliacoes();
    return avaliacoes.filter(a => a.profissionalId === profissionalId);
}

// Gerenciamento de Profissionais

// Obter todos os profissionais
function getProfissionais() {
    const stored = loadFromStorage(StorageKeys.PROFISSIONAIS);
    if (stored) return stored;
    
    // Mock data inicial
    return [
        {
            id: '1',
            nome: 'Carlos Oliveira',
            especialidade: 'Pedreiro',
            experiencia: '12 anos',
            rating: 4.9,
            totalAvaliacoes: 87,
            projetos: 203,
            localizacao: 'São Paulo, SP',
            valorHora: 50,
            disponibilidade: 'Imediato',
            certificacoes: ['NR-35', 'NR-18'],
            telefone: '(11) 99999-2222',
            email: 'carlos.oliveira@email.com'
        },
        {
            id: '2',
            nome: 'João Silva',
            especialidade: 'Pedreiro',
            experiencia: '8 anos',
            rating: 4.8,
            totalAvaliacoes: 65,
            projetos: 156,
            localizacao: 'São Paulo, SP',
            valorHora: 45,
            disponibilidade: 'Imediato',
            certificacoes: ['NR-18'],
            telefone: '(11) 99999-1111',
            email: 'joao.silva@email.com'
        },
        {
            id: '3',
            nome: 'Pedro Santos',
            especialidade: 'Pedreiro',
            experiencia: '5 anos',
            rating: 4.6,
            totalAvaliacoes: 42,
            projetos: 87,
            localizacao: 'Guarulhos, SP',
            valorHora: 40,
            disponibilidade: 'Próxima semana',
            certificacoes: [],
            telefone: '(11) 99999-3333',
            email: 'pedro.santos@email.com'
        },
        {
            id: '4',
            nome: 'Roberto Alves',
            especialidade: 'Eletricista',
            experiencia: '15 anos',
            rating: 5.0,
            totalAvaliacoes: 120,
            projetos: 280,
            localizacao: 'São Paulo, SP',
            valorHora: 65,
            disponibilidade: 'Em 15 dias',
            certificacoes: ['NR-10', 'NR-35', 'NR-18'],
            telefone: '(11) 99999-4444',
            email: 'roberto.alves@email.com'
        },
        {
            id: '5',
            nome: 'Fernando Costa',
            especialidade: 'Eletricista',
            experiencia: '6 anos',
            rating: 4.7,
            totalAvaliacoes: 53,
            projetos: 128,
            localizacao: 'Osasco, SP',
            valorHora: 48,
            disponibilidade: 'Imediato',
            certificacoes: ['NR-10'],
            telefone: '(11) 98888-5555',
            email: 'fernando.costa@email.com'
        },
        {
            id: '6',
            nome: 'Marcos Lima',
            especialidade: 'Pintor',
            experiencia: '10 anos',
            rating: 4.5,
            totalAvaliacoes: 78,
            projetos: 195,
            localizacao: 'São Paulo, SP',
            valorHora: 42,
            disponibilidade: 'Imediato',
            certificacoes: ['NR-35'],
            telefone: '(11) 97777-6666',
            email: 'marcos.lima@email.com'
        },
        {
            id: '7',
            nome: 'André Souza',
            especialidade: 'Encanador',
            experiencia: '7 anos',
            rating: 4.3,
            totalAvaliacoes: 35,
            projetos: 92,
            localizacao: 'São Bernardo, SP',
            valorHora: 50,
            disponibilidade: 'Próxima semana',
            certificacoes: [],
            telefone: '(11) 96666-7777',
            email: 'andre.souza@email.com'
        }
    ];
}

// Salvar profissionais
function saveProfissionais(profissionais) {
    saveToStorage(StorageKeys.PROFISSIONAIS, profissionais);
}

// Obter profissional por ID
function getProfissionalById(profissionalId) {
    const profissionais = getProfissionais();
    return profissionais.find(p => p.id === profissionalId);
}

// Filtrar e ordenar profissionais
function filtrarProfissionais(filtros = {}) {
    let profissionais = getProfissionais();
    
    // Filtro de busca por nome
    if (filtros.busca) {
        const buscaLower = filtros.busca.toLowerCase();
        profissionais = profissionais.filter(p => 
            p.nome.toLowerCase().includes(buscaLower) ||
            p.especialidade.toLowerCase().includes(buscaLower)
        );
    }
    
    // Filtro de especialidade
    if (filtros.especialidade && filtros.especialidade !== 'todas') {
        profissionais = profissionais.filter(p => 
            p.especialidade.toLowerCase() === filtros.especialidade.toLowerCase()
        );
    }
    
    // Ordenação
    if (filtros.ordenacao) {
        switch (filtros.ordenacao) {
            case 'rating-desc':
                profissionais.sort((a, b) => b.rating - a.rating);
                break;
            case 'rating-asc':
                profissionais.sort((a, b) => a.rating - b.rating);
                break;
            case 'experiencia-desc':
                profissionais.sort((a, b) => parseInt(b.experiencia) - parseInt(a.experiencia));
                break;
            case 'projetos-desc':
                profissionais.sort((a, b) => b.projetos - a.projetos);
                break;
            case 'valor-asc':
                profissionais.sort((a, b) => a.valorHora - b.valorHora);
                break;
            case 'valor-desc':
                profissionais.sort((a, b) => b.valorHora - a.valorHora);
                break;
        }
    }
    
    return profissionais;
}

// Verificar se profissional é altamente qualificado
function isAltamenteQualificado(rating) {
    return rating >= 4.5;
}

// Inicializar profissionais mock se não existir
function initProfissionais() {
    if (!loadFromStorage(StorageKeys.PROFISSIONAIS)) {
        saveProfissionais(getProfissionais());
    }
}

// Executar inicialização
initProfissionais();
