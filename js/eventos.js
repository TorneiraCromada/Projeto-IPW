class GerenciadorEventos {
    constructor() {
        this.eventos = this.carregarEventos();
        this.inscricoes = this.carregarInscricoes();
        this.thumbnails = [
            "imgs/background/bg1.jpg",
            "imgs/background/bg2.jpg", 
            "imgs/background/bg3.jpg",
            "imgs/background/bg4.jpg",
            "imgs/background/bg5.jpg",
            "imgs/background/bg6.jpg",
            "imgs/background/bg7.jpg",
            "imgs/background/bg8.jpg",
            "imgs/background/bg9.jpg",
            "imgs/background/bg10.jpg"
        ];
    }
    
    getThumbnails() {
        return this.thumbnails;
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
                        id: 1,
                        titulo: "🌿 Reunião de Planejamento", 
                        descricao: "Discussão dos próximos eventos ambientais",
                        imagem: "imgs/background/bg1.jpg"
                    }
                ],
                [`${ano}-${mes}-${hoje.getDate() + 3}`]: [
                    { 
                        id: 2,
                        titulo: "♻️ Coleta Seletiva", 
                        descricao: "Coleta de materiais recicláveis no centro",
                        imagem: "imgs/background/bg2.jpg"
                    }
                ]
            };
        }
        
        return JSON.parse(eventosSalvos);
    }
    
    carregarInscricoes() {
        const inscricoesSalvas = localStorage.getItem('greenDateInscricoes');
        return inscricoesSalvas ? JSON.parse(inscricoesSalvas) : {};
    }
    
    salvarEventos() {
        localStorage.setItem('greenDateEventos', JSON.stringify(this.eventos));
    }
    
    salvarInscricoes() {
        localStorage.setItem('greenDateInscricoes', JSON.stringify(this.inscricoes));
    }
    
    getEventosPorData(ano, mes, dia) {
        const chave = `${ano}-${mes}-${dia}`;
        if (this.eventos[chave]) {
            return this.eventos[chave];
        }
        return [];
    }
    
    getTodosEventos() {
        const todosEventos = [];
        
        for (const chave in this.eventos) {
            if (chave !== "eventosPadrao") {
                const eventosDoDia = this.eventos[chave];
                if (Array.isArray(eventosDoDia)) {
                    eventosDoDia.forEach(evento => {
                        const eventoCompleto = {
                            ...evento,
                            chaveData: chave,
                            inscritos: this.getNumeroInscritos(evento.id || evento.titulo)
                        };
                        todosEventos.push(eventoCompleto);
                    });
                }
            }
        }
        
        return todosEventos;
    }
    
    getInscricoesPorEvento(eventoId) {
        return this.inscricoes[eventoId] || [];
    }
    
    getNumeroInscritos(eventoId) {
        const inscricoes = this.getInscricoesPorEvento(eventoId);
        return inscricoes.length;
    }
    
    adicionarEvento(ano, mes, dia, evento) {
        const chave = `${ano}-${mes}-${dia}`;
        if (!this.eventos[chave]) this.eventos[chave] = [];
        
        evento.data = new Date();
        evento.dia = dia;
        evento.mes = mes;
        evento.ano = ano;
        evento.id = Date.now();
        
        this.eventos[chave].push(evento);
        this.salvarEventos();
        return evento;
    }
    
    adicionarInscricao(eventoId, dadosInscricao) {
        if (!this.inscricoes[eventoId]) {
            this.inscricoes[eventoId] = [];
        }
        
        dadosInscricao.data = new Date();
        dadosInscricao.id = Date.now();
        this.inscricoes[eventoId].push(dadosInscricao);
        this.salvarInscricoes();
        return dadosInscricao;
    }
    
    editarEvento(ano, mes, dia, index, novosDados) {
        const chave = `${ano}-${mes}-${dia}`;
        if (this.eventos[chave] && this.eventos[chave][index]) {
            this.eventos[chave][index] = {
                ...this.eventos[chave][index],
                ...novosDados
            };
            this.salvarEventos();
            return true;
        }
        return false;
    }
    
    removerEvento(ano, mes, dia, index) {
        const chave = `${ano}-${mes}-${dia}`;
        if (this.eventos[chave] && this.eventos[chave][index]) {
            this.eventos[chave].splice(index, 1);
            if (this.eventos[chave].length === 0) {
                delete this.eventos[chave];
            }
            this.salvarEventos();
            return true;
        }
        return false;
    }
    
    adicionarEventoManual(dataString, titulo, descricao, imagemUrl) {
        const [dia, mes, ano] = dataString.split('/').map(Number);
        const mesIndex = mes - 1;
        
        return this.adicionarEvento(ano, mesIndex, dia, {
            titulo: titulo,
            descricao: descricao,
            imagem: imagemUrl
        });
    }
}