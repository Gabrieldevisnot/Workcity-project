// auth.js - Gerenciamento de Autenticação e Estado do Usuário
const API_URL = 'http://localhost:3000'; // Endereço do seu backend
// Funções de Storage
const StorageKeys = {
    USER_TYPE: 'workcity_user_type',
    USER_DATA: 'workcity_user_data',
    VAGAS: 'workcity_vagas',
    AVALIACOES: 'workcity_avaliacoes',
    PROFISSIONAIS: 'workcity_profissionais'
};

// Salvar no localStorage
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Carregar do localStorage
function loadFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// Verificar se usuário está logado
function isUserLoggedIn() {
    return loadFromStorage(StorageKeys.USER_TYPE) !== null;
}

// Obter tipo de usuário logado
function getUserType() {
    return loadFromStorage(StorageKeys.USER_TYPE);
}

// Obter dados do usuário logado
function getUserData() {
    return loadFromStorage(StorageKeys.USER_DATA);
}

// Login de usuário
/*function loginUser(userType, userData) {
    saveToStorage(StorageKeys.USER_TYPE, userType);
    saveToStorage(StorageKeys.USER_DATA, userData);
    
    // Redirecionar para dashboard apropriado
    if (userType === 'empresa') {
        window.location.href = 'empresa-dashboard.html';
    } else {
        window.location.href = 'dashboard.html';
    }
}*/
async function loginUser(email, password) { // ATENÇÃO: Agora recebe email e senha, não o objeto completo
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            saveToStorage('token', data.token);
            saveToStorage(StorageKeys.USER_TYPE, data.user.type);
            saveToStorage(StorageKeys.USER_DATA, data.user);

            window.location.href = data.user.type === 'empresa' ? 'empresa-dashboard.html' : 'dashboard.html';
        } else {
            alert('Erro: ' + data.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor.');
    }
}
// Logout de usuário
function logoutUser() {
    localStorage.removeItem(StorageKeys.USER_TYPE);
    localStorage.removeItem(StorageKeys.USER_DATA);
    window.location.href = 'index.html';
}

// Registrar usuário (cadastro)
/* function registerUser(userType, userData) {
//     // Simular registro bem-sucedido
//     loginUser(userType, userData);
 }*/
async function registerUser(userType, userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...userData, userType })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            // Tenta logar automaticamente ou manda pro login
            window.location.href = userType === 'empresa' ? 'login-empresa.html' : 'login-profissional.html';
        } else {
            alert('Erro: ' + data.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor.');
    }
}
// Proteger páginas (redirecionar se não logado)
function requireAuth(allowedUserType = null) {
    if (!isUserLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }
    
    if (allowedUserType && getUserType() !== allowedUserType) {
        // Usuário logado mas tipo errado
        if (getUserType() === 'empresa') {
            window.location.href = 'empresa-dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return false;
    }
    
    return true;
}

// Atualizar header com informações do usuário
function updateHeaderForLoggedUser() {
    const headerActions = document.getElementById('headerActions');
    if (!headerActions) return;
    
    if (isUserLoggedIn()) {
        const userType = getUserType();
        const userData = getUserData();
        
        headerActions.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 rounded-full ${userType === 'empresa' ? 'bg-blue-500' : 'bg-green-500'}"></div>
                    <span class="text-sm text-gray-600 capitalize">
                        ${userType === 'empresa' ? 'Empresa' : 'Profissional'}
                    </span>
                </div>
                <button onclick="logoutUser()" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                    Sair
                </button>
            </div>
        `;
    }
}

// Criar botão flutuante para dashboards na landing page
function createFloatingDashboardButton() {
    const floatingBtn = document.getElementById('floatingDashboardBtn');
    if (!floatingBtn || !isUserLoggedIn()) return;
    
    const userType = getUserType();
    const buttonText = userType === 'empresa' ? 'Publicar Vagas' : 'Meu Dashboard';
    const icon = userType === 'empresa' ? 'fa-briefcase' : 'fa-chart-line';
    const dashboardUrl = userType === 'empresa' ? 'empresa-dashboard.html' : 'dashboard.html';
    
    floatingBtn.innerHTML = `
        <button 
            onclick="navigateTo('${dashboardUrl}')"
            class="fixed top-24 right-4 z-50 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 animate-fade-in"
        >
            <i class="fas ${icon}"></i>
            ${buttonText}
        </button>
    `;
    floatingBtn.classList.remove('hidden');
}

// Mostrar CTA para usuários logados na landing page
function showLoggedUserCTA() {
    const ctaSection = document.getElementById('loggedUserCTA');
    if (!ctaSection || !isUserLoggedIn()) return;
    
    const userType = getUserType();
    const ctaTitle = document.getElementById('ctaTitle');
    const ctaDescription = document.getElementById('ctaDescription');
    const ctaButton = document.getElementById('ctaButton');
    
    if (userType === 'empresa') {
        ctaTitle.textContent = 'Pronto para encontrar os melhores profissionais?';
        ctaDescription.textContent = 'Acesse seu painel de controle e comece a publicar vagas ou buscar candidatos qualificados.';
        ctaButton.innerHTML = '<i class="fas fa-briefcase mr-2"></i>Acessar Painel de Vagas';
        ctaButton.onclick = () => navigateTo('empresa-dashboard.html');
    } else {
        ctaTitle.textContent = 'Encontre novas oportunidades agora!';
        ctaDescription.textContent = 'Explore centenas de vagas disponíveis e candidate-se às que mais combinam com seu perfil.';
        ctaButton.innerHTML = '<i class="fas fa-chart-line mr-2"></i>Ir para o Dashboard';
        ctaButton.onclick = () => navigateTo('dashboard.html');
    }
    
    ctaSection.classList.remove('hidden');
}

// Navegação entre páginas
function navigateTo(url) {
    window.location.href = url;
}

function navigateToHome() {
    window.location.href = 'index.html';
}

// Inicializar funcionalidades de autenticação na página
function initAuth() {
    if (document.getElementById('headerActions')) {
        updateHeaderForLoggedUser();
    }
    
    if (document.getElementById('floatingDashboardBtn')) {
        createFloatingDashboardButton();
    }
    
    if (document.getElementById('loggedUserCTA')) {
        showLoggedUserCTA();
    }
}

// Executar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
