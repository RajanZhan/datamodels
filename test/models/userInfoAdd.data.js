const Sequelize = require("sequelize");
module.exports = {
    name:"userInfoAdd",// 模型名
    tableName:"fa_wechat_user_info_add",// 表名，如果不填，则使用模型名
    body:{

        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },

        // 主表的id
        mainTableId:{
            type: Sequelize.INTEGER,
        },
        realName:Sequelize.STRING(128),
        age:Sequelize.INTEGER,
        gender:Sequelize.INTEGER,
    

    }
}