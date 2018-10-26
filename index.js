
// opt 
/*****
 * opt {
 * config:{db:,uname,pwd},
 * models:[],model文件
 * relation:funcion,模型间的关系 ，参数db.models
 * modelTest:funcion,模型测试 ，参数db.models
 * }
 * 
 *  */
const Sequelize = require("sequelize");

 // 检测配置文件
 function checkConfig (config)
 {
     if(!config)
     {
         return false;
     }
     if(!config.db || !config.uname)
     {
         return false;
     }
     return true;
 }

 // 检测模型
function checkModels(dataModelList){
    if( !dataModelList ||  dataModelList.length == 0 )
    {
        return false;
    }
    return true;
}

var instance = null;

module.exports = async (opt)=>{
    try {
        if (instance) return instance;
        var dbconfig = opt.config;
        if(!checkConfig(dbconfig))
        {
            throw new Error("数据库尚未初始化，配置文件配置不合法");
        }
        var  dataModelList = opt.models;
        if(!checkModels(dataModelList))
        {
            throw new Error("数据库尚未初始化，检测模型失败");
        }


        instance = new Sequelize(dbconfig.db, dbconfig.uname, dbconfig.pwd, {
            //timestamps:false,
            host: dbconfig.host,
            dialect: 'mysql',
            timezone: '+08:00',
            freezeTableName: false,
            logging:false,
            //underscored:false,
            pool: {
                max: 5,
                min: 0,
                idle: 30000
            }
        })
        for (let model of dataModelList) {

            instance.define(model.name, model.body, {
                timestamps: false, // 禁止自动加createdAt 等时间字段
                underscored: true, // true,不使用驼峰命名
                freezeTableName: true, // 不加s，不修改表名
                tableName: model.tableName,
            });
        }
        await instance.sync({
            force: false
        });
        console.log("init db", new Date().getTime());
        let relationship = opt.relationship?opt.relationship:(db)=>{
            return db;
        }
        instance =  relationship(instance);
		if(!instance)
		{
			throw new Error("数据库初始化失败，请在自定义的relationship方法中返回db对象");
		}
        if(opt.modelTest)
        {
           await opt.modelTest(instance);
        }
        return instance;

    } catch (e) {
        throw "初始化数据库失败" + e;
    }
}