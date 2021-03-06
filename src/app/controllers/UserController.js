// import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(message, args) {
    const { username: name, id: discordID } = message.author;
    const [steamID] = args;

    if (!steamID) {
      await message.channel.send(
        `Utilize o comando novamente informando seu steamID (exemplo: **${process.env.APP_PREFIX}steamid STEAM_0:0:123456789)**`
      );
      return message.channel.send(
        'Encontre seu steamID em https://steamid.io/. Basta colar o link do seu perfil steam e clicar em "LOOKUP"'
      );
    }

    if (!/^STEAM_[0-5]:[01]:\d+$/.test(steamID)) {
      return message.channel.send(
        'Informe um steamID válido (exemplo: STEAM_0:0:123456789)'
      );
    }

    const user = await User.findOne({ discordID });

    if (!user) {
      await User.create({ name, discordID, steamID });
      return message.channel.send('Usuário configurado');
    }

    await user.updateOne({ name, discordID, steamID });

    return message.channel.send('Usuário atualizado');
  }

  async show(message) {
    const discordID = message;

    const user = await User.findOne({ discordID });

    if (!user) {
      return false;
    }

    return user;
  }

  async teste(message) {
    const mirage = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_mirage'
    );
    const inferno = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_inferno'
    );
    const overpass = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_overpass'
    );
    const nuke = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_nuke'
    );
    const train = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_train'
    );
    const dust = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_dust'
    );
    const cache = await message.guild.emojis.find(
      emoji => emoji.name === 'pin_cache'
    );

    return message.channel.send(
      `${mirage} • Mirage ${inferno} • Inferno ${overpass} • Overpass ${nuke} • Nuke ${train} • Train ${dust} • Dust II ${cache} • Cache`
    );
  }
}

export default new UserController();
