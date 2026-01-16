// DEFINIÇÃO DA API (Conexão com o Backend)
// ----------------------------------------------------------------
const API_URL = 'https://nondisposed-buildable-kelvin.ngrok-free.dev'; 
// ----------------------------------------------------------------

const StorageKeys = {
    USER_TYPE: 'workcity_user_type',
    USER_DATA: 'workcity_user_data',
    TOKEN: 'token'
};

// --- FUNÇÕES DE STORAGE ---

function saveToStorage(key, data) {
    if (typeof data === 'object') {
        localStorage.setItem(key, JSON.stringify(data));
    } else {
        localStorage.setItem(key, data);
    }
}

function loadFromStorage(key) {
    const data = localStorage.getItem(key);
    try {
        return JSON.parse(data);
    } catch (e) {
        return data;
    }
}

function isUserLoggedIn() {
    return localStorage.getItem('token') !== null;
}

function getUserType() {
    const userData = loadFromStorage(StorageKeys.USER_DATA);
    return userData ? userData.type : null;
}

function getUserData() {
    return loadFromStorage(StorageKeys.USER_DATA);
}

function logoutUser() {
    localStorage.removeItem(StorageKeys.USER_TYPE);
    localStorage.removeItem(StorageKeys.USER_DATA);
    localStorage.removeItem('token');
    localStorage.removeItem('workcity_remember_email'); 
    localStorage.removeItem('workcity_remember_email_professional');
    window.location.href = 'index.html';
}

// --- PROTEÇÃO DE ROTAS ---

function requireAuth(allowedUserType = null) {
    if (!isUserLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }
    
    const currentUserType = getUserType();
    if (allowedUserType && currentUserType !== allowedUserType) {
        if (currentUserType === 'empresa') {
            window.location.href = 'empresa-dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return false;
    }
    return true;
}

// --- UI HELPERS (HEADER ATUALIZADO COM DROPDOWN) ---

function updateHeaderForLoggedUser() {
    const headerActions = document.getElementById('headerActions');
    if (!headerActions) return;
    
    if (isUserLoggedIn()) {
        const userType = getUserType();
        const userData = getUserData();
        const nome = userData.name ? userData.name.split(' ')[0] : 'Usuário';
        const avatarUrl = userData.avatar_url;
        
        // Cores do avatar baseadas no tipo
        const bgAvatar = userType === 'empresa' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600';
        
        // HTML do Dropdown
        headerActions.innerHTML = `
            <div class="relative">
                <!-- Botão do Perfil (Avatar + Nome + Seta) -->
                <button id="userMenuBtn" onclick="toggleUserMenu()" class="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors focus:outline-none">
                    <div class="text-right hidden md:block">
                        <p class="text-sm font-bold text-gray-700 dark:text-gray-200">${nome}</p>
                        <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">${userType}</p>
                    </div>
                    
                    <div class="w-10 h-10 rounded-full ${bgAvatar} flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm ring-2 ring-transparent hover:ring-orange-200 dark:hover:ring-gray-600 transition-all">
                        ${avatarUrl ? 
                            `<img src="${avatarUrl}" class="w-full h-full object-cover">` : 
                            `<span class="font-bold text-lg">${nome.charAt(0)}</span>`
                        }
                    </div>
                    
                    <i class="fas fa-chevron-down text-xs text-gray-400 dark:text-gray-500"></i>
                </button>

                <!-- Menu Flutuante -->
                <div id="userDropdown" class="hidden absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 border border-gray-100 dark:border-gray-700 transform origin-top-right transition-all z-50">
                    <!-- Cabeçalho Mobile (Só aparece se o nome estiver escondido no botão) -->
                    <div class="md:hidden px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-1">
                        <p class="text-sm font-bold text-gray-900 dark:text-white">${userData.name || nome}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">${userType}</p>
                    </div>

                    <!-- Opções -->
                    <button onclick="navigateToProfile()" class="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors">
                        <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <i class="fas fa-user"></i>
                        </div>
                        Meu Perfil
                    </button>
                    
                    <!-- Divisor -->
                    <div class="h-px bg-gray-100 dark:bg-gray-700 my-2 mx-4"></div>
                    
                    <button onclick="logoutUser()" class="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors group">
                        <div class="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 transition-colors">
                            <i class="fas fa-sign-out-alt"></i>
                        </div>
                        Sair
                    </button>
                </div>
            </div>
        `;
    }
}

// Funções Globais para o Menu (Acessíveis pelo HTML)
window.toggleUserMenu = function() {
    const menu = document.getElementById('userDropdown');
    const btn = document.getElementById('userMenuBtn');
    
    if (menu) {
        menu.classList.toggle('hidden');
        // Animação simples de entrada
        if (!menu.classList.contains('hidden')) {
            menu.classList.add('animate-fade-in');
        }
    }
}

window.navigateToProfile = function() {
    // Se a função switchTab existe (estamos num dashboard), usa ela
    if (typeof switchTab === 'function') {
        switchTab('perfil');
    } else {
        // Se estamos em outra página, redireciona para o dashboard correto
        const userType = getUserType();
        const url = userType === 'empresa' ? 'empresa-dashboard.html' : 'dashboard.html';
        window.location.href = url; // Futuro: Adicionar ?tab=perfil
    }
    // Fecha o menu
    const menu = document.getElementById('userDropdown');
    if(menu) menu.classList.add('hidden');
}

// Fechar menu ao clicar fora
window.addEventListener('click', function(e) {
    const btn = document.getElementById('userMenuBtn');
    const menu = document.getElementById('userDropdown');
    
    if (btn && menu && !btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

// --- API: LOGIN E REGISTRO ---
// ... (O restante das funções de login/registro permanecem iguais ao código anterior)
// Vou manter o código de login/register que já estava funcionando aqui para garantir integridade.

async function loginUser(email, password) {
    const btn = document.querySelector('button[type="submit"]');
    const originalText = btn ? btn.innerText : 'Entrar';
    let loginSuccess = false;
    
    try {
        if(btn) {
            btn.innerText = 'Verificando...';
            btn.disabled = true;
        }

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            const currentPath = window.location.pathname;
            const userType = data.user.type;

            if (currentPath.includes('login-empresa') && userType !== 'empresa') {
                if (typeof showToast === 'function') showToast('⚠️ Esta conta é de Profissional.', 'error');
                else alert('⚠️ Esta conta é de Profissional.');
                return; 
            }
            if (currentPath.includes('login-profissional') && userType !== 'profissional') {
                if (typeof showToast === 'function') showToast('⚠️ Esta conta é de Empresa.', 'error');
                else alert('⚠️ Esta conta é de Empresa.');
                return; 
            }

            loginSuccess = true;
            localStorage.setItem('token', JSON.stringify(data.token));
            saveToStorage(StorageKeys.USER_DATA, data.user);
            saveToStorage(StorageKeys.USER_TYPE, data.user.type);

            if (typeof showToast === 'function') showToast('Login realizado com sucesso!', 'success');
            
            setTimeout(() => {
                if (userType === 'empresa') window.location.href = 'empresa-dashboard.html';
                else window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            if (typeof showToast === 'function') showToast(data.message || 'Erro ao fazer login', 'error');
            else alert(data.message || 'Erro ao fazer login');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        if (typeof showToast === 'function') showToast('Erro de conexão com o servidor.', 'error');
        else alert('Erro de conexão.');
    } finally {
        if (!loginSuccess && btn) { 
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}

async function registerUser(userType, userData) {
    const btn = document.querySelector('button[type="submit"]');
    const originalText = btn ? btn.innerText : 'Cadastrar';
    
    try {
        if(btn) {
            btn.innerText = 'Cadastrando...';
            btn.disabled = true;
        }

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...userData, userType })
        });

        const data = await response.json();

        if (response.ok) {
            if (typeof showToast === 'function') showToast('Cadastro realizado!', 'success');
            else alert('Cadastro realizado!');
            
            setTimeout(() => {
                window.location.href = userType === 'empresa' ? 'login-empresa.html' : 'login-profissional.html';
            }, 1500);
        } else {
            if (typeof showToast === 'function') showToast(data.message || 'Falha ao cadastrar', 'error');
            else alert(data.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        if (typeof showToast === 'function') showToast('Erro de conexão.', 'error');
        else alert('Erro de conexão.');
    } finally {
        if(btn) {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}