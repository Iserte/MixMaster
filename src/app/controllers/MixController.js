import { RichEmbed } from 'discord.js';
import Guild from '../models/Guild';

class MixController {
  async mix(message) {
    const { id, channels } = message.guild;

    const guildExists = await Guild.findOne({ where: { guild: id } });

    if (!guildExists) {
      return message.channel.send(
        'Servidor não encontrado, favor executar o comando !config'
      );
    }

    const hasRole = message.member.roles.find(
      role => role.id === guildExists.role
    );

    if (!hasRole) {
      return message.channel.send('Usuário sem cargo de MixMaster');
    }

    const lobbyExists = channels.find(
      channel => channel.id === guildExists.lobby
    );
    const teamAExists = channels.find(
      channel => channel.id === guildExists.teamA
    );
    const teamBExists = channels.find(
      channel => channel.id === guildExists.teamB
    );

    if (!lobbyExists || !teamAExists || !teamBExists) {
      return message.channel.send(
        'Servidor não configurado, favor executar o comando !config'
      );
    }

    const { members: lobbyMembers } = lobbyExists;

    const lobbyIds = lobbyMembers.map(member => member.id);

    if (lobbyIds.length < 2) {
      return message.channel.send('Poucos jogadores no canal Lobby');
    }

    const teamA = [];

    while (teamA.length < lobbyIds.length / 2) {
      const i = Math.floor(Math.random() * lobbyIds.length);
      if (!teamA.includes(i)) {
        teamA.push(lobbyIds[i]);
      }
    }

    const teamB = lobbyIds.map(m => !m.includes(teamA) && m);

    for (let i = 0; i < teamB.length; i += 1) {
      if (teamB[i] === false) {
        teamB.splice(i, 1);
      }
    }

    teamA.forEach(member => {
      lobbyMembers.get(member).setVoiceChannel(teamAExists.id);
    });

    teamB.forEach(member => {
      lobbyMembers.get(member).setVoiceChannel(teamBExists.id);
    });

    const embed = new RichEmbed()
      .setColor('#0099ff')
      .setAuthor(
        'Iserte Company',
        'https://i.imgur.com/2gFsYNH.png',
        'https://www.iserte.com.br/'
      )
      .setDescription('Click above to check more about us!')
      .setThumbnail('https://i.imgur.com/bpd9aML.png')
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
        'Bugs? contact@iserte.com.br',
        'https://cdn.discordapp.com/avatars/206075563410980866/d63207bc9766c4da9e0bf56373084711.png'
      );
    return message.channel.send(embed);
  }

  async unmix(message) {
    const { id, channels } = message.guild;

    const guildExists = await Guild.findOne({ where: { guild: id } });

    if (!guildExists) {
      return message.channel.send(
        'Servidor não encontrado, favor executar o comando !config'
      );
    }

    const { id: lobbyId } = channels.find(
      channel => channel.id === guildExists.lobby
    );
    const { members: teamAMembers } = channels.find(
      channel => channel.id === guildExists.teamA
    );
    const { members: teamBMembers } = channels.find(
      channel => channel.id === guildExists.teamB
    );

    const teamA = teamAMembers.map(member => member);
    const teamB = teamBMembers.map(member => member);

    if (teamA.length === 0 || teamB === 0) {
      return message.channel.send('Nenhum jogador para ser movido!');
    }

    teamAMembers.forEach(member => {
      teamAMembers.get(member.id).setVoiceChannel(lobbyId);
    });

    teamBMembers.forEach(member => {
      teamBMembers.get(member.id).setVoiceChannel(lobbyId);
    });

    return message.channel.send('Jogadores movidos!');
  }
}

export default new MixController();
