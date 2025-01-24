const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const execSync = require('child_process').execSync; // Para instalar dependências automaticamente

// Função para instalar dependências automaticamente
function instalarDependencias() {
    try {
        console.log('Verificando dependências...');
        execSync('npm install whatsapp-web.js qrcode-terminal', { stdio: 'inherit' });
        console.log('Dependências instaladas com sucesso!');
    } catch (error) {
        console.error('Erro ao instalar dependências:', error.message);
        process.exit(1);
    }
}

// Verificar e instalar dependências antes de inicializar o bot
instalarDependencias();

// Inicializa o cliente do WhatsApp Web com autenticação persistente
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'bot' }) // Persistência do login
});

// Evento de QR Code - Exibe no terminal
client.on('qr', (qr) => {
    console.log('🔄 Gerando QR Code... Escaneie no WhatsApp para conectar:');
    qrcode.generate(qr, { small: true }); // Exibe o QR Code no terminal
});

// Evento quando o cliente está pronto
client.on('ready', () => {
    console.log('✅ Bot conectado com sucesso!');
});

// Evento de autenticação falha
client.on('auth_failure', (msg) => {
    console.error('❌ Erro de autenticação:', msg);
});

// Evento de desconexão
client.on('disconnected', (reason) => {
    console.error('⚠️ Cliente desconectado:', reason);
    console.log('🔄 Tentando reconectar...');
    client.initialize(); // Recomeça o cliente
});

// Evento de mensagens recebidas
client.on('message', (message) => {
    console.log(`📩 Mensagem recebida de ${message.from}: ${message.body}`);
    if (message.body.toLowerCase() === 'oi') {
        message.reply('Olá! Tudo bem? Aqui está minha resposta automática!');
    } else {
        message.reply('Desculpe, não entendi sua mensagem.');
    }
});

// Evento de mudança de status de conexão
client.on('change_state', (state) => {
    console.log(`📡 Status de conexão: ${state}`);
    if (state === 'CONNECTED') {
        console.log('✅ Bot está online.');
    } else if (state === 'TIMEOUT') {
        console.error('⚠️ Problema de latência detectado.');
    }
});

// Inicializa o cliente e registra eventos adicionais
client.initialize();
console.log('🚀 Iniciando o bot... Aguarde o QR Code no terminal.');

// Adicionar tratamento para erros inesperados
process.on('uncaughtException', (err) => {
    console.error('❗ Erro inesperado:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❗ Rejeição não tratada:', reason);
});
