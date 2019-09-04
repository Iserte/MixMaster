import app from './app';

import readyMiddleware from './app/middlewares/ready';
import MixController from './app/controllers/MixController';
import GuildController from './app/controllers/GuildController';

const prefix = process.env.APP_PREFIX;

app.on('ready', readyMiddleware);

app.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'mix') MixController.mix(message);
  if (command === 'lobby') MixController.unmix(message);
  if (command === 'config') GuildController.store(message, args);
});
