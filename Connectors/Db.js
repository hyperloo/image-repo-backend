const { Sequelize } = require("sequelize")
const { mySQLConfig, mySQLBaseConfig } = require("../Configs")

global.sqlDb = new Sequelize(...mySQLBaseConfig, {
    ...mySQLConfig,
})
function connectToDB() {
    sqlDb
        .authenticate()
        .then(() => console.log("MySQL DB connected"))
        .catch((err) => {
            console.error("error connecting DB: " + err.stack)
        })
}

module.exports = { connectToDB }
