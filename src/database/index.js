import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import Guild from '../app/models/Guild';

import databaseConfig from '../config/database';

const models = [Guild];

class Database {
  constructor() {
    // this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig.mysql);

    models.map(model => model.init(this.connection));
  }

  mongo() {
    const { url, params } = databaseConfig.mongo;
    this.mongoConnection = mongoose.connect(url, params);
  }
}

export default new Database();
