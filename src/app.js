import 'dotenv/config';
import Discord from 'discord.js';

import './database';

class App {
  constructor() {
    this.client = new Discord.Client();
  }
}

export default new App().client;
