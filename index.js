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
function checkConfig(config) {
    if (!config) {
        return false;
    }
    if (!config.db || !config.uname) {
        return false;
    }
    return true;
}

// 检测模型
function checkModels(dataModelList) {
    if (!dataModelList) {
        return false;
    }
    return true;
}

var instance = null;

module.exports = async (opt) => {
    try {
        if (instance) return instance;
        var dbconfig = opt.config;
        if (!checkConfig(dbconfig)) {
            throw new Error("数据库尚未初始化，配置文件配置不合法");
        }
        var dataModelList = opt.models;
        if (!checkModels(dataModelList)) {
            throw new Error("数据库尚未初始化，检测模型失败");
        }

		
		var dbType = "mysql";
		var sportDb = new Set(['mysql','sqlite']);
		if(dbconfig.type)
		{
			if(!sportDb.has(dbconfig.type))
			{
				throw new Error("不支持数据库类型，目前支持的数据库 为mysql，sqlite");
			}
			dbType = dbconfig.type;
		}
		
		var config = {
            //timestamps:false,
			port:dbconfig.port?dbconfig.port:3306,
            host: dbconfig.host,
            dialect: dbType,
            freezeTableName: false,
            logging: dbconfig.logging ? dbconfig.logging : false,
            //underscored:false,
            pool: {
                max: 5,
                min: 0,
                idle: 30000
            }
        
		};
		if(dbType == "sqlite")
		{
			if(!dbconfig.storage)
			{
				throw new Error("sqlit 数据库请传入storage属性，storage为数据库文件路径 ");
			}
			config['storage'] = dbconfig.storage
		}
		config['dialect'] = dbType;
        instance = new Sequelize(dbconfig.db, dbconfig.uname, dbconfig.pwd, config)
        let modelFieldKeyMap = new Map(); // 每个模型的字段映射 以虚拟字段来映射真实字段
        let realFieldToVfieldMap = new Map();// 每个模型的字段映射 以真实字段来映射虚拟字段
        let modelRelationMap = new Map(); // 模型间的关系
        let modelPrimaryKeyMap = new Map();// 每个模型的主键
        for (let model of dataModelList) {
            let mmap = new Map();// 虚拟字段映射真实字段
            let rTovMap = new Map();//真实字段映射虚拟字段
            instance.define(model.name, model.body, {
                timestamps: false, // 禁止自动加createdAt 等时间字段
                underscored: true, // true,不使用驼峰命名
                freezeTableName: true, // 不加s，不修改表名
                tableName: model.tableName,
                indexes: model.indexes, // 索引
            });

            // 生成模型的字段映射 读取每个模型的主键
            for (let k in model.body) {
                if (model.body[k].alias) {
                    mmap.set(model.body[k].alias, k);
                    rTovMap.set(k,model.body[k].alias);
                } else {
                    mmap.set(k, k);
                    rTovMap.set(k,k);
                }

                // 每个模型 的主键
                if(model.body[k].primaryKey)
                {
                    modelPrimaryKeyMap.set(model.name,{
                        realField:k,
                        rField:k,
                        vfield:model.body[k].alias?model.body[k].alias:k
                    })
                    //console.log("设置模型主键",model.name,k,model.body[k].alias);
                }
            }
            modelFieldKeyMap.set(model.name, mmap);
            realFieldToVfieldMap.set(model.name, rTovMap);

            // 记录模型间的关联关系
            if (model.relation) {
                modelRelationMap.set(model.name, model.relation);
            }


            //console.log(modelFieldKeyMap);
			if(dbconfig.updateFiled) 
			{
				console.log("自动更新模型字段");
				instance.sync({alter: true});// 自动更新字段
			}
        }

        if (typeof regGlobal != "undefined") {
            // 注册模型字段映射
            regGlobal("$modelFieldMap", modelFieldKeyMap);
            regGlobal("$modelPrimaryKeyMap", modelPrimaryKeyMap);
            regGlobal("$realFieldToVfieldMap", realFieldToVfieldMap);
            //regGlobal("$modelRelationMap",modelRelationMap);
            //console.log("注册模型字段映射（虚拟字段映射真实字段、真实字段映射虚拟字段）， 模型主键，");
        }

        await instance.sync({
            force: false
        });
        //console.log("数据库初始化完成...", new Date().getTime(),modelPrimaryKeyMap);
        let relationship = opt.relationship//?opt.relationship:(db)=>{
        //     return db;
        // }
        // 
        if(relationship){
            instance =  relationship(instance);
        }
        if (!instance) {
            throw new Error("数据库初始化失败，请在自定义的relationship方法中返回db对象");
        }

        var createRelation = async (value, key) => {
            for (let v of value) {
                if (!v.model) {
                    throw new Error(`模型${key}的关系中，model 字段为空`);
                }
                if (!v.type) {
                    throw new Error(`模型${key}的关系中，type 字段为空`);
                }
                if (!v.targetKey && v.type != 'belongsToMany') {
                    throw new Error(`模型${key}的关系中，targetKey 字段为空`);
                }

                if (!v.foreignKey) {
                    throw new Error(`模型${key}的关系中，foreignKey 字段为空`);
                }

                if (v.type == 'belongsToMany' && !v.through) {
                    throw new Error(`模型${key}的关系中 ，belongsToMany 类型的关系 through 字段不能为空`);
                }

                if (!v.as) {
                    throw new Error(`模型${key}的关系中 as字段为空`);
                }

                let code = null;
                if (v.type != 'belongsToMany') {
                    code = `
                     instance.models.${key}.${v.type}(instance.models.${v.model}, {
                        as: "${v.as}",
                       foreignKey: "${v.foreignKey}", //wuid mainTableId
                       targetKey: "${v.targetKey}"
                    })
                    `;
                } else {

                    code = `
                     instance.models.${key}.${v.type}(instance.models.${v.model}, {
                        through:"${v.through}",
                        as: "${v.as}",
                       foreignKey: "${v.foreignKey}", //wuid mainTableId
                      
                    })
                    `;

                }
                if (code) {
                    await eval(code);
                    //console.log("创建模型关系", code);
                }
            }
        }
        modelRelationMap.forEach((value, key) => {
            //console.log("模型关系",key,value)
            if (value && key) {
                createRelation(value, key);
            }
        })

        if (opt.modelTest) {
            await opt.modelTest(instance);
        }
        return instance;

    } catch (e) {
        throw "初始化数据库失败" + e;
    }
}