import Sequelize, { Model } from 'sequelize';

class Guild extends Model {
  static init(sequelize) {
    super.init(
      {
        guild: Sequelize.STRING,
        role: Sequelize.STRING,
        lobby: Sequelize.STRING,
        teamA: Sequelize.STRING,
        teamB: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Guild;
