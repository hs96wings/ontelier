'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('cirriculums', 'lecture_goal', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('cirriculums', 'lecture_summary', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('cirriculums', 'lecture_previous', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
