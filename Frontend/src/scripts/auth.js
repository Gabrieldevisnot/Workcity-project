// DEFINIÇÃO DA API (Conexão com o Backend)
// ----------------------------------------------------------------
// Link do Ngrok (Túnel para o seu computador local)
// ATENÇÃO: Se você reiniciar o Ngrok, este link vai mudar!
const API_URL = 'https://nondisposed-buildable-kelvin.ngrok-free.dev'; 
// ----------------------------------------------------------------

// Funções de Storage
const StorageKeys = {
    USER_TYPE: 'workcity_user_type',
    USER_DATA: 'workcity_user_data',
    TOKEN: 'token'
};

// Salvar no localStorage
function saveToStorage(key, data) {
    if (typeof data === 'object') {
        localStorage.setItem(key, JSON.stringify(data));
    } else {
        localStorage.setItem(key, data);
    }
}

// Carregar do localStorage
function loadFromStorage(key) {
    const data = localStorage.getItem(key);
    try {
        return JSON.parse(data);
    } catch (e) {
        return data;
    }
}

// Verificar se usuário está logado
function isUserLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Obter tipo de usuário logado
function getUserType() {
    const userData = loadFromStorage(StorageKeys.USER_DATA);
    return userData ? userData.type : null;
}

// Obter dados do usuário logado
function getUserData() {
    return loadFromStorage(StorageKeys.USER_DATA);
}

// Logout de usuário
function logoutUser() {
    localStorage.removeItem(StorageKeys.USER_TYPE);
    localStorage.removeItem(StorageKeys.USER_DATA);
    localStorage.removeItem('token');
    localStorage.removeItem('workcity_remember_email'); // Opcional: limpar lembrar-me
    localStorage.removeItem('workcity_remember_email_professional');
    window.location.href = 'index.html';
}

// Proteger páginas
function requireAuth(allowedUserType = null) {
    if (!isUserLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }
    
    const currentUserType = getUserType();
    if (allowedUserType && currentUserType !== allowedUserType) {
        // Redirecionar para o dashboard correto se estiver no lugar errado
        if (currentUserType === 'empresa') {
            window.location.href = 'empresa-dashboard.html';
        } else {
            window.location.href = 'dashboard.html'; // Profissional
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
        const nome = userData.name ? userData.name.split(' ')[0] : 'Usuário';
        
        headerActions.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2 text-sm">
                    <div class="w-2 h-2 rounded-full ${userType === 'empresa' ? 'bg-blue-500' : 'bg-orange-500'}"></div>
                    <span class="text-gray-700 dark:text-gray-200 font-medium">Olá, ${nome}</span>
                </div>
                <button onclick="logoutUser()" class="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Sair
                </button>
            </div>
        `;
    }
}

// Funções de API (Login e Registro)

async function loginUser(email, password) {
    try {
        const btn = document.querySelector('button[type="submit"]');
        const originalText = btn ? btn.innerText : 'Entrar';
        if(btn) {
            btn.innerText = 'Entrando...';
            btn.disabled = true;
        }

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Salva token puro (sem aspas extras do JSON.stringify se vier string direta)
            // Mas nossa API retorna json { token: "..." }
            localStorage.setItem('token', JSON.stringify(data.token)); 
            
            // Salva dados do usuário
            saveToStorage(StorageKeys.USER_DATA, data.user);
            saveToStorage(StorageKeys.USER_TYPE, data.user.type);

            // Redireciona
            if (data.user.type === 'empresa') {
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
        if(btn) {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
}

async function registerUser(userType, userData) {
    try {
        const btn = document.querySelector('button[type="submit"]');
        const originalText = btn ? btn.innerText : 'Cadastrar';
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
            // Login automático ou redirecionar para login
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