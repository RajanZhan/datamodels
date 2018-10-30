var models = [];
models.push(require("./models/user.data"));
models.push(require("./models/userInfoAdd.data"));

function relationship(db){
	 db.models.user.hasOne(db.models.userInfoAdd, {
        as: "userInfo",
       foreignKey: "mainTableId", //wuid mainTableId
       targetKey: "wuid"
    })
	return db;
}

async function modelTest(db)
{
	//console.log("model test ",db);
	/*letdb.models.user.create({
		nickname:"rajan",
	})
	
	db.models.userInfoAdd.create({
		realName:"占",
		mainTableId:1
	})
	*/
	// let res = await db.models.user.findOne({
	// 	include:{
	// 		as:"userInfo",
	// 		model:db.models.userInfoAdd
	// 	},
	// 	where:{
	// 		wuid:1,
	// 	}
	// })
	// console.log("查询的结果",res.userInfo.realName);
	//return db;
}


async function start (){
	let db = await require("../index")({
		config:{
			"host":"127.0.0.1",
			"db":"spider",
			"uname":"root",
			"pwd":"11111111"
		},
		models:models,
		relationship:relationship,
		modelTest:modelTest,
	});
	//console.log("db is ",db);
}
start();