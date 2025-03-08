require('dotenv').config();
const tmi = require('tmi.js');

const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)\s*(.*)?/);

const nishFalas = JSON.parse(process.env.NISH_FALAS || "[]");

// Armazena os usuários ativos e seus tempos de última mensagem
const activeUsers = new Map();

// Função que limpa usuários inativos há mais de 30 minutos
function cleanInactiveUsers() {
    const now = Date.now();
    for (const [user, timestamp] of activeUsers) {
        if (now - timestamp > 10 * 60 * 1000) {
            activeUsers.delete(user);
        }
    }
}

// Agenda a limpeza automática a cada 5 minutos
setInterval(cleanInactiveUsers, 5 * 60 * 1000);

const commands = {
    site: {
        response: 'https://nothing.fish'
    },
    upvote: {
        response: (user) => `Successfully upvoted ${user}`
    },
    Nish: {
        response: () => {
            if (nishFalas.length === 0) return "Nenhuma fala cadastrada!";
            const randomIndex = Math.floor(Math.random() * nishFalas.length);
            return nishFalas[randomIndex];
        }
    },
    Quem: {
        response: (argument) => {
            const users = Array.from(activeUsers.keys());
            if (users.length === 0) {
                return "Não há usuários suficientes para escolher.";
            }

            const randomUser = users[Math.floor(Math.random() * users.length)];
            return `@${randomUser} ${argument}`;
        }
    }
};

const cooldowns = {};

const client = new tmi.Client({
    connection: { reconnect: true },
    channels: [ 'fishnothing','Ars_Arcanum_' ],
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    },
});

client.connect();

client.on('message', async (channel, context, message) => {
    const username = context.username.toLowerCase();

    // Adiciona usuário à lista de ativos
    activeUsers.set(username, Date.now());

    const match = message.match(regexpCommand);
    if (!match) return;

    const [raw, command, argument] = match;

    const now = Date.now();
    const cooldownTime = 30 * 1000;

    if (cooldowns[command] && now - cooldowns[command] < cooldownTime) {
        console.log(`Comando !${command} em cooldown.`);
        return;
    }

    cooldowns[command] = now;

    if (commands[command]) {
        let responseMessage = commands[command].response;
        if (typeof responseMessage === 'function') {
            responseMessage = responseMessage(argument);
        }

        if (responseMessage) {
            console.log(`Respondendo ao comando !${command}`);
            console.log(responseMessage);
            client.say(channel, responseMessage);
        }
    }
});
