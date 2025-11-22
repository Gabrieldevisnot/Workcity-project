const IBGE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';

// 1. Carregar Estados
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
            option.title = uf.nome; // Mostra o nome completo ao passar o mouse
            selectUF.appendChild(option);
        });
    } catch (error) {
        console.error('Erro IBGE:', error);
    }
}

// 2. Carregar Cidades (CORRIGIDO: Recebe o ID do Input explicitamente)
async function carregarCidades(idSelectUF, idDataList, idInputCidade) {
    const uf = document.getElementById(idSelectUF).value;
    const dataList = document.getElementById(idDataList);
    const input = document.getElementById(idInputCidade);
    
    // Se não selecionou UF, bloqueia e limpa
    if (!uf) {
        if(input) {
            input.value = "";
            input.disabled = true;
            input.placeholder = "Selecione o Estado...";
        }
        if(dataList) dataList.innerHTML = "";
        return;
    }

    // Bloqueia enquanto carrega (Feedback visual)
    if(input) {
        input.disabled = true;
        input.placeholder = "Carregando cidades...";
        input.value = "";
    }

    try {
        const response = await fetch(`${IBGE_URL}/${uf}/municipios`);
        const cidades = await response.json();

        if(dataList) dataList.innerHTML = ""; // Limpa lista antiga
        
        cidades.forEach(cidade => {
            const option = document.createElement('option');
            // Formato: "Campinas - SP"
            option.value = `${cidade.nome} - ${uf}`; 
            if(dataList) dataList.appendChild(option);
        });

        // Desbloqueia o campo para digitar
        if(input) {
            input.disabled = false;
            input.placeholder = "Digite a cidade...";
            input.focus();
        }

    } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        if(input) input.placeholder = "Erro na conexão";
    }
}//NÃO ALTERAR ESTE CODIGO, MUITA GAMBIRA