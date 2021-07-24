const {sequelize} = require("./sequelizer")
const { DataTypes, Sequelize } = require("sequelize")

const Meeting = sequelize.define("Meeting", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    duration: {type: DataTypes.INTEGER, allowNull: false},
    starTime: {type: DataTypes.DATE},
})

exports.Meeting = Meeting