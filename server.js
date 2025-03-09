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

const commandExceptions = [
    "lastseen",
    "fight",
    "giveaway",
    "chatstats",
    "leaderboard",
    "commands",
    "wrongsong",
    "bet",
    "tip",
    "uptime",
    "when",
    "emotes",
    "accountage",
    "quote",
    "enter",
    "top",
    "watchtime",
    "items",
    "contest",
    "redeem",
    "points",
    "disablesfx",
    "openstore",
    "closestore",
    "timer",
    "docs",
    "removesong",
    "editcounter",
    "command",
    "ping",
    "permit",
    "skip",
    "enablesfx",
    "kappagen",
    "hypecup",
    "setgame",
    "nukeuser",
    "module",
    "bot",
    "level",
    "nuke",
    "setpoints",
    "addpoints",
    "filesay",
    "settitle",
    "7tv",
    "ADTHON",
    "ASA",
    "BOSSRUSH",
    "COD",
    "DLSS",
    "Mabi",
    "Nitro",
    "Nord",
    "OV",
    "OperaGX",
    "PRIMEBARATO",
    "RAJANG",
    "SBR2",
    "SBT",
    "SOL",
    "SUB",
    "SUBtember",
    "SUNBREAK",
    "Stanley",
    "Starfield",
    "TANGIA",
    "VPN",
    "addcmd",
    "ads",
    "ajuda",
    "alatreon",
    "ali",
    "amazon",
    "amigato",
    "apoio",
    "arena",
    "armas",
    "armor",
    "arte",
    "aspirador",
    "bellwright",
    "botuptime",
    "browser",
    "sqaud",
    "btag",
    "cadeira",
    "cafeteira",
    "camera",
    "chinelo",
    "codboys",
    "commands", 
    "config", 
    "coreia",
    "crash", "cyberfish", "database", "delcmd", "dente", "digitalvibrance", "dinheiro",
    "discord", "dodge", "doom", "drop", "drops", "eddy", "edit",
    "efeitos", "efeitosoff", "egirldetonandomonstrosaovivopoggers", "emotes", "emoticons", "engaja", "entenda",
    "eventos", "expeditionagartha", "fc", "fight", "filmes", "fishverso",
    "fone", "fortnite", "fov", "fruta", "game", "gamepass", "gear",
    "geo", "gift", "giveprime", "gmg", "grupo", "guilda", "headset",
    "hogwarts", "honkai", "horario", "hud", "hunterpie", "id", "iddesativado",
    "impressora", "insta", "intro", "jc", "jogo", "jogogratis", "kabum",
    "kokorocloverseason1", "latrel", "layeredweapon", "live", "lolja", "lucky", "maratona",
    "mesa", "meta", "mhw", "mic", "mods", "moments", "mouse", "nintendo", "niver", "nome",
    "nuke", "onlyfans", "outro", "pak", "pato", "pc", "perifericos", "permit", "pesquisa",
    "piruka", "pix", "pixel", "plantas", "playlist", "plus", "portugues", "presente", "prime",
    "rank", "re", "reembolso", "reframework", "reshade", "revanche", "riot", "rodar", "rpg",
    "server", "setanavida", "setcmd", "setgame", "settitle", "site", "skin", "slowmotion",
    "song", "songlist", "sorteio", "spam", "steam", "surpresa", "survivormercs", "t", "tag",
    "taskbar", "tdah", "teclado", "teclado2", "temperatura", "test", "testando", "testh",
    "traduzir", "tv", "twitch", "ui", "ultra", "uniforme", "ventilador", "video", "volante",
    "wiki", "wild", "wirebug", "youtube", "yt", "zombiewithin"

];

const cooldowns = {};


// Agenda a limpeza automática a cada 5 minutos
setInterval(cleanInactiveUsers, 5 * 60 * 1000);

const commands = {
    alguem: {
        response: () => {
            const users = Array.from(activeUsers.keys());
            if (users.length === 0) {
                return "Não há usuários suficientes para escolher.";
            }

            const randomUser = users[Math.floor(Math.random() * users.length)];
            return `:point_right: @${randomUser}`;
        },
        reply: true
    },
    
    decisao:{
        response: (argument) => {
            try{
                opcoes = argument.split(" ou ");
                if(opcoes.length < 2){
                    cooldowns['decisao'] = 0;
                    return "Por favor, informe pelo menos duas opções separadas por 'ou'.";
                }
                const randomIndex = Math.floor(Math.random() * opcoes.length);
                return `${opcoes[randomIndex]} ganhou!`;
            } catch(e){
                return "Erro ao processar a decisão. Exemplo de uso: !decisao opção1 ou opção2";
            }
            
        },
        reply: true
    },
    treta: {
        response: '@FISHNOTHING Mano, eu lembro de você q vc se em alguma treta, qual foi mesmo? kkkkkkkkk Ha algums anos atras, lembro que veio muitas pessoas te xingar eu acho',
        reply: false
    },
    nish: {
        response: () => {
            if (nishFalas.length === 0) return "Nenhuma fala cadastrada!";
            const randomIndex = Math.floor(Math.random() * nishFalas.length);
            return nishFalas[randomIndex];
        },
        reply: false
    },
    quem: {
        response: (argument) => {
            try{
                const users = Array.from(activeUsers.keys());
                if (users.length === 0) {
                    return "Não há usuários suficientes para escolher.";
                }
                if(argument.slice(-1) === "?"){
                    argument = argument.slice(0, -1);
                }
                const randomUser = users[Math.floor(Math.random() * users.length)];
                return `@${randomUser} ${argument}`;
            }catch(e){
                cooldowns['quem'] = 0;
                return "Erro ao processar comando. Exemplo de uso: !quem vai dar 100 sub gifts hoje?";
            }
            
        },
        reply: true
    },
    qualquercoisa: {
        response: (command) => {
            return;
        },
        reply: false
    }
};




const client = new tmi.Client({
    connection: { reconnect: true },
    channels: ['FISHNOTHING'],
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    },
});

client.connect();

client.on('message', async (channel, context, message, self) => {
    if (self) return;
    const formatedUsername = context.username;
    const username = context.username.toLowerCase();

    // Adiciona usuário à lista de ativos
    activeUsers.set(username, Date.now());

    const match = message.match(regexpCommand);
    if (!match) return;

    const [raw, command, argument] = match;
    console.log(match);

    if (commandExceptions.includes(command)) {
        console.log(`Comando !${command} comando de outro bot.`);
        return;
    }


    const now = Date.now();
    const cooldownTime = 30 * 1000;

    if (!commands[command.toLowerCase()]) {
        if (cooldowns['qualquercoisa'] && now - cooldowns['qualquercoisa'] < cooldownTime) {
            console.log(`Comando !qualquercoisa em cooldown.`);
            return;
        }
    } else if (cooldowns[command.toLowerCase()] && now - cooldowns[command.toLowerCase()] < cooldownTime) {
        console.log(`Comando !${command.toLowerCase()} em cooldown.`);
        return;
    }

    if (commands[command.toLowerCase()]) {
        cooldowns[command.toLowerCase()] = now
        
    } else {
        cooldowns['qualquercoisa'] = now;
    }
 
    // Respondendo
    if (commands[command.toLowerCase()]) {
        console.log('aquiu');
        let responseMessage = commands[command.toLowerCase()].response;
        if (typeof responseMessage === 'function') {
            responseMessage = responseMessage(argument, formatedUsername);
        }
        // Decisão reply
        if (responseMessage) {
            console.log(`Respondendo ao comando !${command.toLowerCase()}`);
            console.log(responseMessage);
            if(commands[command.toLowerCase()].reply) {
                client.say(channel, responseMessage, { 'reply-parent-msg-id': context.id });
            }else{
                client.say(channel, responseMessage);
            }
        }
    } else {
        console.log('aqui2');
    }
});
