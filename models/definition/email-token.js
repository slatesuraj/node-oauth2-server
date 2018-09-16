/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('EmailToken', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    token: {
      type: DataTypes.STRING(255),
      field: 'token',
      allowNull: true
    },
    userkey: {
      type: DataTypes.INTEGER,
      field: 'userkey',
      allowNull: false
    }
  }, {
    schema: 'public',
    tableName: 'email_token',
    timestamps: false
  })
}

module.exports.initRelations = () => {
  delete module.exports.initRelations // Destroy itself to prevent repeated calls.
}
