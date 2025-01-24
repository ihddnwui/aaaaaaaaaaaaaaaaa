const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const execSync = require('child_process').execSync; // Para instalar dependências automaticamente

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

// Configuração do servidor Express para exibir a página do QR Code
const app = express();
let qrCodeUrl = null; // Variável para armazenar o QR Code gerado

// Rota para exibir a página com o QR Code
app.get('/', (req, res) => {
    if (qrCodeUrl) {
        res.send(`
            <html>
                <head>
                    <title>WhatsApp Bot</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            background-color: #f0f0f0;
                        }
                        h1 {
                            color: #0078d4;
                        }
                        .qr-container {
                            background-color: white;
                            border-radius: 10px;
                            padding: 20px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        img {
                            max-width: 250px;
                            height: auto;
                        }
                    </style>
                </head>
                <body>
                    <h1>Escaneie o QR Code para conectar ao WhatsApp</h1>
                    <div class="qr-container">
                        <img src="${qrCodeUrl}" alt="QR Code" />
                    </div>
                </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
                <head>
                    <title>WhatsApp Bot</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            height: 100vh;
                            background-color: #f0f0f0;
                        }
                        h1 {
                            color: #0078d4;
                        }
                    </style>
                </head>
                <body>
                    <h1>Bot conectado com sucesso! Você pode agora usar o WhatsApp.</h1>
                </body>
            </html>
        `);
    }
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
    console.log(`QR Code disponível em: http://localhost:${PORT}`);

    // Redefine o QR Code a cada novo código
    setTimeout(() => {
        qrCodeUrl = null;
    }, 60000); // Expira após 60 segundos, como precaução
});

// Evento quando o cliente está pronto
client.on('ready', () => {
    console.log('✅ Bot conectado com sucesso!');
    qrCodeUrl = null; // Limpa o QR Code após a conexão
});

// Evento de desconexão
client.on('disconnected', (reason) => {
    console.error('⚠️ Cliente desconectado:', reason);
    console.log('🔄 Tentando reconectar...');
    client.initialize(); // Recomeça o cliente e mantém a conexão ativa
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
