/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    userkey: {
      type: DataTypes.INTEGER,
      field: 'userkey',
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING(255),
      field: 'first_name',
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(255),
      field: 'last_name',
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      field: 'email',
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(255),
      field: 'password',
      allowNull: false
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      field: 'is_email_verified',
      allowNull: false,
      defaultValue: false
    }
  }, {
    schema: 'public',
    tableName: 'user',
    timestamps: true
  })
}

module.exports.initRelations = () => {
  delete module.exports.initRelations // Destroy itself to prevent repeated calls.

}
