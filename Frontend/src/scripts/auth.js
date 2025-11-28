// DEFINIÇÃO DA API (Conexão com o Backend)
// ----------------------------------------------------------------
// Link do Ngrok ou Localhost
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
        // Redireciona para o dashboard correto se estiver logado mas na página errada
        if (currentUserType === 'empresa') {
            window.location.href = 'empresa-dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return false;
    }
    return true;
}

// --- UI HELPERS ---

function updateHeaderForLoggedUser() {
    const headerActions = document.getElementById('headerActions');
    if (!headerActions) return;
    
    if (isUserLoggedIn()) {
        const userType = getUserType();
        const userData = getUserData();
        const nome = userData.name ? userData.name.split(' ')[0] : 'Usuário';
        
        // Cores diferentes para cada tipo
        const badgeColor = userType === 'empresa' ? 'bg-blue-500' : 'bg-orange-500';
        
        headerActions.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 text-sm">
                    <div class="w-2 h-2 rounded-full ${badgeColor}"></div>
                    <span class="text-gray-700 dark:text-gray-200 font-medium">Olá, ${nome}</span>
                </div>
                <button onclick="logoutUser()" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Sair
                </button>
            </div>
        `;
    }
}

// --- API: LOGIN E REGISTRO ---

async function loginUser(email, password) {
    const btn = document.querySelector('button[type="submit"]');
    const originalText = btn ? btn.innerText : 'Entrar';
    let loginSuccess = false; // Flag para controlar o sucesso
    
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
            // --- BLOQUEIO DE TIPO CRUZADO ---
            const currentPath = window.location.pathname;
            const userType = data.user.type;

            // Se estou na página de Empresa mas sou Profissional
            if (currentPath.includes('login-empresa') && userType !== 'empresa') {
                alert('⚠️ Esta conta é de Profissional.\nPor favor, faça login na área "Sou Profissional".');
                // Não marca sucesso para destravar o botão no finally
                return; 
            }

            // Se estou na página de Profissional mas sou Empresa
            if (currentPath.includes('login-profissional') && userType !== 'profissional') {
                alert('⚠️ Esta conta é de Empresa.\nPor favor, faça login na área "Sou Empresa".');
                // Não marca sucesso para destravar o botão no finally
                return; 
            }
            // ---------------------------------------

            // Login Válido
            loginSuccess = true;

            // Salva dados
            localStorage.setItem('token', JSON.stringify(data.token));
            saveToStorage(StorageKeys.USER_DATA, data.user);
            saveToStorage(StorageKeys.USER_TYPE, data.user.type);

            // Redireciona
            if (userType === 'empresa') {
                window.location.href = 'empresa-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            alert('Erro: ' + (data.message || data));
        }
    } catch (error) {
        console.error('Erro no login:', error);
        alert('Erro de conexão com o servidor.');
    } finally {
        // Só reativa o botão se o login NÃO teve sucesso
        // Se teve sucesso, a página vai recarregar/mudar, então não precisamos mexer
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
            body: JSON.stringify({ 
                ...userData, 
                userType: userType 
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = userType === 'empresa' ? 'login-empresa.html' : 'login-profissional.html';
        } else {
            alert('Erro: ' + (data.message || 'Falha ao cadastrar'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor.');
    } finally {
        if(btn) {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}