/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Token', {
    id: {
      type: DataTypes.INTEGER,
      field: 'id',
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    accesstoken: {
      type: DataTypes.TEXT,
      field: 'accesstoken',
      allowNull: false
    },
    generatedAt: {
      type: DataTypes.BIGINT,
      field: 'generatedAt',
      allowNull: true
    },
    userkey: {
      type: DataTypes.INTEGER,
      field: 'userkey',
      allowNull: false
    }
  }, {
    schema: 'public',
    tableName: 'accesstoken',
    timestamps: false
  })
}

module.exports.initRelations = () => {
  delete module.exports.initRelations // Destroy itself to prevent repeated calls.
}
