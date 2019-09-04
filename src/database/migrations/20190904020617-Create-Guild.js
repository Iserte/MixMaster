module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('guilds', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      guild: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: Sequelize.STRING,
      lobby: Sequelize.STRING,
      teamA: Sequelize.STRING,
      teamB: Sequelize.STRING,
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('guilds');
  },
};
