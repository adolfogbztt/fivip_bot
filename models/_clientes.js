module.exports = (sequelize, type) => {
  return sequelize.define("_clientes", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombres: type.STRING,
    apellidos: type.STRING,
    telefono: type.STRING,
    documento: type.STRING,
    _whatsapp: type.STRING,
  });
};
