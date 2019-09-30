import { RichEmbed } from 'discord.js';
import Rcon from 'rcon';
import { writeFileSync } from 'fs';

import exampleMatch from 'C:/game-servers/CSGO/csgo/addons/sourcemod/configs/get5/example_match.json';

import UserController from './UserController';
import Message from '../models/Message';

class MixController {
  async mix(message) {
    const { channels, roles } = message.guild;

    let mixCategory;
    let mixRole;
    let lobbyChannel;
    let teamAChannel;
    let teamBChannel;

    // Procura a role MixMaster, e caso não encontre, a mesma é criada.
    mixRole = roles.find(m => m.name === 'MixMaster');
    if (!mixRole) {
      mixRole = await message.guild.createRole({ name: 'MixMaster' });
    }

    // Procura a categoria MIX, e caso não encontre, a mesma é criada.
    mixCategory = channels.find(
      channel => channel.name === 'MIX' && channel.type === 'category'
    );
    if (!mixCategory) {
      mixCategory = await message.guild.createChannel('MIX', {
        type: 'category',
      });
    }

    // Procura o canal de voz Lobby, e caso não encontre, a mesma é criada e atribuida como filha a categoria Lobby.
    lobbyChannel = channels.find(
      channel =>
        channel.name === 'Lobby' &&
        channel.type === 'voice' &&
        (channel.parent && channel.parent === mixCategory)
    );
    if (!lobbyChannel) {
      lobbyChannel = await message.guild.createChannel('Lobby', {
        type: 'voice',
        userLimit: 10,
        parent: mixCategory,
      });
    }

    // Procura o canal de voz TeamA, e caso não encontre, a mesma é criada e atribuida como filha a categoria Lobby.
    teamAChannel = channels.find(
      channel =>
        channel.name === 'TeamA' &&
        channel.type === 'voice' &&
        (channel.parent && channel.parent === mixCategory)
    );
    if (!teamAChannel) {
      teamAChannel = await message.guild.createChannel('TeamA', {
        type: 'voice',
        userLimit: 5,
        parent: mixCategory,
      });
    }

    // Procura o canal de voz TeamB, e caso não encontre, a mesma é criada e atribuida como filha a categoria Lobby.
    teamBChannel = channels.find(
      channel =>
        channel.name === 'TeamB' &&
        channel.type === 'voice' &&
        (channel.parent && channel.parent === mixCategory)
    );
    if (!teamBChannel) {
      teamBChannel = await message.guild.createChannel('TeamB', {
        type: 'voice',
        userLimit: 5,
        parent: mixCategory,
      });
    }

    // Recupera os membros conectados no canal Lobby
    const { members: lobbyMembers } = lobbyChannel;

    // Cria um array com o id dos jogadores conectados no canal Lobby
    const lobbyIds = lobbyMembers.map(member => member.id);

    // Verifica se os jogadores conectados no canal Lobby possuem um steamID configurado
    const lobbyUsers = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const id of lobbyIds) {
      // eslint-disable-next-line no-await-in-loop
      const user = await UserController.show(id);
      if (!user) {
        return message.channel.send(
          `${lobbyMembers.get(id)} não configurou seu steamID`
        );
      }
      lobbyUsers.push(user);
    }

    if (lobbyIds.length < 2) {
      return message.channel.send('Poucos jogadores no canal Lobby');
    }

    // Cria um array com o id dos jogadores do TeamA de forma aleatória
    const teamA = [];
    const randHist = [];
    while (teamA.length < lobbyIds.length / 2) {
      const i = Math.floor(Math.random() * lobbyIds.length);
      if (!randHist.includes(i)) {
        randHist.push(i);
        if (!teamA.includes(i)) {
          teamA.push(lobbyIds[i]);
        }
      }
    }

    // Cria um array com o id dos jogadores do TeamB de forma aleatória
    const teamB = lobbyIds.filter(m => !teamA.includes(m)); // .filter(m => m);

    exampleMatch.team1.players = [];
    // Move os jogadores para o TeamA
    teamA.forEach(member => {
      exampleMatch.team1.players.push(
        lobbyUsers.filter(user => user.discordID === member)[0].steamID
      );
      lobbyMembers.get(member).setVoiceChannel(teamAChannel.id);
    });

    exampleMatch.team2.players = [];
    // Move os jogadores para o TeamB
    teamB.forEach(member => {
      exampleMatch.team2.players.push(
        lobbyUsers.filter(user => user.discordID === member)[0].steamID
      );
      lobbyMembers.get(member).setVoiceChannel(teamBChannel.id);
    });

    const embed = new RichEmbed()
      .setColor('#55acee')
      .setAuthor(
        'MixMaster Github',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ2dFbtnws3MV78IktTE66wSSZYX9kB0CjiZfHqVKihgwgJPk4',
        'https://github.com/Iserte/MixMaster'
      )
      .setDescription('Click above to check more about us!')
      // .setThumbnail('https://i.imgur.com/i93mIop.jpg')
      .addBlankField()
      .addField(
        ':large_blue_circle: [WARMUP]',
        '**Team A** `00` x `00` **Team B**'
      )
      .addBlankField()
      .addField(
        'Team A',
        `${teamA.map(m => `${lobbyMembers.get(m)}\n`).join('')}`,
        true
      )
      .addField(
        'Team B',
        `${teamB.map(m => `${lobbyMembers.get(m)}\n`).join('')}`,
        true
      )
      .addBlankField()
      .setTimestamp()
      .setFooter(
        'Bugs? gustavo@dvdsp.com.br',
        'https://cdn.discordapp.com/avatars/206075563410980866/d63207bc9766c4da9e0bf56373084711.png'
      );
    const messageSend = await message.channel.send(embed);

    const emojis = [];

    const mirage = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_mirage'
    );
    emojis.push(mirage);
    const inferno = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_inferno'
    );
    emojis.push(inferno);
    const overpass = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_overpass'
    );
    emojis.push(overpass);
    const nuke = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_nuke'
    );
    emojis.push(nuke);
    const train = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_train'
    );
    emojis.push(train);
    const dust = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_dust'
    );
    emojis.push(dust);
    const cache = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_cache'
    );
    emojis.push(cache);

    // eslint-disable-next-line no-restricted-syntax
    for (const emoji of emojis) {
      // eslint-disable-next-line no-await-in-loop
      await messageSend.react(emoji.id);
    }

    await message.channel.send(
      `${mirage} • Mirage ${inferno} • Inferno ${overpass} • Overpass ${nuke} • Nuke ${train} • Train ${dust} • Dust II ${cache} • Cache`
    );

    const { id: channelID } = messageSend.channel;
    const { id: messageID } = messageSend;

    await Message.create({ channelID, messageID });

    const collector = messageSend.createReactionCollector(
      reaction => {
        return (
          reaction.emoji === mirage ||
          reaction.emoji === inferno ||
          reaction.emoji === overpass ||
          reaction.emoji === nuke ||
          reaction.emoji === train ||
          reaction.emoji === dust ||
          reaction.emoji === cache
        );
      },
      {
        time: 10000,
      }
    );

    let mirageCount = 0;
    let infernoCount = 0;
    let overpassCount = 0;
    let nukeCount = 0;
    let trainCount = 0;
    let dustCount = 0;
    let cacheCount = 0;

    collector.on('collect', reaction => {
      // eslint-disable-next-line no-console
      console.log(reaction.emoji.name);
      if (reaction.emoji === mirage) mirageCount += 1;
      if (reaction.emoji === inferno) infernoCount += 1;
      if (reaction.emoji === overpass) overpassCount += 1;
      if (reaction.emoji === nuke) nukeCount += 1;
      if (reaction.emoji === train) trainCount += 1;
      if (reaction.emoji === dust) dustCount += 1;
      if (reaction.emoji === cache) cacheCount += 1;
    });

    collector.on('end', async () => {
      const maps = [];
      const maxVote = Math.max(
        mirageCount,
        infernoCount,
        overpassCount,
        nukeCount,
        trainCount,
        dustCount,
        cacheCount
      );

      if (mirageCount === maxVote) maps.push('de_mirage');
      if (infernoCount === maxVote) maps.push('de_inferno');
      if (overpassCount === maxVote) maps.push('de_overpass');
      if (nukeCount === maxVote) maps.push('de_nuke');
      if (trainCount === maxVote) maps.push('de_train');
      if (dustCount === maxVote) maps.push('de_dust2');
      if (cacheCount === maxVote) maps.push('de_cache');

      const selectedMap = maps[Math.floor(Math.random() * maps.length)];

      exampleMatch.maplist = [selectedMap];

      const logField = embed.fields[0];
      const textMessage = `\`\`\`
      |
      |🏁 [${selectedMap}] Mapa escolhido
      |\`\`\``;

      logField.value = textMessage;

      messageSend.edit(new RichEmbed(embed));

      // Cria o arquivo com as configuracoes da partida
      await writeFileSync(
        `${process.env.SRCDS_MATCHS_PATH}b7_match.json`,
        JSON.stringify(exampleMatch, null, '\t')
      );

      // Conecta ao rcon e envia o comando para criar a partida
      const rcon = new Rcon(
        process.env.RCON_HOST,
        process.env.RCON_PORT,
        process.env.RCON_PASSWORD
      );
      await rcon.connect();
      rcon.on('auth', async () => {
        await rcon.send(
          'get5_loadmatch addons/sourcemod/configs/get5/b7_match.json'
        );
        await rcon.disconnect();
      });
    });

    return true;
  }

  async unmix(message) {
    const { channels } = message.guild;

    let mixCategory;
    let lobbyChannel;
    let teamAChannel;
    let teamBChannel;

    // Procura a categoria MIX, e caso não encontre, a mesma é criada.
    mixCategory = channels.find(
      channel => channel.name === 'MIX' && channel.type === 'category'
    );
    if (!mixCategory) {
      mixCategory = await message.guild.createChannel('MIX', {
        type: 'category',
      });
    }

    // Procura o canal de voz Lobby, e caso não encontre, a mesma é criada e atribuida como filha a categoria Lobby.
    lobbyChannel = channels.find(
      channel =>
        channel.name === 'Lobby' &&
        channel.type === 'voice' &&
        (channel.parent && channel.parent === mixCategory)
    );
    if (!lobbyChannel) {
      lobbyChannel = await message.guild.createChannel('Lobby', {
        type: 'voice',
        userLimit: 10,
        parent: mixCategory,
      });
    }

    // Procura o canal de voz TeamA, e caso não encontre, a mesma é criada e atribuida como filha a categoria Lobby.
    teamAChannel = channels.find(
      channel =>
        channel.name === 'TeamA' &&
        channel.type === 'voice' &&
        (channel.parent && channel.parent === mixCategory)
    );
    if (!teamAChannel) {
      teamAChannel = await message.guild.createChannel('TeamA', {
        type: 'voice',
        userLimit: 5,
        parent: mixCategory,
      });
    }

    // Procura o canal de voz TeamB, e caso não encontre, a mesma é criada e atribuida como filha a categoria Lobby.
    teamBChannel = channels.find(
      channel =>
        channel.name === 'TeamB' &&
        channel.type === 'voice' &&
        (channel.parent && channel.parent === mixCategory)
    );
    if (!teamBChannel) {
      teamBChannel = await message.guild.createChannel('TeamB', {
        type: 'voice',
        userLimit: 5,
        parent: mixCategory,
      });
    }

    const { members: teamAMembers } = teamAChannel;
    const { members: teamBMembers } = teamBChannel;

    const teamA = teamAMembers.map(member => member);
    const teamB = teamBMembers.map(member => member);

    if (teamA.length === 0 || teamB === 0) {
      return message.channel.send('Nenhum jogador para ser movido!');
    }

    teamAMembers.forEach(member => {
      teamAMembers.get(member.id).setVoiceChannel(lobbyChannel.id);
    });

    teamBMembers.forEach(member => {
      teamBMembers.get(member.id).setVoiceChannel(lobbyChannel.id);
    });

    return message.channel.send('Jogadores movidos!');
  }
}

export default new MixController();
