# 🚀 Guia Rápido - WorkCity

## Início Rápido (5 minutos)

### 1. Abrir a Aplicação

**Opção Mais Fácil:**
1. Abra o arquivo `index.html` diretamente no navegador
2. Pronto! A aplicação está rodando

**Opção Recomendada (VS Code):**
1. Instale a extensão "Live Server" no VS Code
2. Abra a pasta do projeto
3. Clique direito em `index.html` → "Open with Live Server"
4. Acesse `http://localhost:5500`

### 2. Testar como Empresa

1. Clique em "Sou uma Empresa"
2. Use as credenciais de teste:
   - Email: `empresa@test.com`
   - Senha: `123456`
3. Você será redirecionado para o Dashboard da Empresa

### 3. Criar sua Primeira Vaga

1. No dashboard, clique em "Criar Nova Vaga"
2. Preencha os campos:
   - Título: "Pedreiro Urgente"
   - Especialidade: Pedreiro
   - Localização: São Paulo, SP
   - Descrição: "Buscamos pedreiro com experiência"
3. Clique em "Publicar Vaga"
4. A vaga aparecerá na lista!

### 4. Buscar Profissionais

1. No dashboard, clique na aba "Buscar Profissionais"
2. Veja 7 profissionais pré-cadastrados
3. Observe:
   - ⭐ Ratings de 4.3 a 5.0
   - 🏆 Badge "Altamente Qualificado" para ratings ≥ 4.5
4. Use os filtros:
   - Buscar por nome
   - Filtrar por especialidade
   - Ordenar por "Maior Avaliação"

### 5. Gerenciar Candidatos

1. Clique em qualquer vaga criada
2. Você verá candidatos mockados
3. Use os filtros de status:
   - Todos
   - Pendentes
   - Visualizados
   - Aceitos
   - Recusados
   - Contratados
4. Ordene por:
   - ⭐ Maior Avaliação (recomendado!)
   - 📅 Mais Recente
5. Teste o fluxo completo:
   - **Aceitar** um candidato pendente
   - **Contratar** um candidato aceito
   - **Finalizar Contrato**
   - **Avaliar** o profissional

### 6. Avaliar um Profissional

1. Após finalizar contrato, clique em "Avaliar"
2. No modal que abrir:
   - Clique nas estrelas (1-5)
   - Escreva um comentário (mínimo 50 caracteres)
   - Exemplo: "Profissional excelente, pontual e dedicado. Entregou o trabalho com qualidade superior ao esperado."
3. Clique em "Enviar Avaliação"
4. ✅ Avaliação salva!
5. O rating do profissional é atualizado automaticamente

### 7. Testar como Profissional

1. Faça logout (botão "Sair")
2. Na página inicial, clique em "Sou um Profissional"
3. Use as credenciais:
   - Email: `profissional@test.com`
   - Senha: `123456`
4. Explore o Dashboard do Profissional:
   - Buscar Vagas
   - Minhas Candidaturas
   - Meu Perfil (com rating 4.8⭐)

## 📊 Dados de Demonstração

### Profissionais Pré-cadastrados

| Nome | Especialidade | Rating | Avaliações | Destaque |
|------|---------------|--------|------------|----------|
| Roberto Alves | Eletricista | 5.0⭐ | 120 | 🏆 Altamente Qualificado |
| Carlos Oliveira | Pedreiro | 4.9⭐ | 87 | 🏆 Altamente Qualificado |
| João Silva | Pedreiro | 4.8⭐ | 65 | 🏆 Altamente Qualificado |
| Fernando Costa | Eletricista | 4.7⭐ | 53 | 🏆 Altamente Qualificado |
| Pedro Santos | Pedreiro | 4.6⭐ | 42 | 🏆 Altamente Qualificado |
| Marcos Lima | Pintor | 4.5⭐ | 78 | 🏆 Altamente Qualificado |
| André Souza | Encanador | 4.3⭐ | 35 | - |

### Candidatos Mockados

Na página "Gerenciar Candidatos", você encontrará 4-5 candidatos de exemplo com diferentes status para testar o fluxo completo.

## 🎯 Principais Funcionalidades para Testar

### ✅ Sistema de Avaliação (ESTRELA DO PROJETO!)

**Como testar:**
1. Gerenciar Candidatos → Aceitar → Contratar → Finalizar
2. Botão "Avaliar" aparece
3. Preencha:
   - 5 estrelas
   - Comentário: "Excelente profissional, muito dedicado e pontual. Trabalho impecável com atenção aos detalhes."
4. Enviar
5. ✅ Avaliação salva no localStorage!

**Validações testadas:**
- ❌ Tentar enviar sem estrelas → Erro
- ❌ Comentário com menos de 50 caracteres → Erro
- ✅ Contador de caracteres em tempo real
- ✅ Preview da nota selecionada

### 🔍 Filtros e Ordenação

**Buscar Profissionais:**
```
1. Digite "Carlos" na busca → Filtra
2. Selecione "Pedreiro" na especialidade → Filtra
3. Ordene por "Maior Avaliação" → Ordena
```

**Resultado esperado:**
- Profissionais com rating ≥ 4.5 têm badge dourado 🏆
- Lista ordenada corretamente
- Filtros funcionando simultaneamente

### 📝 CRUD de Vagas

**Criar Vaga:**
```
Dashboard → Criar Nova Vaga → Preencher → Publicar
```

**Ver Vagas:**
```
Dashboard → Aba "Minhas Vagas"
```

**Estatísticas Atualizadas:**
- Total de vagas
- Vagas ativas
- Total de candidatos

### 🔐 Autenticação e Proteção

**Testar proteção de rotas:**
1. Faça logout
2. Tente acessar `empresa-dashboard.html` diretamente
3. ✅ Você será redirecionado para `index.html`

**Testar tipos de usuário:**
1. Faça login como profissional
2. Tente acessar `empresa-dashboard.html`
3. ✅ Você será redirecionado para `dashboard.html`

## 💡 Dicas e Truques

### Ver Dados Salvos

1. Abra DevTools (F12)
2. Vá em **Application** → **Local Storage**
3. Veja as chaves:
   - `workcity_user_type`
   - `workcity_vagas`
   - `workcity_avaliacoes`
   - etc.

### Limpar Dados e Recomeçar

**No console do navegador (F12):**
```javascript
localStorage.clear();
location.reload();
```

### Ver Avaliações Salvas

**No console:**
```javascript
JSON.parse(localStorage.getItem('workcity_avaliacoes'))
```

### Ver Rating Atualizado

**No console:**
```javascript
JSON.parse(localStorage.getItem('workcity_profissionais'))
```

## 🎨 Personalização Rápida

### Mudar Cor Principal

Em **todos os arquivos HTML**, substitua:
```
bg-orange-500  →  bg-blue-500
text-orange-500 → text-blue-500
border-orange-500 → border-blue-500
```

### Adicionar Novo Profissional Mock

Em `scripts/vagas.js`, adicione no array `getProfissionais()`:
```javascript
{
    id: '8',
    nome: 'Seu Nome',
    especialidade: 'Carpinteiro',
    experiencia: '10 anos',
    rating: 4.7,
    totalAvaliacoes: 50,
    projetos: 120,
    localizacao: 'São Paulo, SP',
    valorHora: 55,
    disponibilidade: 'Imediato',
    certificacoes: ['NR-35'],
    telefone: '(11) 98888-9999',
    email: 'seuemail@email.com'
}
```

## 🐛 Problemas Comuns

### 1. "Página em branco"
**Solução:** 
- Verifique console (F12) para erros
- Certifique-se de que está usando HTTP (não file://)
- Use Live Server ou localhost

### 2. "Estilos não carregam"
**Solução:**
- Verifique conexão com internet (Tailwind CDN)
- Recarregue a página (Ctrl+R)

### 3. "Logout não funciona"
**Solução:**
- Verifique console para erros
- Limpe cache: Ctrl+Shift+Delete

### 4. "Modal não abre"
**Solução:**
- Verifique se está em `gerenciar-candidatos.html`
- Finalize um contrato primeiro
- Verifique console para erros

## 📱 Testar Responsividade

### Desktop (Padrão)
Abra normalmente no navegador

### Tablet
1. Abra DevTools (F12)
2. Clique no ícone de dispositivo (Ctrl+Shift+M)
3. Selecione "iPad"

### Mobile
1. DevTools (F12) → Modo dispositivo
2. Selecione "iPhone 12 Pro"

**O que testar:**
- Menu hamburger aparece em mobile
- Cards reorganizam em coluna única
- Botões ficam full-width
- Tabs scrollam horizontalmente

## 🎯 Cenários de Teste Completos

### Cenário 1: Empresa Contrata e Avalia
```
1. Login como empresa
2. Criar vaga "Pintor Residencial"
3. Acessar vaga → Ver candidatos
4. Aceitar "Marcos Lima" (Pintor, 4.5⭐)
5. Contratar
6. Finalizar contrato
7. Avaliar com 5⭐
8. Verificar que rating aumentou
```

### Cenário 2: Busca Avançada
```
1. Dashboard → Buscar Profissionais
2. Filtrar: Especialidade = "Eletricista"
3. Ordenar: "Maior Avaliação"
4. Verificar: Roberto Alves (5.0⭐) aparece primeiro
5. Notar badge "Altamente Qualificado"
```

### Cenário 3: Múltiplas Vagas
```
1. Criar vaga "Pedreiro A"
2. Criar vaga "Eletricista B"
3. Criar vaga "Pintor C"
4. Verificar estatísticas: 3 vagas ativas
5. Clicar em cada vaga → Candidatos diferentes
```

## 🏆 Funcionalidades Avançadas Testadas

### ✅ Cálculo Automático de Média
- Avalie um profissional com 5⭐
- Rating atualiza automaticamente
- Fórmula: `média = soma / total`
- Arredondado para 1 casa decimal

### ✅ Badge Dinâmico
- Rating < 4.5 → Sem badge
- Rating ≥ 4.5 → 🏆 "Altamente Qualificado"

### ✅ Ordenação Inteligente
- Por rating (padrão)
- Por data de candidatura
- Ordem crescente/decrescente

### ✅ Status Workflow
```
Pendente → Aceito → Contratado → Finalizado → [Avaliado]
```

### ✅ Validações em Tempo Real
- Contador de caracteres
- Erro desaparece quando corrigido
- Preview de estrelas no hover

## 📈 Próximos Passos

1. **Integrar com Backend:**
   - API REST em Node.js/Express
   - Banco de dados PostgreSQL/MongoDB
   - Autenticação JWT

2. **Adicionar Recursos:**
   - Upload de fotos de perfil
   - Chat em tempo real
   - Notificações push
   - Sistema de pagamentos

3. **Melhorar UX:**
   - Loading states
   - Confirmação de ações críticas
   - Feedback visual aprimorado
   - Animações suaves

---

## 🎉 Pronto para Começar!

Abra `index.html` e explore todas as funcionalidades. O sistema está 100% funcional com dados mockados perfeitos para demonstração e testes.

**Dúvidas?** Consulte:
- `README.md` - Visão geral
- `INSTRUCOES_TECNICAS.md` - Detalhes técnicos
- Console do navegador (F12) - Debugging

**Boa sorte! 🚀**
