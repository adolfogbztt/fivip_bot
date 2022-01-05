const Sequelize = require("sequelize");
const UsuariosModel = require("./models/usuarios");
const HistoryModel = require("./models/history");
const _ClientesModel = require("./models/_clientes");
const ClientesModel = require("./models/clientes");
const RemesasModel = require("./models/remesas");
const _TasasModel = require("./models/_tasas");
const BotModel = require("./models/bots");
const PagosModel = require("./models/pagos");

const sequelize = new Sequelize("fivip_test_2", "root", "1234", {
  host: "localhost",
  dialect: "mysql",
  define: {
    timestamps: false,
  },
});

const User = UsuariosModel(sequelize, Sequelize);
const History = HistoryModel(sequelize, Sequelize);
const _Cliente = _ClientesModel(sequelize, Sequelize);
const Cliente = ClientesModel(sequelize, Sequelize);
const Remesa = RemesasModel(sequelize, Sequelize);
const _Tasas = _TasasModel(sequelize, Sequelize);
const Bot = BotModel(sequelize, Sequelize);
const Pagos = PagosModel(sequelize, Sequelize);

// User.hasMany(History,{as:"historial",foreign:"user_id"})

sequelize.sync({ force: false }).then((res) => {
  console.log("tablas sync");
});

module.exports = {
  User,
  History,
  _Cliente,
  Cliente,
  Remesa,
  _Tasas,
  Bot,
  Pagos
};
