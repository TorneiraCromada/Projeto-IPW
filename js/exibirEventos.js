class ExibidorEventos {
    constructor() {
        console.log("ExibidorEventos inicializado");
        try {
            this.gestorEventos = new GerenciadorEventos();
            console.log("Gestor de eventos criado:", this.gestorEventos);
            this.container = document.getElementById('artigoConteiner');
            
            if (!this.container) {
                console.error("Elemento 'artigoConteiner' não encontrado!");
            }
        } catch (error) {
            console.error("Erro ao criar ExibidorEventos:", error);
        }
    }
    
    formatarData(chaveData) {
        console.log("Formatando data:", chaveData);
        const [ano, mes, dia] = chaveData.split('-').map(Number);
        const data = new Date(ano, mes, dia);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return data.toLocaleDateString('pt-BR', options);
    }
    
    renderizarEventos() {
        console.log("Renderizando eventos...");
        
        if (!this.container || !this.gestorEventos) {
            console.error("Container ou gestor de eventos não disponível");
            return;
        }
        
        if (typeof this.gestorEventos.getTodosEventos !== 'function') {
            console.error("Método getTodosEventos não existe no gestorEventos");
            console.log("Métodos disponíveis:", Object.getOwnPropertyNames(Object.getPrototypeOf(this.gestorEventos)));
            
            this.renderizarEventosFallback();
            return;
        }
        
        const todosEventos = this.gestorEventos.getTodosEventos();
        console.log("Eventos encontrados:", todosEventos);
        
        if (!todosEventos || todosEventos.length === 0) {
            console.log("Nenhum evento encontrado");
            this.container.innerHTML = `
                <div class="sem-eventos">
                    <i class="fas fa-calendar-times fa-3x"></i>
                    <h3>Nenhum evento cadastrado ainda</h3>
                    <p>Volte ao calendário para adicionar eventos!</p>
                    <a href="calendario.html" class="btn-calendario">
                        <i class="fas fa-calendar-alt"></i> Ir para o Calendário
                    </a>
                </div>
            `;
            return;
        }
        
        this.container.innerHTML = '';
        
        todosEventos.forEach((evento, index) => {
            console.log(`Processando evento ${index}:`, evento);
            const dataFormatada = this.formatarData(evento.chaveData || `${evento.ano}-${evento.mes}-${evento.dia}`);
            const artigo = document.createElement('article');
            artigo.className = 'artigo';
            
            const eventoId = evento.id || `evento-${Date.now()}-${index}`;
            
            artigo.innerHTML = `
                <figure>
                    <img src="${evento.imagem || 'imgs/tempImg.png'}" alt="${evento.titulo}" 
                         onerror="this.src='imgs/tempImg.png'">
                </figure>
                <div class="artigo-conteudo">
                    <h3>${evento.titulo}</h3>
                    <div class="evento-inscritos">
                        <i class="fas fa-users"></i>
                        <span>${evento.inscritos || 0} inscritos</span>
                    </div>
                    <p class="evento-data"><i class="fas fa-calendar-day"></i> ${dataFormatada}</p>
                    <p class="evento-descricao">${evento.descricao || 'Sem descrição'}</p>
                    <div class="evento-acoes">
                        <button class="btn-inscrever" onclick="inscreverNoEvento('${eventoId}', '${evento.titulo.replace(/'/g, "\\'")}')">
                            <i class="fas fa-user-plus"></i> Inscrever-se
                        </button>
                    </div>
                </div>
            `;
            
            this.container.appendChild(artigo);
        });
        
        console.log("Eventos renderizados com sucesso!");
    }
    
    renderizarEventosFallback() {
        console.log("Usando fallback para renderizar eventos");
        
        const eventosSalvos = localStorage.getItem('greenDateEventos');
        console.log("Eventos no localStorage (fallback):", eventosSalvos);
        
        if (!eventosSalvos || eventosSalvos === "{}" || eventosSalvos === "null") {
            this.container.innerHTML = `
                <div class="sem-eventos">
                    <h3>Nenhum evento cadastrado ainda</h3>
                    <p>Adicione eventos pelo calendário primeiro!</p>
                    <a href="calendario.html" class="btn-calendario">
                        Ir para o Calendário
                    </a>
                </div>
            `;
            return;
        }
        
        try {
            const eventos = JSON.parse(eventosSalvos);
            console.log("Eventos parseados (fallback):", eventos);
            
            this.container.innerHTML = '';
            
            let contador = 0;
            for (const chaveData in eventos) {
                if (chaveData === "eventosPadrao") continue;
                
                const eventosDoDia = eventos[chaveData];
                if (!Array.isArray(eventosDoDia)) continue;
                
                eventosDoDia.forEach(evento => {
                    const [ano, mes, dia] = chaveData.split('-').map(Number);
                    const data = new Date(ano, mes, dia);
                    const dataFormatada = data.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    
                    const artigoHTML = `
                        <article class="artigo">
                            <figure>
                                <img src="${evento.imagem || 'imgs/tempImg.png'}" alt="${evento.titulo}">
                            </figure>
                            <div class="artigo-conteudo">
                                <h3>${evento.titulo}</h3>
                                <p class="evento-data">📅 ${dataFormatada}</p>
                                <p class="evento-descricao">${evento.descricao || 'Sem descrição'}</p>
                                <div class="evento-acoes">
                                    <button class="btn-inscrever" onclick="inscreverNoEvento('${evento.id || evento.titulo}', '${evento.titulo.replace(/'/g, "\\'")}')">
                                        Inscrever-se
                                    </button>
                                </div>
                            </div>
                        </article>
                    `;
                    
                    this.container.innerHTML += artigoHTML;
                    contador++;
                });
            }
            
            if (contador === 0) {
                this.container.innerHTML = `
                    <div class="sem-eventos">
                        <h3>Nenhum evento encontrado</h3>
                        <p>Os eventos no localStorage não estão no formato esperado.</p>
                    </div>
                `;
            }
            
            console.log(`${contador} eventos renderizados via fallback`);
            
        } catch (error) {
            console.error("Erro no fallback:", error);
            this.container.innerHTML = `
                <div class="sem-eventos">
                    <h3>Erro ao carregar eventos</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

function inscreverNoEvento(eventoId, eventoTitulo) {
    localStorage.setItem('eventoSelecionado', eventoTitulo);
    localStorage.setItem('eventoSelecionadoId', eventoId);
    
    window.location.href = 'incricoes.html';
}

if (!document.querySelector('link[href*="font-awesome"]')) {
    console.warn("Font Awesome não encontrado! Adicionando...");
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(link);
}

window.addEventListener('error', function(e) {
    console.error('Erro detectado:', e.message, 'em', e.filename, 'linha', e.lineno);
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM carregado, inicializando ExibidorEventos");
    const exibidor = new ExibidorEventos();
    exibidor.renderizarEventos();
});