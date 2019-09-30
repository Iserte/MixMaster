/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import chokidar from 'chokidar';
import Rcon from 'rcon';
import { RichEmbed } from 'discord.js';
import { readFileSync, writeFileSync } from 'fs';
import app from './app';

import MixController from './app/controllers/MixController';
import User from './app/models/User';
import Message from './app/models/Message';

/**
 * INICIO DAS FUNCOES
 */

async function playerConnect(params) {
  const { client } = params;

  if (!client) {
    return false;
  }

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
        new RegExp(`^<@${discordID}>`),
        `-<@${discordID}>`
      );
    }
  });

  teamB.forEach(b => {
    const discordID = b.replace(/[^0-9]/g, '');
    if (user.discordID === discordID) {
      teamBField.value = teamBField.value.replace(
        new RegExp(`^<@${discordID}>`),
        `-<@${discordID}>`
      );
    }
  });

  await message.edit(new RichEmbed(embed));
  return true;
}

async function playerDisconnect(params) {
  const { client } = params;

  if (!client) {
    return false;
  }

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
  return true;
}

async function seriesStart(params) {
  const { team1_name: team1Name, team2_name: team2Name } = params;

  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];

  const scoreField = embed.fields[1];

  scoreField.value = `**${team1Name}** \`00\` x \`00\` **${team2Name}**`;

  embed.timestamp = new Date();

  await message.edit(new RichEmbed(embed));
  return true;
}

async function mapPick(params) {
  const { map_name: mapName } = params;

  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];
  embed.timestamp = new Date();

  const mapField = embed.fields[2];

  mapField.name = `\`${mapName}\``;

  await message.edit(new RichEmbed(embed));
  return true;
}

async function knifeStart() {
  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];
  embed.timestamp = new Date();

  const scoreField = embed.fields[1];

  scoreField.name = `:large_blue_circle: [KNIFE]`;

  await message.edit(new RichEmbed(embed));
  return true;
}

async function knifeWon(params) {
  const { winner, selected_side: selectedSide } = params;

  let teamASide = '';
  let teamBSide = '';

  if (winner === 'team1') {
    if (selectedSide === 'CT') {
      teamASide = 'CT';
      teamBSide = 'TR';
    } else {
      teamASide = 'TR';
      teamBSide = 'CT';
    }
  } else if (winner === 'team2') {
    if (selectedSide === 'CT') {
      teamBSide = 'CT';
      teamASide = 'TR';
    } else {
      teamBSide = 'TR';
      teamASide = 'CT';
    }
  }

  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];
  embed.timestamp = new Date();

  const scoreField = embed.fields[1];

  const teamA = scoreField.value.substring(
    0,
    scoreField.value.search(/\* (|[\D]+)`/)
  );

  const teamB = scoreField.value.substring(
    scoreField.value.search(/\*\*[\D]+\*\*$/),
    scoreField.value.length
  );

  scoreField.value = `${teamA}* [${teamASide}] \`00\` x \`00\` [${teamBSide}] ${teamB}`;

  await message.edit(new RichEmbed(embed));
  return true;
}

async function goingLive() {
  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];
  embed.timestamp = new Date();
  embed.color = '14495300';

  const scoreField = embed.fields[1];

  scoreField.name = `:red_circle: [LIVE]`;

  await message.edit(new RichEmbed(embed));
  return true;
}

async function playerDeath(params) {
  const { victim, headshot, attacker, weapon } = params;

  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];
  embed.timestamp = new Date();

  const teamAField = embed.fields[3];
  const teamBField = embed.fields[4];

  const victimSteamID = victim
    .substring(victim.search(/STEAM_[0-5]:[01]:\d+/), victim.length - 3)
    .replace('STEAM_1', 'STEAM_0');

  const victimUser = await User.findOne({ steamID: victimSteamID });

  const { discordID: victimDiscordID, name: victimName } = victimUser;

  const attackerSteamID = attacker
    .substring(attacker.search(/STEAM_[0-5]:[01]:\d+/), attacker.length - 3)
    .replace('STEAM_1', 'STEAM_0');

  const attackerUser = await User.findOne({ steamID: attackerSteamID });

  const { name: attackerName } = attackerUser;

  if (!new RegExp(`~~<@${victimDiscordID}>~~`).test(teamAField.value)) {
    teamAField.value = teamAField.value.replace(
      `<@${victimDiscordID}>`,
      `~~<@${victimDiscordID}>~~`
    );
  }

  if (!new RegExp(`~~<@${victimDiscordID}>~~`).test(teamBField.value)) {
    teamBField.value = teamBField.value.replace(
      `<@${victimDiscordID}>`,
      `~~<@${victimDiscordID}>~~`
    );
  }

  const logField = embed.fields[0];

  let headshotText = '';
  if (headshot) {
    headshotText = '💀';
  }

  let knifeText = '';
  if (weapon === 'knife' || weapon === 'knife_t') {
    knifeText = '🔪';
  }

  const textMessage = `\`\`\`
  |
  |🔫 [${attackerName}] matou ${knifeText}${headshotText}[${victimName}]
  |\`\`\``;

  logField.value = textMessage;

  await message.edit(new RichEmbed(embed));

  return true;
}

async function roundEnd(params) {
  const { winner, team1_score: team1Score, team2_score: team2Score } = params;

  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];
  embed.timestamp = new Date();

  const logField = embed.fields[0];
  const scoreField = embed.fields[1];
  const teamAField = embed.fields[3];
  const teamBField = embed.fields[4];

  teamAField.value = teamAField.value.replace(/~/g, '');
  teamBField.value = teamBField.value.replace(/~/g, '');

  const teamAScore = `0${team1Score}`.slice(-2);
  const teamBScore = `0${team2Score}`.slice(-2);

  scoreField.value = scoreField.value.replace(
    /`[0-9]{2}` x `[0-9]{2}`/,
    `\`${teamAScore}\` x \`${teamBScore}\``
  );

  // scoreField.value = '**Team A** [TR] `00` x `00` [CT] **Team B**';

  let winnerText = '';
  if (winner === 'team1') {
    winnerText = scoreField.value.substring(
      scoreField.value.search(/^\*\*[\D]+\*\*/) + 2,
      scoreField.value.search(/\[/) - 3
    );
  } else {
    winnerText = scoreField.value.substring(
      scoreField.value.search(/\*\*[\D]+\*\*$/) + 2,
      scoreField.value.length - 2
    );
  }

  const textMessage = `\`\`\`
  |
  |🔫 [${winnerText}] ganhou o round
  |\`\`\``;

  logField.value = textMessage;

  await message.edit(new RichEmbed(embed));
  return true;
}

async function bombPlanted(params) {
  const { client } = params;

  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];
  embed.timestamp = new Date();

  const steamID = client.match(/STEAM_[0-5]:[01]:\d+/)[0].replace('_1', '_0');

  const { name: userName } = await User.findOne({ steamID });

  const logField = embed.fields[0];

  const textMessage = `\`\`\`
  |
  |💣 [${userName}] plantou a c4
  |\`\`\``;

  logField.value = textMessage;

  await message.edit(new RichEmbed(embed));
  return true;
}

async function bombExploded() {
  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];
  embed.timestamp = new Date();

  const logField = embed.fields[0];

  const textMessage = `\`\`\`
  |
  |💥 A c4 explodiu
  |\`\`\``;

  logField.value = textMessage;

  await message.edit(new RichEmbed(embed));
  return true;
}

async function sideSwap(params) {
  const { team1_side: team1Side } = params;

  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];
  embed.timestamp = new Date();

  const logField = embed.fields[0];

  const scoreField = embed.fields[1];

  let teamASide = '';
  let teamBSide = '';

  if (team1Side === 'CT') {
    teamASide = 'CT';
    teamBSide = 'TR';
  } else {
    teamASide = 'TR';
    teamBSide = 'CT';
  }

  scoreField.value = scoreField.value.replace(
    /\[\D{2}\] `/,
    `[${teamASide}] \``
  );

  scoreField.value = scoreField.value.replace(
    /` \[\D{2}\]/,
    `\` [${teamBSide}]`
  );

  const textMessage = `\`\`\`
  |
  |♻ [HALFTIME] Troca de lado
  |\`\`\``;

  logField.value = textMessage;

  await message.edit(new RichEmbed(embed));
  return true;
}

async function bombDefused(params) {
  const { client } = params;

  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];
  embed.timestamp = new Date();

  const steamID = client.match(/STEAM_[0-5]:[01]:\d+/)[0].replace('_1', '_0');

  const { name: userName } = await User.findOne({ steamID });

  const logField = embed.fields[0];

  const textMessage = `\`\`\`
  |
  |🧰 [${userName}] desarmou a c4
  |\`\`\``;

  logField.value = textMessage;

  await message.edit(new RichEmbed(embed));
  return true;
}

async function mapEnd(params) {
  const { winner } = params;

  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  const { embeds } = message;
  const embed = embeds[0];
  embed.timestamp = new Date();

  const logField = embed.fields[0];
  const scoreField = embed.fields[1];

  let winnerText = '';
  if (winner === 'team1') {
    winnerText = scoreField.value.substring(
      scoreField.value.search(/^\*\*[\D]+\*\*/) + 2,
      scoreField.value.search(/\[/) - 3
    );
  } else {
    winnerText = scoreField.value.substring(
      scoreField.value.search(/\*\*[\D]+\*\*$/) + 2,
      scoreField.value.length - 2
    );
  }

  const textMessage = `\`\`\`
  |
  |🏆 [${winnerText}] venceu a partida
  |\`\`\``;

  logField.value = textMessage;

  scoreField.name = ':black_circle: [MATCH END]';
  embed.color = '2699059';

  await message.edit(new RichEmbed(embed));
  return true;
}

async function seriesEnd() {
  const { channelID, messageID } = await Message.findOne().sort({ _id: -1 });
  const channel = await app.channels.get(channelID);
  const message = await channel.fetchMessage(messageID);
  MixController.unmix(message);

  const rcon = new Rcon(
    process.env.RCON_HOST,
    process.env.RCON_PORT,
    process.env.RCON_PASSWORD
  );
  await rcon.connect();
  rcon
    .on('auth', async () => {
      await rcon.send('status');
    })
    .on('response', async res => {
      const array = res
        .substring(res.search('userid'), res.length)
        .replace(/#/g, '')
        .split(/\n/);

      for (const i in array) {
        const element = array[i];
        if (/^ +[0-9]/.test(element)) {
          const userID = element.substring(
            element.search(/([0-9]+) .* /),
            element.search(/ [0-9] "/)
          );
          // eslint-disable-next-line no-await-in-loop
          await rcon.send(`kickid ${userID}`);
        }
      }

      // await rcon.disconnect();
    });
  return true;
}

/**
 * FIM DAS FUNCOES
 */

// Cria um listener no arquivo get5_events.log
const get5_events = chokidar.watch(process.env.LISTENER_GET5_LOG, {
  persistent: true,
  alwaysStat: true,
  awaitWriteFinish: true,
});

// Executa a funcao quando o arquivo for alterado
get5_events.on('change', async path => {
  const file = readFileSync(path).toString('utf8');
  const lines = file.split(/\r\n/);
  lines.pop();

  writeFileSync(process.env.LISTENER_GET5_LOG, '');

  // const array = lines.map(line =>
  //   line.substring(line.search(/{/, line.length))
  // );

  const jsonArr = lines.map(line =>
    JSON.parse(line.slice(line.search(/{/), line.length).replace(/`/g, ''))
  );

  // // Expressao regular para recuperar o comando excluindo as marcacoes de tempo
  // const jsonEvent = JSON.parse(lines[lines.length - 1].match(/{[\W\w]+}/)[0]);
  // const { event, params } = jsonEvent;

  for (const i of jsonArr) {
    const json = i;
    const { event, params } = json;

    // eslint-disable-next-line no-console
    console.log(event);

    if (event === 'player_disconnect') await playerDisconnect(params);
    if (event === 'player_connect') await playerConnect(params);
    if (event === 'series_start') await seriesStart(params);
    if (event === 'map_pick') await mapPick(params);
    if (event === 'knife_start') await knifeStart();
    if (event === 'knife_won') await knifeWon(params);
    if (event === 'going_live') await goingLive();
    if (event === 'player_death') await playerDeath(params);
    if (event === 'round_end') await roundEnd(params);
    if (event === 'bomb_planted') await bombPlanted(params);
    if (event === 'bomb_exploded') await bombExploded();
    if (event === 'side_swap') await sideSwap(params);
    if (event === 'bomb_defused') await bombDefused(params);
    if (event === 'map_end') await mapEnd(params);
    if (event === 'series_end') await seriesEnd();
    // TODO
    // if (event === 'map_veto') await mapVeto(params);
  }

  // jsonArr.forEach(json => {
  //   const { event, params } = json;

  //   console.log(event);

  //   if (event === 'player_disconnect') playerDisconnect(params);
  //   if (event === 'player_connect') playerConnect(params);
  //   if (event === 'series_start') seriesStart(params);
  //   if (event === 'map_pick') mapPick(params);
  //   if (event === 'knife_start') knifeStart();
  //   if (event === 'knife_won') knifeWon(params);
  //   if (event === 'going_live') goingLive();
  //   if (event === 'player_death') playerDeath(params);
  //   if (event === 'round_end') roundEnd(params);
  //   if (event === 'bomb_planted') bombPlanted(params);
  //   if (event === 'bomb_exploded') bombExploded();
  //   if (event === 'side_swap') sideSwap(params);
  //   if (event === 'bomb_defused') bombDefused(params);
  //   if (event === 'map_end') mapEnd(params);
  //   if (event === 'series_end') seriesEnd();
  // });
});

export default get5_events;
