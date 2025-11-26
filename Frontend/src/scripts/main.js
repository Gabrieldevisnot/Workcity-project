/**
 * main.js - Funções Utilitárias Globais do WorkCity
 * Inclui interceptador para Ngrok e utilitários de UI/Navegação.
 */

// ==================================================================
// 🛡️ INTERCEPTADOR MÁGICO DO NGROK (Correção de Bloqueio)
// ==================================================================
(function() {
    const originalFetch = window.fetch;

    window.fetch = function(url, options = {}) {
        // Verifica se é uma requisição para o Ngrok
        if (typeof url === 'string' && url.includes('ngrok')) {
            
            // Garante que options.headers existe
            if (!options.headers) {
                options.headers = {};
            }

            // Adiciona o cabeçalho que "pula" a tela de aviso
            if (options.headers instanceof Headers) {
                options.headers.append('ngrok-skip-browser-warning', 'true');
            } else {
                options.headers['ngrok-skip-browser-warning'] = 'true';
            }
        }

        // Continua a requisição normal
        return originalFetch(url, options);
    };
})();
// ==================================================================


// --- NAVEGAÇÃO ---

function navigateTo(url) {
    window.location.href = url;
}

function navigateToHome() {
    window.location.href = 'index.html';
}


// --- INTERFACE & NOTIFICAÇÕES (TOASTS) ---

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    
    // Cores (Compatível com Dark Mode e Light Mode)
    let colors = 'bg-green-600 border-green-700 text-white';
    let icon = '<i class="fas fa-check-circle"></i>';
    
    if (type === 'error') {
        colors = 'bg-red-600 border-red-700 text-white';
        icon = '<i class="fas fa-times-circle"></i>';
    } else if (type === 'info') {
        colors = 'bg-blue-600 border-blue-700 text-white';
        icon = '<i class="fas fa-info-circle"></i>';
    }

    toast.className = `fixed top-4 right-4 ${colors} px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3 border-b-4 animate-fade-in transition-all duration-300 opacity-0 translate-y-[-10px]`;
    toast.innerHTML = `${icon} <span class="font-medium">${message}</span>`;
    
    document.body.appendChild(toast);
    
    // Animação de Entrada
    requestAnimationFrame(() => {
        toast.classList.remove('opacity-0', 'translate-y-[-10px]');
    });
    
    // Remoção Automática
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-[-10px]');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


// --- FORMATAÇÃO E UTILITÁRIOS ---

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
    return re.test(phone);
}

// Função Debounce (Otimiza a busca)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


// --- COMPONENTES DE UI (LOADING E MODAL) ---

// Spinner de Carregamento Global
function showLoading() {
    if (document.getElementById('globalLoading')) return;
    
    const loading = document.createElement('div');
    loading.id = 'globalLoading';
    loading.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] transition-opacity duration-300';
    loading.innerHTML = `
        <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center transform scale-100 animate-pop-in">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-3"></div>
            <span class="text-gray-700 dark:text-gray-200 font-medium text-sm">Carregando...</span>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => loading.remove(), 300);
    }
}

// Modal Genérico
function createModal(title, content, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4 fade-in';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl transform scale-100 transition-all border border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">${title}</h3>
            <div class="mb-6 text-gray-600 dark:text-gray-300">${content}</div>
            <div class="flex justify-end gap-3">
                <button id="modalCancel" class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Cancelar
                </button>
                <button id="modalConfirm" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition shadow-md">
                    Confirmar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#modalCancel').onclick = () => {
        modal.remove();
        if (onCancel) onCancel();
    };
    
    modal.querySelector('#modalConfirm').onclick = () => {
        modal.remove();
        if (onConfirm) onConfirm();
    };

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}


// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    console.log('WorkCity App Initialized (With Ngrok Fix) 🚀');
    
    // Fecha modais com a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.fixed.inset-0');
            modals.forEach(modal => modal.remove());
        }
    });
});

// Estilos dinâmicos para animações básicas
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
    .animate-pop-in { animation: fadeIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
`;
document.head.appendChild(style);