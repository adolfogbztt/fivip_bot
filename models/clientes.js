module.exports = (sequelize, type) => {
  return sequelize.define("clientes", {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombres: type.STRING,
    apellidos: type.STRING,
    telefono: type.STRING,
    documento: type.STRING,
    empresa_id: type.INTEGER,
  });
};
