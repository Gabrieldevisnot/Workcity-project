# 📘 Instruções Técnicas - WorkCity

## Conversão TypeScript → JavaScript Puro

### Remoções Realizadas

✅ **Tipagens removidas:**
```typescript
// ANTES (TypeScript)
function createVaga(vagaData: VagaData): Vaga { }
const user: UserType = 'empresa';
interface VagaData { titulo: string; }

// DEPOIS (JavaScript)
function createVaga(vagaData) { }
const user = 'empresa';
// Sem interfaces - usa objetos JavaScript nativos
```

✅ **Classes convertidas:**
```typescript
// ANTES (TypeScript)
class Vaga {
    constructor(public titulo: string) {}
}

// DEPOIS (JavaScript)
const vaga = {
    titulo: 'Pedreiro',
    id: generateId()
};
```

✅ **Enums convertidos:**
```typescript
// ANTES (TypeScript)
enum Status {
    ATIVA = 'ativa',
    PAUSADA = 'pausada'
}

// DEPOIS (JavaScript)
const Status = {
    ATIVA: 'ativa',
    PAUSADA: 'pausada'
};
```

## Estrutura de Dados (JavaScript Objects)

### Vaga
```javascript
{
    id: "1234567890abc",
    titulo: "Pedreiro para Obra Residencial",
    especialidade: "pedreiro",
    descricao: "...",
    localizacao: "São Paulo, SP",
    salarioMin: "2000",
    salarioMax: "3500",
    tipoContrato: "temporario",
    experienciaMinima: "3 anos",
    requisitos: "...",
    beneficios: "...",
    dataPublicacao: "2024-01-20T10:30:00.000Z",
    status: "ativa", // 'ativa' | 'pausada' | 'fechada'
    candidatos: []
}
```

### Profissional
```javascript
{
    id: "1",
    nome: "João Silva",
    especialidade: "Pedreiro",
    experiencia: "8 anos",
    rating: 4.8,
    totalAvaliacoes: 65,
    projetos: 156,
    localizacao: "São Paulo, SP",
    valorHora: 45,
    disponibilidade: "Imediato",
    certificacoes: ["NR-18"],
    telefone: "(11) 99999-1111",
    email: "joao.silva@email.com"
}
```

### Avaliação
```javascript
{
    id: "eval123",
    profissionalId: "1",
    vagaId: "vaga456",
    empresaId: "empresa789",
    rating: 5, // 1-5
    comentario: "Excelente profissional, pontual e dedicado...",
    data: "2024-01-20T15:30:00.000Z",
    profissionalNome: "João Silva",
    vagaTitulo: "Pedreiro para Obra"
}
```

### Candidato
```javascript
{
    id: "cand123",
    nome: "João Silva",
    especialidade: "Pedreiro",
    experiencia: "8 anos",
    avaliacao: 4.8,
    totalAvaliacoes: 65,
    projetos: 156,
    telefone: "(11) 99999-1111",
    email: "joao.silva@email.com",
    localizacao: "São Paulo, SP",
    distancia: "2.3 km",
    valorHora: 45,
    disponibilidade: "Imediato",
    mensagem: "Tenho experiência...",
    dataCandidatura: "2024-01-16T10:00:00.000Z",
    status: "pendente" // 'pendente' | 'visualizado' | 'aceito' | 'recusado' | 'contratado' | 'contrato-finalizado'
}
```

## Arquitetura de Scripts

### scripts/auth.js

**Responsabilidades:**
- Gerenciamento de autenticação (login/logout)
- Controle de sessão via localStorage
- Proteção de rotas
- Atualização de UI baseada no usuário logado

**Funções principais:**
```javascript
isUserLoggedIn()              // Verifica se há usuário logado
getUserType()                 // Retorna 'empresa' | 'profissional' | null
getUserData()                 // Retorna dados do usuário
loginUser(type, data)         // Faz login e redireciona
logoutUser()                  // Logout e limpa sessão
registerUser(type, data)      // Registra novo usuário
requireAuth(allowedType)      // Protege páginas
updateHeaderForLoggedUser()   // Atualiza header com dados do usuário
```

### scripts/main.js

**Responsabilidades:**
- Funções utilitárias globais
- Notificações toast
- Formatação de dados
- Validações
- Modais genéricos

**Funções principais:**
```javascript
showToast(message, type)      // Exibe notificação
formatDate(dateString)        // Formata data para pt-BR
formatCurrency(value)         // Formata moeda
validateEmail(email)          // Valida email
validatePhone(phone)          // Valida telefone
generateId()                  // Gera ID único
debounce(func, wait)          // Debounce para inputs
```

### scripts/vagas.js

**Responsabilidades:**
- CRUD de vagas
- Sistema de avaliações
- Gerenciamento de profissionais
- Filtros e ordenações
- Cálculo de médias

**Funções principais:**

**Vagas:**
```javascript
getVagas()                    // Obtém todas as vagas
criarVaga(vagaData)           // Cria nova vaga
atualizarVaga(id, data)       // Atualiza vaga
deletarVaga(id)               // Remove vaga
getVagaById(id)               // Busca vaga por ID
adicionarCandidato(vagaId, candidatoData)  // Adiciona candidato
atualizarStatusCandidato(vagaId, candidatoId, status)  // Atualiza status
```

**Avaliações:**
```javascript
getAvaliacoes()                              // Todas avaliações
criarAvaliacao(avaliacaoData)                // Nova avaliação
calcularMediaAvaliacoes(profissionalId)      // Calcula média
atualizarRatingProfissional(profissionalId)  // Atualiza rating
getAvaliacoesProfissional(profissionalId)    // Avaliações de um profissional
```

**Profissionais:**
```javascript
getProfissionais()                     // Todos profissionais
getProfissionalById(id)                // Busca por ID
filtrarProfissionais(filtros)          // Filtra e ordena
isAltamenteQualificado(rating)         // Verifica se rating >= 4.5
```

## Sistema de Armazenamento (LocalStorage)

### Estrutura de Chaves

```javascript
const StorageKeys = {
    USER_TYPE: 'workcity_user_type',
    USER_DATA: 'workcity_user_data',
    VAGAS: 'workcity_vagas',
    AVALIACOES: 'workcity_avaliacoes',
    PROFISSIONAIS: 'workcity_profissionais'
};
```

### Funções de Storage

```javascript
// Salvar dados
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Carregar dados
function loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}
```

### Exemplo de Uso

```javascript
// Salvar vaga
const vagas = getVagas();
vagas.push(novaVaga);
saveToStorage(StorageKeys.VAGAS, vagas);

// Carregar vagas
const vagas = loadFromStorage(StorageKeys.VAGAS) || [];
```

## Sistema de Avaliação - Detalhes Técnicos

### Fluxo Completo

1. **Candidato é aceito** → Status: `aceito`
2. **Empresa contrata** → Status: `contratado`
3. **Contrato finalizado** → Status: `contrato-finalizado`
4. **Botão "Avaliar" aparece**
5. **Modal de avaliação é aberto**
6. **Validações:**
   - Rating: 1-5 estrelas (obrigatório)
   - Comentário: >= 50 caracteres (obrigatório)
7. **Avaliação salva em localStorage**
8. **Rating do profissional atualizado automaticamente**

### Cálculo da Média

```javascript
function calcularMediaAvaliacoes(profissionalId) {
    const avaliacoes = getAvaliacoes();
    const avaliacoesProfissional = avaliacoes.filter(
        a => a.profissionalId === profissionalId
    );
    
    if (avaliacoesProfissional.length === 0) return 0;
    
    const somaRatings = avaliacoesProfissional.reduce(
        (sum, avaliacao) => sum + avaliacao.rating, 
        0
    );
    
    const media = somaRatings / avaliacoesProfissional.length;
    
    // Arredondar para 1 casa decimal
    return Math.round(media * 10) / 10;
}
```

### Interface do Modal de Avaliação

**HTML:**
```html
<div id="modalAvaliacao" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
    <!-- Conteúdo do modal -->
</div>
```

**JavaScript:**
```javascript
// Abrir modal
function abrirModalAvaliacao(profissional, vaga) {
    avaliacaoProfissional = profissional;
    avaliacaoVaga = vaga;
    document.getElementById('modalAvaliacao').classList.remove('hidden');
}

// Enviar avaliação
function enviarAvaliacao() {
    const avaliacao = {
        profissionalId: avaliacaoProfissional.id,
        vagaId: avaliacaoVaga.id,
        rating: currentRating,
        comentario: document.getElementById('comentarioAvaliacao').value.trim()
    };
    
    criarAvaliacao(avaliacao);
    showToast('Avaliação enviada com sucesso!');
    fecharModalAvaliacao();
}
```

## Sistema de Filtros e Ordenação

### Filtros de Profissionais

```javascript
function filtrarProfissionais(filtros = {}) {
    let profissionais = getProfissionais();
    
    // Filtro de busca
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
            // ... outros casos
        }
    }
    
    return profissionais;
}
```

### Uso em UI

```javascript
// Event listeners
document.getElementById('searchInput').addEventListener('input', 
    debounce(renderProfissionais, 300)
);

document.getElementById('especialidadeFilter').addEventListener('change', 
    renderProfissionais
);

document.getElementById('sortFilter').addEventListener('change', 
    renderProfissionais
);
```

## Validações Implementadas

### Login
```javascript
if (!validateEmail(email)) {
    showToast('E-mail inválido', 'error');
    return;
}

if (password.length < 6) {
    showToast('Senha deve ter no mínimo 6 caracteres', 'error');
    return;
}
```

### Cadastro
```javascript
if (password !== confirmPassword) {
    showToast('As senhas não coincidem', 'error');
    return;
}
```

### Avaliação
```javascript
// Rating obrigatório
if (currentRating === 0) {
    document.getElementById('ratingError').classList.remove('hidden');
    hasError = true;
}

// Comentário mínimo 50 caracteres
if (comentario.length < 50) {
    document.getElementById('comentarioError').classList.remove('hidden');
    hasError = true;
}
```

## Navegação entre Páginas

### Funções de Navegação

```javascript
function navigateTo(url) {
    window.location.href = url;
}

function navigateToHome() {
    window.location.href = 'index.html';
}
```

### Proteção de Rotas

```javascript
function requireAuth(allowedUserType = null) {
    if (!isUserLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }
    
    if (allowedUserType && getUserType() !== allowedUserType) {
        if (getUserType() === 'empresa') {
            window.location.href = 'empresa-dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return false;
    }
    
    return true;
}
```

### Uso em Páginas

```javascript
// No início de páginas protegidas
requireAuth('empresa');  // Apenas empresas
requireAuth('profissional');  // Apenas profissionais
requireAuth();  // Qualquer usuário logado
```

## Classes Tailwind CSS Principais

### Layout
```
flex, grid, flex-col, items-center, justify-between
gap-4, space-x-3, space-y-6
max-w-7xl, mx-auto, px-4, py-8
```

### Componentes
```
bg-white, rounded-lg, shadow-md, border, border-gray-200
p-4, p-6, mb-4, mt-6
text-gray-900, text-gray-600, text-sm
```

### Interatividade
```
hover:bg-orange-600, transition, cursor-pointer
focus:ring-2, focus:ring-orange-500
```

### Responsividade
```
md:grid-cols-3, lg:flex-row
hidden, md:flex, sm:inline-flex
```

### Estados
```
bg-green-100, text-green-800  // Sucesso
bg-red-100, text-red-800      // Erro
bg-yellow-100, text-yellow-800 // Aviso
bg-orange-500, hover:bg-orange-600  // Primário
```

## Debugging e Console

### Logs Implementados

```javascript
console.log('✅ EmpresaDashboard carregado com sucesso');
console.log('Avaliação enviada:', avaliacao);
console.log('WorkCity Application Initialized');
```

### Como Debugar

1. **Abrir DevTools:** F12 ou Ctrl+Shift+I
2. **Console:** Ver logs e erros
3. **Application → Local Storage:** Ver dados armazenados
4. **Network:** Ver requisições (se houver backend)

### Limpar Dados de Teste

```javascript
// No console do navegador
localStorage.clear();
location.reload();
```

## Performance

### Debounce em Buscas

```javascript
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Uso
document.getElementById('searchInput').addEventListener('input', 
    debounce(renderProfissionais, 300)
);
```

### Renderização Eficiente

- Use `innerHTML` para listas grandes
- Evite manipulação excessiva do DOM
- Cache seletores frequentemente usados

## Segurança

### XSS Prevention

```javascript
function sanitizeString(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
```

### Validação de Dados

- Sempre valide inputs do usuário
- Não confie em dados do localStorage
- Sanitize antes de renderizar

## Testes Manuais

### Checklist de Testes

- [ ] Login empresa funciona
- [ ] Login profissional funciona
- [ ] Cadastro empresa funciona
- [ ] Cadastro profissional funciona
- [ ] Criar vaga funciona
- [ ] Listar vagas funciona
- [ ] Buscar profissionais funciona
- [ ] Filtros funcionam
- [ ] Ordenação funciona
- [ ] Sistema de status de candidatos funciona
- [ ] Modal de avaliação abre
- [ ] Validação de estrelas funciona
- [ ] Validação de comentário funciona
- [ ] Avaliação salva corretamente
- [ ] Média é calculada corretamente
- [ ] Badge "Altamente Qualificado" aparece (rating >= 4.5)
- [ ] Logout funciona
- [ ] Proteção de rotas funciona

## Troubleshooting

### Problema: Dados não salvam
**Solução:** Certifique-se de que está usando HTTP/HTTPS, não file://

### Problema: Estilos não carregam
**Solução:** Verifique conexão com internet (Tailwind CDN)

### Problema: Modal não abre
**Solução:** Verifique se `modal-avaliacao.html` foi carregado corretamente

### Problema: Ordenação não funciona
**Solução:** Verifique se `vagas.js` está sendo carregado antes do script da página

---

**📝 Documentação técnica completa para manutenção e evolução do sistema.**
