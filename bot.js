const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const execSync = require('child_process').execSync; // Para instalar dependências automaticamente
const crypto = require('crypto');

// Função para instalar dependências automaticamente
function instalarDependencias() {
    try {
        console.log('Verificando dependências...');
        execSync('npm install whatsapp-web.js qrcode express', { stdio: 'inherit' });
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

// Configuração do servidor Express para exibir o QR Code
const app = express();
let qrCodeUrl = null; // Variável para armazenar o QR Code gerado
let qrCodeTimeout = null; // Timeout para expiração do QR Code

// Função para gerar um nome aleatório para a página
function gerarNomeAleatorio() {
    return crypto.randomBytes(10).toString('hex');
}

// Rota para exibir o QR Code dinamicamente em uma página única
app.get('/:dynamicPath', (req, res) => {
    const dynamicPath = req.params.dynamicPath;

    if (qrCodeUrl) {
        res.send(`
            <html>
                <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
                    <h1>Escaneie o QR Code para conectar ao WhatsApp</h1>
                    <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 300px; height: auto;" />
                    <p style="margin-top: 20px; font-size: 18px; color: #888;">Escaneie o código para conectar o bot. Após a conexão, o bot responderá automaticamente!</p>
                </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
                <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
                    <h1>O QR Code expirou ou o site está fora do ar.</h1>
                    <p style="font-size: 18px; color: #888;">Tente novamente mais tarde.</p>
                </body>
            </html>
        `);
    }
});

// Rota para uma página personalizada
app.get('/', (req, res) => {
    const pagePath = gerarNomeAleatorio(); // Cria uma URL dinâmica para cada acesso
    res.send(`
        <html>
            <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif;">
                <h1>Bem-vindo ao Bot de Atendimento</h1>
                <p style="font-size: 18px; color: #555;">Clique no link abaixo para conectar ao bot.</p>
                <a href="/${pagePath}" style="font-size: 20px; color: #007BFF;">Conectar ao Bot</a>
            </body>
        </html>
    `);
});

// Inicializa o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🌐 Servidor iniciado em: http://localhost:${PORT}`);
});

// Evento de QR Code - Envia para o site
client.on('qr', async (qr) => {
    console.log('🔄 Gerando QR Code... Escaneie no WhatsApp para conectar:');
    qrCodeUrl = await qrcode.toDataURL(qr); // Gera a URL do QR Code para ser exibida no site
    console.log(`QR Code disponível em: http://localhost:${PORT}/${gerarNomeAleatorio()}`);

    // Configura timeout para remover o QR Code após expiração
    if (qrCodeTimeout) clearTimeout(qrCodeTimeout);
    qrCodeTimeout = setTimeout(() => {
        qrCodeUrl = null;
        console.log('⚠️ O QR Code expirou.');
    }, 60000); // Expira após 60 segundos
});

// Evento quando o cliente está pronto
client.on('ready', () => {
    console.log('✅ Bot conectado com sucesso!');
    qrCodeUrl = null; // Limpa o QR Code após a conexão
    if (qrCodeTimeout) clearTimeout(qrCodeTimeout);
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
        message.reply('Olá! Tudo bem? Como posso ajudar você hoje?');
    } else {
        message.reply('Desculpe, não entendi sua mensagem. Digite "oi" para começar.');
    }
});

// Inicializa o cliente e registra eventos adicionais
client.initialize();
console.log('🚀 Iniciando o bot... Aguarde o QR Code no site.');

// Adicionar tratamento para erros inesperados
process.on('uncaughtException', (err) => {
    console.error('❗ Erro inesperado:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❗ Rejeição não tratada:', reason);
});
