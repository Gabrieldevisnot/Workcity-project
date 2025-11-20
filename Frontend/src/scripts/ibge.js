const IBGE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';

// 1. Carregar Estados (Igual ao anterior)
async function carregarEstados(idSelectUF) {
    const selectUF = document.getElementById(idSelectUF);
    if (!selectUF) return;

    try {
        const response = await fetch(`${IBGE_URL}?orderBy=nome`);
        const estados = await response.json();

        selectUF.innerHTML = '<option value="">UF</option>';
        
        estados.forEach(uf => {
            const option = document.createElement('option');
            option.value = uf.sigla; 
            option.innerText = uf.sigla; 
            option.title = uf.nome; 
            selectUF.appendChild(option);
        });

    } catch (error) {
        console.error('Erro IBGE:', error);
    }
}

// 2. Carregar Cidades (ATUALIZADO PARA DATALIST)
async function carregarCidades(idSelectUF, idDataListCidades) {
    const uf = document.getElementById(idSelectUF).value;
    const dataList = document.getElementById(idDataListCidades);
    
    // Precisamos pegar o INPUT associado para desbloqueá-lo
    // Assumindo que o input tem o id 'filtroCidade' no dashboard
    const inputCidade = document.getElementById('filtroCidade') || document.getElementById('localizacao'); 
    
    if (!uf) {
        if(inputCidade) {
            inputCidade.value = "";
            inputCidade.disabled = true;
            inputCidade.placeholder = "Selecione a UF primeiro...";
        }
        dataList.innerHTML = "";
        return;
    }

    if(inputCidade) {
        inputCidade.disabled = true;
        inputCidade.placeholder = "Carregando cidades...";
        inputCidade.value = ""; // Limpa a busca anterior
    }

    try {
        const response = await fetch(`${IBGE_URL}/${uf}/municipios`);
        const cidades = await response.json();

        dataList.innerHTML = ""; // Limpa as opções antigas
        
        cidades.forEach(cidade => {
            const option = document.createElement('option');
            // O valor será "Nome" (ex: Campinas)
            // O input vai completar com isso
            option.value = `${cidade.nome} - ${uf}`; 
            dataList.appendChild(option);
        });

        if(inputCidade) {
            inputCidade.disabled = false;
            inputCidade.placeholder = "Digite ou selecione a cidade...";
            inputCidade.focus(); // Foca para o usuário já digitar
        }

    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        if(inputCidade) inputCidade.placeholder = "Erro ao carregar";
    }
}

// Inicializa
document.addEventListener('DOMContentLoaded', () => {
    carregarEstados('filtroUF');
    // Se tiver outros selects de estado na página (como no cadastro), adicione aqui
});