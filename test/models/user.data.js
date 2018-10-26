const Sequelize = require("sequelize");
module.exports = {
    name:"user",
    tableName:"fa_wechat_user",
    body:{
        wuid: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        nickname: Sequelize.STRING(128),//
        remark:Sequelize.STRING(128),//
        headimgurl:Sequelize.STRING(128),
        openid:Sequelize.STRING(128),
        unionid:Sequelize.STRING(128),
        Idattribute:Sequelize.STRING(512),
        roleId:Sequelize.INTEGER,
        tagid_list:Sequelize.STRING(512),
    }
}