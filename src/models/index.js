const dbConfig = require("../config/dbConfig.js");

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  post: 1521,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  quoteIdentifiers: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});
sequelize
  .authenticate()
  .then(() => {
    console.log("db",dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD)
    console.log("connected..");
  })
  .catch((err) => {
    console.log("Error" + err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.salepoint = require("./salePointModel.js")(sequelize, DataTypes);
db.images = require("./imageModel.js")(sequelize, DataTypes);

db.sequelize.sync({ force: false }).then(() => {
  console.log("yes re-sync done!");
});

// 1 to Many Relation

db.salepoint.hasMany(db.images, {
  foreignKey: "shopID",
  as: "images",
});

db.images.belongsTo(db.salepoint, {
  foreignKey: "shopID",
  as: "salepoint",
});

module.exports = db;
