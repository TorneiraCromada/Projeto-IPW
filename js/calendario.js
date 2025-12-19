class Calendario {
    constructor() {
        this.dataAtual = new Date();
        this.mesAtual = this.dataAtual.getMonth();
        this.anoAtual = this.dataAtual.getFullYear();
        this.diaSelecionado = null;
        this.eventoEditandoIndex = null;
        
        this.nomesMeses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                           "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        
        this.gestorEventos = new GerenciadorEventos();
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
    }
    
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
        const eventos = this.gestorEventos.getEventosPorData(this.anoAtual, this.mesAtual, dia);
        
        if (eventos.length > 0) {
            elemento.classList.add('com-evento');
            
            const primeiroEvento = eventos[0];
            conteudoElement.innerHTML = `
                <div class="evento-texto" title="${primeiroEvento.titulo}">
                    ${primeiroEvento.titulo}
                </div>
            `;
        }
    }
    
    selecionarDia(dia) {
        this.diaSelecionado = { dia: dia, mes: this.mesAtual, ano: this.anoAtual };
        this.eventoEditandoIndex = null;
        this.mostrarModalEventos(dia);
    }
    
    mostrarModalEventos(dia) {
        const eventos = this.gestorEventos.getEventosPorData(this.anoAtual, this.mesAtual, dia);
        const dataFormatada = `${dia.toString().padStart(2, '0')}/${(this.mesAtual + 1).toString().padStart(2, '0')}/${this.anoAtual}`;
        
        const modal = document.getElementById('modalEvento');
        const modalConteudo = document.querySelector('.modal-conteudo');
        
        modalConteudo.innerHTML = '';
        
        if (eventos.length > 0) {
            modalConteudo.innerHTML = `
                <h3 class="modal-titulo">Eventos - ${dataFormatada}</h3>
                <div class="lista-eventos">
                    ${eventos.map((evento, index) => `
                        <div class="evento-item">
                            ${evento.imagem ? `
                            <div class="evento-imagem">
                                <img src="${evento.imagem}" alt="${evento.titulo}" onerror="this.style.display='none'">
                            </div>
                            ` : ''}
                            <div class="evento-header">
                                <h4>${evento.titulo}</h4>
                                <div class="evento-info">
                                    <span class="evento-inscritos-modal">
                                        <i class="fas fa-users"></i> ${this.gestorEventos.getNumeroInscritos(evento.id || evento.titulo) || 0} inscritos
                                    </span>
                                    <div class="evento-acoes">
                                        <button class="btn-editar" onclick="calendario.editarEvento(${index})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-remover" onclick="calendario.removerEvento(${index})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                        <button class="btn-inscrever-modal" onclick="inscreverNoEventoModal('${evento.id || evento.titulo}', '${evento.titulo.replace(/'/g, "\\'")}')">
                                            <i class="fas fa-user-plus"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p class="evento-descricao">${evento.descricao || 'Sem descrição'}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="botoes-modal">
                    <button type="button" class="btn-adicionar" onclick="calendario.mostrarFormularioAdicionar()">
                        <i class="fas fa-plus"></i> Adicionar Novo Evento
                    </button>
                    <button type="button" class="btn-cancelar" onclick="fecharModal()">Fechar</button>
                </div>
            `;
        } else {
            this.mostrarFormularioAdicionar(dataFormatada);
        }
        
        modal.style.display = 'flex';
    }
    
    mostrarFormularioAdicionar(dataFormatada = null) {
        const modalConteudo = document.querySelector('.modal-conteudo');
        const data = dataFormatada || 
            `${this.diaSelecionado.dia.toString().padStart(2, '0')}/${(this.diaSelecionado.mes + 1).toString().padStart(2, '0')}/${this.diaSelecionado.ano}`;
        
        const thumbnails = this.gestorEventos.getThumbnails();
        
        const opcoesThumbnails = thumbnails.map(img => 
            `<option value="${img}">${img.split('/').pop()}</option>`
        ).join('');
        
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
                <div class="form-grupo">
                    <label for="eventoThumbnail">Escolha uma thumbnail:</label>
                    <select id="eventoThumbnail" class="select-thumbnail">
                        <option value="">Sem thumbnail</option>
                        ${opcoesThumbnails}
                    </select>
                    <div class="thumbnails-previa" id="thumbnailsPrevia"></div>
                </div>
                <div class="botoes-modal">
                    <button type="button" class="btn-cancelar" onclick="fecharModal()">Cancelar</button>
                    <button type="button" class="btn-salvar" onclick="calendario.salvarEvento()">Salvar Evento</button>
                </div>
            </form>
        `;
        
        const selectThumbnail = document.getElementById('eventoThumbnail');
        const previewDiv = document.getElementById('thumbnailsPrevia');
        
        const mostrarPreview = () => {
            const selecionada = selectThumbnail.value;
            previewDiv.innerHTML = '';
            
            if (selecionada) {
                previewDiv.innerHTML = `
                    <div class="thumbnail-selecionada">
                        <img src="${selecionada}" alt="Thumbnail selecionada">
                        <small>${selecionada.split('/').pop()}</small>
                    </div>
                `;
            }
        };
        
        selectThumbnail.addEventListener('change', mostrarPreview);
        mostrarPreview();
        
        const inputTitulo = document.getElementById('eventoTituloNovo');
        if (inputTitulo) {
            inputTitulo.focus();
        }
    }
    
    mostrarFormularioEditar(index) {
        const eventos = this.gestorEventos.getEventosPorData(
            this.diaSelecionado.ano, 
            this.diaSelecionado.mes, 
            this.diaSelecionado.dia
        );
        
        if (!eventos[index]) return;
        
        this.eventoEditandoIndex = index;
        const evento = eventos[index];
        const dataFormatada = `${this.diaSelecionado.dia.toString().padStart(2, '0')}/${(this.diaSelecionado.mes + 1).toString().padStart(2, '0')}/${this.diaSelecionado.ano}`;
        
        const modalConteudo = document.querySelector('.modal-conteudo');
        const thumbnails = this.gestorEventos.getThumbnails();
        
        const opcoesThumbnails = thumbnails.map(img => 
            `<option value="${img}" ${evento.imagem === img ? 'selected' : ''}>${img.split('/').pop()}</option>`
        ).join('');
        
        modalConteudo.innerHTML = `
            <h3 class="modal-titulo">Editar Evento - ${dataFormatada}</h3>
            <form class="form-evento" id="formEventoEditar">
                <div class="form-grupo">
                    <label for="eventoTituloEditar">Título do Evento:</label>
                    <input type="text" id="eventoTituloEditar" required value="${evento.titulo}">
                </div>
                <div class="form-grupo">
                    <label for="eventoDescricaoEditar">Descrição:</label>
                    <textarea id="eventoDescricaoEditar">${evento.descricao || ''}</textarea>
                </div>
                <div class="form-grupo">
                    <label for="eventoThumbnailEditar">Escolha uma thumbnail:</label>
                    <select id="eventoThumbnailEditar" class="select-thumbnail">
                        <option value="">Sem thumbnail</option>
                        ${opcoesThumbnails}
                    </select>
                    <div class="thumbnails-previa" id="thumbnailsPreviaEditar"></div>
                </div>
                <div class="botoes-modal">
                    <button type="button" class="btn-cancelar" onclick="calendario.cancelarEdicao()">Cancelar</button>
                    <button type="button" class="btn-salvar" onclick="calendario.salvarEventoEditado()">Atualizar Evento</button>
                </div>
            </form>
        `;
        
        const selectThumbnail = document.getElementById('eventoThumbnailEditar');
        const previewDiv = document.getElementById('thumbnailsPreviaEditar');
        
        const mostrarPreview = () => {
            const selecionada = selectThumbnail.value;
            previewDiv.innerHTML = '';
            
            if (selecionada) {
                previewDiv.innerHTML = `
                    <div class="thumbnail-selecionada">
                        <img src="${selecionada}" alt="Thumbnail selecionada">
                        <small>${selecionada.split('/').pop()}</small>
                    </div>
                `;
            }
        };
        
        selectThumbnail.addEventListener('change', mostrarPreview);
        mostrarPreview();
        
        const inputTitulo = document.getElementById('eventoTituloEditar');
        if (inputTitulo) {
            inputTitulo.focus();
        }
    }
    
    editarEvento(index) {
        this.mostrarFormularioEditar(index);
    }
    
    cancelarEdicao() {
        this.eventoEditandoIndex = null;
        this.mostrarModalEventos(this.diaSelecionado.dia);
    }
    
    salvarEvento() {
        if (!this.diaSelecionado) return;
        
        const tituloInput = document.getElementById('eventoTituloNovo');
        const descricaoInput = document.getElementById('eventoDescricaoNovo');
        const thumbnailSelect = document.getElementById('eventoThumbnail');
        
        if (!tituloInput || !descricaoInput || !thumbnailSelect) return;
        
        const titulo = tituloInput.value.trim();
        const descricao = descricaoInput.value.trim();
        const imagem = thumbnailSelect.value.trim();
        
        if (!titulo) {
            alert('Por favor, insira um título para o evento.');
            tituloInput.focus();
            return;
        }
        
        this.gestorEventos.adicionarEvento(
            this.diaSelecionado.ano,
            this.diaSelecionado.mes,
            this.diaSelecionado.dia,
            {
                titulo: titulo,
                descricao: descricao,
                imagem: imagem
            }
        );
        
        this.renderizarCalendario();
        this.mostrarModalEventos(this.diaSelecionado.dia);
    }
    
    salvarEventoEditado() {
        if (!this.diaSelecionado || this.eventoEditandoIndex === null) return;
        
        const tituloInput = document.getElementById('eventoTituloEditar');
        const descricaoInput = document.getElementById('eventoDescricaoEditar');
        const thumbnailSelect = document.getElementById('eventoThumbnailEditar');
        
        if (!tituloInput || !descricaoInput || !thumbnailSelect) return;
        
        const titulo = tituloInput.value.trim();
        const descricao = descricaoInput.value.trim();
        const imagem = thumbnailSelect.value.trim();
        
        if (!titulo) {
            alert('Por favor, insira um título para o evento.');
            tituloInput.focus();
            return;
        }
        
        this.gestorEventos.editarEvento(
            this.diaSelecionado.ano,
            this.diaSelecionado.mes,
            this.diaSelecionado.dia,
            this.eventoEditandoIndex,
            {
                titulo: titulo,
                descricao: descricao,
                imagem: imagem
            }
        );
        
        this.eventoEditandoIndex = null;
        this.renderizarCalendario();
        this.mostrarModalEventos(this.diaSelecionado.dia);
    }
    
    removerEvento(index) {
        if (confirm('Tem certeza que deseja remover este evento?')) {
            this.gestorEventos.removerEvento(
                this.diaSelecionado.ano,
                this.diaSelecionado.mes,
                this.diaSelecionado.dia,
                index
            );
            this.mostrarModalEventos(this.diaSelecionado.dia);
            this.renderizarCalendario();
        }
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
        this.eventoEditandoIndex = null;
    }
}

let calendario;

function mudarMes(direcao) {
    if (calendario) calendario.mudarMes(direcao);
}

function irParaHoje() {
    if (calendario) calendario.irParaHoje();
}

function fecharModal() {
    if (calendario) calendario.fecharModal();
}

function inscreverNoEventoModal(eventoId, eventoTitulo) {
    localStorage.setItem('eventoSelecionado', eventoTitulo);
    localStorage.setItem('eventoSelecionadoId', eventoId);
    window.location.href = 'incricoes.html';
}

function adicionarEventoManual(dataString, titulo, descricao, imagemUrl) {
    if (calendario) {
        return calendario.gestorEventos.adicionarEventoManual(dataString, titulo, descricao, imagemUrl);
    }
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    calendario = new Calendario();
});