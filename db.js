const Sequelize = require("sequelize");
const UsuariosModel = require("./models/usuarios");
const HistoryModel = require("./models/history");
const ClientesModel = require("./models/clientes");
const RemesasModel = require("./models/remesas");

const sequelize = new Sequelize("fivip_test", "root", "1234", {
  host: "localhost",
  dialect: "mysql",
  define: {
    timestamps: false,
  },
});

const User = UsuariosModel(sequelize, Sequelize);
const History = HistoryModel(sequelize, Sequelize);
const Cliente = ClientesModel(sequelize, Sequelize);
const Remesa = RemesasModel(sequelize, Sequelize);

// User.hasMany(History,{as:"historial",foreign:"user_id"})

sequelize.sync({ force: false }).then((res) => {
  console.log("tablas sync");
});

module.exports = {
  User,
  History,
  Cliente,
  Remesa,
};
