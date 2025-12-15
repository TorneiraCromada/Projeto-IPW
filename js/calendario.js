class Calendario {
    constructor() {
        this.dataAtual = new Date();
        this.mesAtual = this.dataAtual.getMonth();
        this.anoAtual = this.dataAtual.getFullYear();
        this.diaSelecionado = null;
        this.eventos = this.carregarEventos();
        
        this.nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                           "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        
        this.init();
    }
    
    init() {
        this.renderizarCalendario();
        this.configurarEventos();
    }
    
    renderizarCalendario() {
        const container = document.getElementById('artigoConteiner');
        const titulo = document.getElementById('mesTitulo');
        
        titulo.textContent = `${this.nomesMeses[this.mesAtual]} ${this.anoAtual}`;
        container.innerHTML = '';
        
        const primeiroDia = new Date(this.anoAtual, this.mesAtual, 1);
        const ultimoDia = new Date(this.anoAtual, this.mesAtual + 1, 0);
        const diaInicio = primeiroDia.getDay();
        const diasNoMes = ultimoDia.getDate();
        const ultimoDiaMesAnterior = new Date(this.anoAtual, this.mesAtual, 0).getDate();
        
        const hoje = new Date();
        const hojeString = hoje.toDateString();
        
        for (let i = diaInicio - 1; i >= 0; i--) {
            const dia = ultimoDiaMesAnterior - i;
            this.criarDiaCalendario(dia, 'outro-mes');
        }
        
        for (let dia = 1; dia <= diasNoMes; dia++) {
            const dataDia = new Date(this.anoAtual, this.mesAtual, dia);
            const isHoje = dataDia.toDateString() === hojeString;
            const classes = isHoje ? 'dia-atual' : '';
            
            const diaElement = this.criarDiaCalendario(dia, classes);
            this.adicionarEventosAoDia(diaElement, dia);
        }
        
        const totalCells = Math.ceil((diasNoMes + diaInicio) / 7) * 7;
        const diasRestantes = totalCells - (diasNoMes + diaInicio);
        
        for (let i = 1; i <= diasRestantes; i++) {
            this.criarDiaCalendario(i, 'outro-mes');
        }
    }//aaaaaa 38 de febre aaaaaaaaaaaaaaaaaaaaa eu vou morrer
    
    criarDiaCalendario(numero, classesAdicionais = '') {
        const container = document.getElementById('artigoConteiner');
        const artigo = document.createElement('article');
        
        artigo.className = `artigo ${classesAdicionais}`;
        artigo.dataset.dia = numero;
        artigo.dataset.mes = this.mesAtual;
        artigo.dataset.ano = this.anoAtual;
        
        artigo.innerHTML = `
            <div class="dia-numero">${numero}</div>
            <div class="dia-conteudo" id="conteudo-${this.anoAtual}-${this.mesAtual}-${numero}"></div>
        `;
        
        artigo.addEventListener('click', () => {
            this.selecionarDia(numero);
        });
        
        container.appendChild(artigo);
        return artigo;
    }
    
    adicionarEventosAoDia(elemento, dia) {
        const conteudoElement = elemento.querySelector('.dia-conteudo');
        const chave = `${this.anoAtual}-${this.mesAtual}-${dia}`;
        
        if (this.eventos[chave] && this.eventos[chave].length > 0) {
            elemento.classList.add('com-evento');
            
            const primeiroEvento = this.eventos[chave][0];
            conteudoElement.innerHTML = `
                <div class="evento-texto" title="${primeiroEvento.titulo}">
                    ${primeiroEvento.titulo}
                </div>
            `;
        }
    }
    
    selecionarDia(dia) {
        this.diaSelecionado = { dia: dia, mes: this.mesAtual, ano: this.anoAtual };
        const chave = `${this.anoAtual}-${this.mesAtual}-${dia}`;
        const dataFormatada = `${dia.toString().padStart(2, '0')}/${(this.mesAtual + 1).toString().padStart(2, '0')}/${this.anoAtual}`;
        
        const modal = document.getElementById('modalEvento');
        const modalConteudo = document.querySelector('.modal-conteudo');
        
        modalConteudo.innerHTML = '';
        
        if (this.eventos[chave] && this.eventos[chave].length > 0) {
            modalConteudo.innerHTML = `
                <h3 class="modal-titulo">Eventos - ${dataFormatada}</h3>
                <div class="lista-eventos">
                    ${this.eventos[chave].map((evento, index) => `
                        <div class="evento-item">
                            <div class="evento-header">
                                <h4>${evento.titulo}</h4>
                            </div>
                            <p class="evento-descricao">${evento.descricao || 'Sem descrição'}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="botoes-modal">
                    <button type="button" class="btn-adicionar" onclick="calendario.mostrarFormulario()">
                        <i class="fas fa-plus"></i> Adicionar Novo Evento
                    </button>
                    <button type="button" class="btn-cancelar" onclick="fecharModal()">Fechar</button>
                </div>
            `;
        } else {
            this.mostrarFormulario(dataFormatada);
        }
        
        modal.style.display = 'flex';
    }
    
    mostrarFormulario(dataFormatada = null) {
        const modalConteudo = document.querySelector('.modal-conteudo');
        const data = dataFormatada || `${this.diaSelecionado.dia.toString().padStart(2, '0')}/${(this.diaSelecionado.mes + 1).toString().padStart(2, '0')}/${this.diaSelecionado.ano}`;
        
        modalConteudo.innerHTML = `
            <h3 class="modal-titulo">Adicionar Evento - ${data}</h3>
            <form class="form-evento" id="formEventoNovo">
                <div class="form-grupo">
                    <label for="eventoTituloNovo">Título do Evento:</label>
                    <input type="text" id="eventoTituloNovo" required>
                </div>
                <div class="form-grupo">
                    <label for="eventoDescricaoNovo">Descrição:</label>
                    <textarea id="eventoDescricaoNovo"></textarea>
                </div>
                <div class="botoes-modal">
                    <button type="button" class="btn-cancelar" onclick="fecharModal()">Cancelar</button>
                    <button type="button" class="btn-salvar" onclick="calendario.adicionarEventoForm()">Salvar Evento</button>
                </div>
            </form>
        `;
        
        const inputTitulo = document.getElementById('eventoTituloNovo');
        if (inputTitulo) {
            inputTitulo.focus();
            
            inputTitulo.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.adicionarEventoForm();
                }
            });
        }
    }
    
    adicionarEventoForm() {
        if (!this.diaSelecionado) return;
        
        const tituloInput = document.getElementById('eventoTituloNovo');
        const descricaoInput = document.getElementById('eventoDescricaoNovo');
        
        if (!tituloInput || !descricaoInput) return;
        
        const titulo = tituloInput.value.trim();
        const descricao = descricaoInput.value.trim();
        
        if (titulo) {
            const evento = {
                dia: this.diaSelecionado.dia,
                mes: this.diaSelecionado.mes,
                ano: this.diaSelecionado.ano,
                titulo: titulo,
                descricao: descricao
            };
            
            this.adicionarEvento(evento);
            this.selecionarDia(this.diaSelecionado.dia);
        }
    }
    
    adicionarEvento(evento) {
        const chave = `${evento.ano}-${evento.mes}-${evento.dia}`;
        
        if (!this.eventos[chave]) this.eventos[chave] = [];
        
        this.eventos[chave].push({
            titulo: evento.titulo,
            descricao: evento.descricao,
            data: new Date()
        });
        
        this.salvarEventos();
        this.renderizarCalendario();
    }
    
    removerEvento(chave, index) {
        if (this.eventos[chave]) {
            this.eventos[chave].splice(index, 1);
            
            if (this.eventos[chave].length === 0) {
                delete this.eventos[chave];
            }
            
            this.salvarEventos();
            this.renderizarCalendario();
            
            this.fecharModal();
            const [ano, mes, dia] = chave.split('-');
            setTimeout(() => {
                this.selecionarDia(parseInt(dia));
            }, 10);
        }
    }
    
    carregarEventos() {
        const eventosSalvos = localStorage.getItem('greenDateEventos');
        
        if (!eventosSalvos) {
            const hoje = new Date();
            const mes = hoje.getMonth();
            const ano = hoje.getFullYear();
            
            return {
                [`${ano}-${mes}-${hoje.getDate()}`]: [
                    { 
                        titulo: "🌿 Reunião de Planejamento", 
                        descricao: "Discussão dos próximos eventos ambientais" 
                    }
                ],
                [`${ano}-${mes}-${hoje.getDate() + 3}`]: [
                    { 
                        titulo: "♻️ Coleta Seletiva", 
                        descricao: "Coleta de materiais recicláveis no centro" 
                    }
                ]
            };
        }
        
        return JSON.parse(eventosSalvos);
    }
    
    salvarEventos() {
        localStorage.setItem('greenDateEventos', JSON.stringify(this.eventos));
    }
    
    mudarMes(direcao) {
        this.mesAtual += direcao;
        
        if (this.mesAtual < 0) {
            this.mesAtual = 11;
            this.anoAtual--;
        } else if (this.mesAtual > 11) {
            this.mesAtual = 0;
            this.anoAtual++;
        }
        
        this.renderizarCalendario();
    }
    
    irParaHoje() {
        const hoje = new Date();
        this.mesAtual = hoje.getMonth();
        this.anoAtual = hoje.getFullYear();
        this.renderizarCalendario();
    }
    
    configurarEventos() {
        const modal = document.getElementById('modalEvento');
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.fecharModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                this.fecharModal();
            }
        });
    }
    
    fecharModal() {
        const modal = document.getElementById('modalEvento');
        modal.style.display = 'none';
        this.diaSelecionado = null;
    }
}

let calendario;

function mudarMes(direcao) {
    if (calendario) {
        calendario.mudarMes(direcao);
    }
}

function irParaHoje() {
    if (calendario) {
        calendario.irParaHoje();
    }
}

function fecharModal() {
    if (calendario) {
        calendario.fecharModal();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    calendario = new Calendario();
});