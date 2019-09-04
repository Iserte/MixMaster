/*
  Invite link
  https://discordapp.com/api/oauth2/authorize?client_id=481948746951688212&scope=bot&permissions=8
*/


// Importa os modulos do Discord.js e o arquivo de configuracao
const { Client, RichEmbed } = require('discord.js');

const { prefix, token, b7g } = require('./config.json');

// Cria uma nova instancia do Discord Client
const client = new Client();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  /*var botStatus = message.guild.members.get("481948746951688212").user.localPresence.status;
    
  if (botStatus == 'online') {
    console.log('bot online');
  } else {
    console.log('bot offline');
  }*/
  console.log('APLICACAO RODANDO...\n');
  console.log(`• ${client.users.size} usuários\n• ${client.channels.size} canais\n• ${client.guilds.size} servidores\n\n`);
  client.user.setActivity('!b7mix');
});

// Cria um listener pra quando alguma mensagem for recebida
client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();

  // COMANDO UTILIZADO PARA SORTEAR JOGADORES EM UM MIX DE CSGO!
  if ( command === 'b7mix' && message.guild.id === b7g.guild && message.guild.members.get(message.author.id).roles.has(b7g.b7Id) ) {
    
    mix(b7g);

  } else if ( command === 'a' && message.guild.id === b7g.guild && message.guild.members.get(message.author.id).roles.has(b7g.b7Id) ) {
    
    var aChannel = client.channels.get(`414994798001389579`);
    var bChannel = client.channels.get(`414997997970259970`);
    var cChannel = client.channels.get(`414997930802413570`);

    var i = 0;
    while (i < 100) {
      setTimeout( () => { message.guild.members.get('358454206279188493').setVoiceChannel(aChannel); }, 1000);
      
      setTimeout( () => { message.guild.members.get('358454206279188493').setVoiceChannel(bChannel); }, 1000);
      
      setTimeout( () => { message.guild.members.get('358454206279188493').setVoiceChannel(cChannel); }, 1000);
      i++;
    }

  } else if ( command === 'lobby' && message.guild.id === b7g.guild && message.guild.members.get(message.author.id).roles.has(b7g.b7Id) ) {
    
    moveToLobby(b7g);

  } else if (command === 'teste' /*&& message.guild.members.get(message.author.id).roles.has(b7g.adminId)*/ ) {
    var botStatus = message.guild.members.get("481948746951688212").user.localPresence.status;
    
    if (botStatus == 'online') {
      console.log('bot online');
    } else {
      console.log('bot offline');
    }

    //if (message.guild.members.get("481948746951688212")) {
    //  self.exit();
    //}

  }

  function mix(guild) {
    var lobbyChannel = client.channels.get(`${guild.lobby}`);
    var currentMembers = lobbyChannel.members.map(m=>m.user);
    console.log(`TODOS_JOGADORES: ${currentMembers}\n`);
    if (currentMembers.length < 2) {
      return message.channel.send(`Poucos jogadores no canal **${lobbyChannel.name}**`);
    } else {
      var resultArrayA = [];
      var resultArrayB = [];
      var tempN = 0;
      var teamA = [];
      var teamB = [];
      var maxMembers = currentMembers.length > 10 ? 10 : currentMembers.length;
  
      // Sorteia o Time A de acordo com o total de pessoas
      while ( resultArrayA.length < maxMembers / 2 ) {
        tempN = Math.floor(Math.random() * currentMembers.length );
        if ( !resultArrayA.includes(tempN) ) {
          resultArrayA.push(tempN);
        }
      }

      // Sorteia o Time B de acordo com as pessoas restantes
      while ( resultArrayB.length < ( maxMembers - resultArrayA.length )) {
        tempN = Math.floor(Math.random() * currentMembers.length );
        if ( !resultArrayA.includes(tempN) && !resultArrayB.includes(tempN) ) {
          resultArrayB.push(tempN);
        }
      }
      
      // Separa o Time A
      for (n in resultArrayA) {
        tempN = resultArrayA[n];
        teamA.push(currentMembers[tempN]);
        message.guild.members.get(teamA[n].id).setVoiceChannel(guild.teamA);
      }
      console.log(`TIME_A: ${teamA}`);

      // Separa o Time B
      for (n in resultArrayB) {
        tempN = resultArrayB[n];
        teamB.push(currentMembers[tempN]);
        message.guild.members.get(teamB[n].id).setVoiceChannel(guild.teamB);
      }
      console.log(`TIME_B: ${teamB}`);
  
      
      const embed = new RichEmbed()
        .setColor('#0099ff')
        .setAuthor('Gamersclub', 'https://i.imgur.com/ZtVVIFY.png', 'https://gamersclub.com.br/lobby')
        .setDescription('Clique acima para criar o lobby!')
        .setThumbnail('https://i.imgur.com/bpd9aML.png')
        .addBlankField()
        .addField('TIME A', `${teamA.map(m => m+'\n').join('')}`, true)  // TODO: Fazer com que os times se completem dinamicamente.
        .addField('TIME B', `${teamB.map(m => m+'\n').join('')}`, true)   // TODO: Fazer com que os times se completem dinamicamente.
        .addBlankField()
        .setTimestamp()
        .setFooter("Developed by Iserte", 'https://cdn.discordapp.com/avatars/206075563410980866/d63207bc9766c4da9e0bf56373084711.png');
      message.channel.send(embed);
  
    }
  }

  function moveToLobby(guild) {
    // Recupera o ID dos times A e B
    var teamAChannel = client.channels.get(`${guild.teamA}`);
    var teamBChannel = client.channels.get(`${guild.teamB}`);

    // Adiciona todos os membros dos times em um unico array
    var currentMembers = (teamAChannel.members.map(m=>m.user)).concat(teamBChannel.members.map(m=>m.user));

    // Move os membros de volta para o Lobby
    for (n in currentMembers) {
      message.guild.members.get(currentMembers[n].id).setVoiceChannel(guild.lobby);
    }
  }

  
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(token);



