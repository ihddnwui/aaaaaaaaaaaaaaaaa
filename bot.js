const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth()
});

// Função para delay aleatório
const delay = (min, max) => new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

client.on('qr', qr => {
    console.log('Escaneie o QR Code acima para conectar o bot.');
});

client.on('ready', () => {
    console.log('Bot conectado e pronto para uso!');
});

client.on('message', async msg => {
    // Se a mensagem for "Oi"
    if (msg.body.toLowerCase() === 'oi') {
        await msg.reply('E aí beleza, mano? Como é que você tá? Seja bem-vindo a mais um teste!');
    }
    // Se a pessoa perguntar "Como é que tu tá?"
    else if (msg.body.toLowerCase() === 'como é que tu tá?') {
        await msg.reply('Eu tô bem e você?');
    }
    // Se a pessoa responder "tá bem também"
    else if (msg.body.toLowerCase() === 'tá bem também') {
        await msg.reply('Que bom! E o que que você tá fazendo?');
    }
    // Se a pessoa perguntar "O que que você tá fazendo?"
    else if (msg.body.toLowerCase() === 'o que que você tá fazendo?') {
        await msg.reply('Eu tô programando aqui, tem uns códigos malucos acontecendo!');
    }
});

client.initialize();
