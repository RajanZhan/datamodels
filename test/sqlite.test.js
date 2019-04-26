var models = [];
models.push(require("./models/user.data"));
models.push(require("./models/userInfoAdd.data"));


async function modelTest(db)
{

	let res = await db.models.user.findOne({
		include:{
			as:"userInfo",
			model:db.models.userInfoAdd
		},
		where:{
			wuid:1,
		}
	})
	//console.log("查询的结果",res);
	//return db;
}


async function start (){
	let db = await require("../index")({
		config:{
			"host":"127.0.0.1",
			"db":"spider",
			"uname":"root",
			"pwd":"11111111",
		    "port":"3306",
			type:"sqlite",
			storage:"./db.sqlite",
			logging:true,
			updateFiled:true,
		},
		models:models,
		//relationship:relationship,
		modelTest:modelTest,
	});
	//console.log("db is ",db);
}
start();