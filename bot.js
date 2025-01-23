const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');

// Configuração do Express
const app = express();
const port = process.env.PORT || 3000;
const pageName = '82y73t62ftf63fr636333231223';

let qrCodeURL = null; // Variável para armazenar o QR Code

// Inicializa o cliente do WhatsApp Web
const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
    console.log('QR recebido:', qr);
    qrcode.toDataURL(qr, (err, url) => {
        if (!err) {
            qrCodeURL = url;
            console.log('QR Code atualizado.');
        }
    });
});

client.on('ready', () => {
    console.log('O cliente está pronto!');
    qrCodeURL = null; // Desativar o QR Code depois de conectar
});

// Função para responder mensagens
client.on('message', (message) => {
    console.log(`Mensagem recebida de ${message.from}: ${message.body}`);
    message.reply('Oi, tudo bem? Aqui está minha resposta automática!');
});

// Configuração da rota para o QR Code
app.get(`/${pageName}`, (req, res) => {
    if (qrCodeURL) {
        res.send(`
            <html>
                <body style="text-align: center; font-family: Arial;">
                    <h1>Escaneie o QR Code para conectar</h1>
                    <img src="${qrCodeURL}" alt="QR Code" />
                    <p>Este QR Code expira automaticamente após o uso.</p>
                </body>
            </html>
        `);
    } else {
        res.status(404).send(`
            <html>
                <body style="text-align: center; font-family: Arial;">
                    <h1>QR Code expirado ou já conectado!</h1>
                    <p>Por favor, reinicie o bot para gerar um novo QR Code.</p>
                </body>
            </html>
        `);
    }
});

// Inicializa o cliente do WhatsApp e o servidor
client.initialize();
app.listen(port, () => {
    console.log(`Servidor rodando em: http://localhost:${port}/${pageName}`);
});
