# WorkCity - Plataforma de Conexão entre Empresas e Profissionais

## 📋 Sobre o Projeto

WorkCity é uma plataforma web que conecta empresas de engenharia civil com profissionais autônomos qualificados (pedreiros, eletricistas, pintores, encanadores, etc.). O sistema permite que empresas publiquem vagas, gerenciem candidatos e avaliem profissionais, enquanto os profissionais podem buscar oportunidades e gerenciar suas candidaturas.

## 🚀 Tecnologias Utilizadas

- **HTML5** - Estrutura das páginas
- **JavaScript (ES6+)** - Lógica da aplicação
- **Tailwind CSS (CDN)** - Estilização responsiva
- **Font Awesome** - Ícones
- **LocalStorage** - Persistência de dados

## 📁 Estrutura de Arquivos

```
/projeto-workcity
├── index.html                    # Landing Page principal
├── login-profissional.html       # Login de profissionais
├── login-empresa.html            # Login de empresas
├── cadastro-profissional.html    # Cadastro de profissionais
├── cadastro-empresa.html         # Cadastro de empresas
├── dashboard.html                # Dashboard do profissional
├── empresa-dashboard.html        # Dashboard da empresa
├── criar-vaga.html               # Formulário de criação de vagas
├── gerenciar-candidatos.html     # Gerenciamento de candidatos por vaga
├── scripts/
│   ├── auth.js                   # Autenticação e gerenciamento de sessão
│   ├── main.js                   # Funções utilitárias globais
│   └── vagas.js                  # Lógica de vagas e avaliações
└── components/
    └── modal-avaliacao.html      # Modal de avaliação de profissionais
```

## 🎯 Funcionalidades Principais

### Para Empresas

1. **Gestão de Múltiplas Vagas**
   - Criar vagas ilimitadas com IDs únicos
   - Visualizar lista de todas as vagas publicadas
   - Acompanhar status (Ativa, Pausada, Fechada)
   - Contador de candidaturas por vaga

2. **Sistema de Avaliação de Profissionais**
   - Avaliar profissionais com 1 a 5 estrelas
   - Comentário obrigatório (mínimo 50 caracteres)
   - Cálculo automático da média de avaliações
   - Avaliações públicas no perfil do profissional

3. **Busca e Priorização de Profissionais**
   - Busca por nome e especialidade
   - Filtros por especialidade e localização
   - Ordenação por rating, experiência, projetos e valor
   - Badge "Altamente Qualificado" para profissionais com rating ≥ 4.5

4. **Gerenciamento de Candidatos**
   - Visualizar candidatos por vaga
   - Fluxo completo: Pendente → Aceito → Contratado → Finalizado → Avaliar
   - Ordenação inteligente por rating ou data
   - Destaque visual para profissionais qualificados

### Para Profissionais

1. **Busca de Vagas**
   - Visualizar vagas disponíveis
   - Filtros por especialidade e localização
   - Candidatura a vagas de interesse

2. **Gerenciamento de Candidaturas**
   - Acompanhar status das candidaturas
   - Visualizar histórico

3. **Perfil Profissional**
   - Rating público baseado em avaliações
   - Histórico de projetos
   - Certificações

## 🔧 Como Usar

### Opção 1: VS Code com Live Server

1. Instale a extensão "Live Server" no VS Code
2. Abra a pasta do projeto no VS Code
3. Clique com botão direito em `index.html`
4. Selecione "Open with Live Server"
5. A aplicação abrirá em `http://localhost:5500` (ou porta disponível)

### Opção 2: Localhost com Python

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Acesse: `http://localhost:8000`

### Opção 3: Localhost com Node.js

```bash
npx http-server -p 8000
```

Acesse: `http://localhost:8000`

### Opção 4: Abrir diretamente no navegador

Simplesmente abra o arquivo `index.html` no seu navegador preferido.

## 👤 Fluxo de Uso

### Empresa

1. **Cadastro/Login**
   - Acesse `login-empresa.html`
   - Faça login ou cadastre-se
   - Email de teste: `empresa@test.com` | Senha: `123456`

2. **Criar Vaga**
   - No dashboard, clique em "Criar Nova Vaga"
   - Preencha os dados da vaga
   - Publique a vaga

3. **Gerenciar Candidatos**
   - Visualize candidatos por vaga
   - Aceite/Recuse candidaturas
   - Contrate profissionais
   - Finalize contratos
   - Avalie o desempenho

4. **Buscar Profissionais**
   - Aba "Buscar Profissionais"
   - Use filtros de especialidade e ordenação
   - Profissionais com rating ≥ 4.5 têm badge especial

### Profissional

1. **Cadastro/Login**
   - Acesse `login-profissional.html`
   - Faça login ou cadastre-se
   - Email de teste: `profissional@test.com` | Senha: `123456`

2. **Buscar Vagas**
   - Visualize vagas disponíveis
   - Filtre por especialidade
   - Candidate-se às vagas

3. **Acompanhar Candidaturas**
   - Verifique status das candidaturas
   - Visualize mensagens das empresas

## 💾 Dados de Teste

O sistema já vem com dados mockados para facilitar os testes:

- **7 Profissionais** pré-cadastrados com ratings variados
- **Candidatos mockados** para demonstração
- **Sistema de avaliações** totalmente funcional

## 🔒 Sistema de Autenticação

- Baseado em `localStorage`
- Proteção de rotas por tipo de usuário
- Sessão persistente
- Logout funcional

## ⚡ Funcionalidades Técnicas

### Storage (LocalStorage)

```javascript
// Chaves de armazenamento
workcity_user_type      // 'empresa' ou 'profissional'
workcity_user_data      // Dados do usuário logado
workcity_vagas          // Lista de vagas criadas
workcity_avaliacoes     // Lista de avaliações
workcity_profissionais  // Lista de profissionais
```

### Sistema de Avaliação

**Cálculo da Média:**
```
Nota Final = Soma de todas as estrelas / Quantidade total de avaliações
```
- Resultado arredondado para 1 casa decimal
- Exibido no perfil público do profissional
- Usado para ordenação e destaque

**Validações:**
- Rating: 1-5 estrelas (obrigatório)
- Comentário: mínimo 50 caracteres (obrigatório)
- Formulário com validação em tempo real

### Filtros e Ordenação

**Profissionais:**
- Maior/Menor Avaliação
- Mais Experiência
- Mais Projetos
- Menor/Maior Valor

**Candidatos:**
- Maior/Menor Avaliação (padrão)
- Data Mais Recente/Antiga

## 🎨 Design e Responsividade

- Design responsivo para desktop, tablet e mobile
- Cores da marca: Laranja (#F97316) e tons de cinza
- Ícones do Font Awesome
- Animações suaves com Tailwind

## 📱 Navegação

- Hash-based routing (multipáginas HTML)
- Botões de navegação contextuais
- Breadcrumbs visuais
- Proteção de rotas por autenticação

## 🔄 Melhorias Futuras

- [ ] Integração com backend real (API REST)
- [ ] Sistema de notificações em tempo real
- [ ] Chat entre empresa e profissional
- [ ] Upload de portfólio e certificados
- [ ] Sistema de pagamentos
- [ ] Geolocalização para matching
- [ ] Aplicativo mobile (PWA)

## 🐛 Solução de Problemas

### LocalStorage não funciona
- Certifique-se de estar usando HTTP/HTTPS (não file://)
- Verifique se o navegador permite localStorage

### Estilos não carregam
- Verifique conexão com internet (Tailwind CDN)
- Limpe cache do navegador

### Dados não persistem
- Verifique console do navegador (F12)
- Limpe localStorage e recarregue

## 📄 Licença

Este projeto é de código aberto para fins educacionais.

## 👥 Contato

WorkCity - Conectando talentos da construção civil
Email: contato@workcity.com.br
Telefone: (11) 3333-3333

---

**Desenvolvido com ❤️ para revolucionar o setor de construção civil**
