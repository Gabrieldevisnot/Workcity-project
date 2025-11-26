/**
 * main.js - Funções Utilitárias Globais do WorkCity (Versão Estável)
 */

// --- NAVEGAÇÃO ---

function navigateTo(url) {
    window.location.href = url;
}

function navigateToHome() {
    window.location.href = 'index.html';
}

// --- INTERFACE & NOTIFICAÇÕES ---

// Mostrar notificação toast (Simples e compatível com o CSS atual)
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    
    // Cores fixas (sem variaveis de dark mode)
    let colors = 'bg-green-500 text-white';
    let icon = '<i class="fas fa-check-circle"></i>';
    
    if (type === 'error') {
        colors = 'bg-red-500 text-white';
        icon = '<i class="fas fa-times-circle"></i>';
    } else if (type === 'info') {
        colors = 'bg-blue-500 text-white';
        icon = '<i class="fas fa-info-circle"></i>';
    }

    toast.className = `fixed top-4 right-4 ${colors} px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-fade-in transition-all duration-300`;
    toast.innerHTML = `${icon} <span class="font-medium">${message}</span>`;
    
    document.body.appendChild(toast);
    
    // Remove automático
    setTimeout(() => {
        toast.style.opacity = '0';
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

// Debounce para busca
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

// --- COMPONENTES DE UI ---

// Loading spinner global
function showLoading() {
    if (document.getElementById('globalLoading')) return;
    
    const loading = document.createElement('div');
    loading.id = 'globalLoading';
    loading.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]';
    loading.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent mb-2"></div>
            <span class="text-gray-600 font-medium text-sm">Carregando...</span>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('globalLoading');
    if (loading) loading.remove();
}

// Modal genérico
function createModal(title, content, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full shadow-xl transform transition-all">
            <h3 class="text-xl font-bold mb-4 text-gray-900">${title}</h3>
            <div class="mb-6 text-gray-600">${content}</div>
            <div class="flex justify-end gap-3">
                <button id="modalCancel" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
                    Cancelar
                </button>
                <button id="modalConfirm" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition shadow-sm">
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

// Inicialização básica
document.addEventListener('DOMContentLoaded', () => {
    console.log('WorkCity Application Initialized (Stable) 🚀');
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.fixed.inset-0');
            modals.forEach(modal => modal.remove());
        }
    });
});

// Estilos de animação básicos
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
`;
document.head.appendChild(style);