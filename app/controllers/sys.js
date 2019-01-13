import db from '../models'
import granary from '../plugins/granary'
db.setCollection('user');

class Sys {
	//用户列表
	static async find(ctx){
		await granary.aid(async get => {
			get.power = true
			return await db._find(get,{u_password: 0, u_age: 0, u_qq: 0, u_mail: 0})
		})
	}
}
export default Sys;