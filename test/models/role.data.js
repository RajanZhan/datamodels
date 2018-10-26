const Sequelize = require("sequelize");
module.exports = {
    name:"role",
    body:{
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        name: Sequelize.STRING(128),//角色名
        
    }
}