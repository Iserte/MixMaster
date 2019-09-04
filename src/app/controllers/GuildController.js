// import * as Yup from 'yup';

import Guild from '../models/Guild';

class UserController {
  async store(message) {
    const { id, channels, roles } = message.guild;
    let mix;
    let role;
    let lobby;
    let teamA;
    let teamB;

    mix = channels.find(
      channel => channel.name === 'MIX' && channel.type === 'category'
    );
    if (!mix) {
      mix = await message.guild.createChannel('MIX', {
        type: 'category',
      });
    }

    role = roles.find(m => m.name === 'MixMaster');
    if (!role) {
      role = await message.guild.createRole({ name: 'MixMaster' });
    }

    lobby = channels.find(
      channel =>
        channel.name === 'Lobby' &&
        channel.type === 'voice' &&
        (channel.parent && channel.parent === mix)
    );
    if (!lobby) {
      lobby = await message.guild.createChannel('Lobby', {
        type: 'voice',
        userLimit: 10,
        parent: mix,
      });
    }

    teamA = channels.find(
      channel =>
        channel.name === 'TeamA' &&
        channel.type === 'voice' &&
        (channel.parent && channel.parent === mix)
    );
    if (!teamA) {
      teamA = await message.guild.createChannel('TeamA', {
        type: 'voice',
        userLimit: 5,
        parent: mix,
      });
    }

    teamB = channels.find(
      channel =>
        channel.name === 'TeamB' &&
        channel.type === 'voice' &&
        (channel.parent && channel.parent === mix)
    );
    if (!teamB) {
      teamB = await message.guild.createChannel('TeamB', {
        type: 'voice',
        userLimit: 5,
        parent: mix,
      });
    }

    const guild = {
      guild: id,
      role: role.id,
      lobby: lobby.id,
      teamA: teamA.id,
      teamB: teamB.id,
    };

    const guildExists = await Guild.findOne({
      where: {
        guild: id,
      },
    });

    if (guildExists) {
      await guildExists.update(guild);
    } else {
      await Guild.create(guild);
    }

    return message.channel.send('Servidor configurado com sucesso');
  }
}

export default new UserController();
