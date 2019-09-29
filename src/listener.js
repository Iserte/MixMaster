import chokidar from 'chokidar';
import { RichEmbed } from 'discord.js';
import { readFileSync } from 'fs';
import app from './app';

import User from './app/models/User';
import Message from './app/models/Message';

async function playerConnect(params) {
  const { client } = params;
  const steamID = client.match(/STEAM_[0-5]:[01]:\d+/)[0].replace('_1', '_0');

  const user = await User.findOne({ steamID });
  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });

  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];

  const teamAField = embed.fields[3];
  const teamA = teamAField.value.split(/\n/);

  const teamBField = embed.fields[4];
  const teamB = teamBField.value.split(/\n/);

  embed.timestamp = new Date();

  teamA.forEach(a => {
    const discordID = a.replace(/[^0-9]/g, '');
    if (user.discordID === discordID) {
      teamAField.value = teamAField.value.replace(
        `<@${discordID}>`,
        `-<@${discordID}>`
      );
    }
  });

  teamB.forEach(b => {
    const discordID = b.replace(/[^0-9]/g, '');
    if (user.discordID === discordID) {
      teamBField.value = teamBField.value.replace(
        `<@${discordID}>`,
        `-<@${discordID}>`
      );
    }
  });

  await message.edit(new RichEmbed(embed));
}

async function playerDisconnect(params) {
  const { client } = params;
  const steamID = client.match(/STEAM_[0-5]:[01]:\d+/)[0].replace('_1', '_0');

  const user = await User.findOne({ steamID });
  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });

  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];

  const teamAField = embed.fields[3];
  const teamA = teamAField.value.split(/\n/);

  const teamBField = embed.fields[4];
  const teamB = teamBField.value.split(/\n/);

  embed.timestamp = new Date();

  teamA.forEach(a => {
    const discordID = a.replace(/[^0-9]/g, '');
    if (user.discordID === discordID) {
      teamAField.value = teamAField.value.replace(
        `-<@${discordID}>`,
        `<@${discordID}>`
      );
    }
  });

  teamB.forEach(b => {
    const discordID = b.replace(/[^0-9]/g, '');
    if (user.discordID === discordID) {
      teamBField.value = teamBField.value.replace(
        `-<@${discordID}>`,
        `<@${discordID}>`
      );
    }
  });

  await message.edit(new RichEmbed(embed));
}

// Cria um listener no arquivo get5_events.log
const get5_events = chokidar.watch(
  'C:/game-servers/CSGO/csgo/logs/get5_events.log'
);

// Executa a funcao quando o arquivo for alterado
get5_events.on('change', path => {
  const file = readFileSync(path).toString('utf8');
  const lines = file.split(/\r\n/);
  lines.pop();

  // Expressao regular para recuperar o comando excluindo as marcacoes de tempo
  const jsonEvent = JSON.parse(lines[lines.length - 1].match(/{[\W\w]+}/)[0]);
  const { event, params } = jsonEvent;

  console.log(event);

  if (event === 'player_disconnect') playerDisconnect(params);
  if (event === 'player_connect') playerConnect(params);
});

export default get5_events;
