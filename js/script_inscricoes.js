
document.addEventListener('DOMContentLoaded', function() {
    const eventoTitulo = localStorage.getItem('eventoSelecionado');
    const eventoInput = document.getElementById('evento');
    const id_event = localStorage.getItem('eventoSelecionadoId');
    const inscricoesSalvas = localStorage.getItem('greenDateInscricoes');
    var inscricoes = inscricoesSalvas ? JSON.parse(inscricoesSalvas) : {};
    
    if (eventoTitulo && eventoInput) {
        eventoInput.value = eventoTitulo;
    }
    
    const form = document.querySelector('.formulario');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nome = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('tlm').value;
            const evento = document.getElementById('evento').value;
            const info = document.getElementById('info').value;
            const inscri_info = [nome, email, telefone, evento, info];
            
            if (!evento || evento === "Insira o evento que se deseja inscrever em") {
                alert('Por favor, selecione um evento primeiro no calendário ou eventos.');
                return;
            }
            
            //Save das Inscrições
            if (!inscricoes[id_event]) inscricoes[id_event] = [];
            inscricoes[id_event].push(inscri_info);
            localStorage.setItem('greenDateInscricoes', JSON.stringify(inscricoes));

            
            console.log('Inscrição enviada:', {
                nome, email, telefone, evento, info,
                data: new Date()
            });
            
            alert('Inscrição enviada com sucesso!');
            form.reset();
            
            localStorage.removeItem('eventoSelecionado');
            localStorage.removeItem('eventoSelecionadoId');
        });
    }
});