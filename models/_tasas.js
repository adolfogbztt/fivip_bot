module.exports = (sequelize, type) => {
    return sequelize.define("_tasas", {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        empresa_id: type.INTEGER,
        pais: type.STRING,
        tasa_c: type.INTEGER,
        iso_from: type.STRING,
        moneda_from: type.STRING,
        simbolo_from: type.STRING,

        iso_to: type.STRING,
        moneda_to: type.STRING,
        simbolo_to: type.STRING,
    });
};
