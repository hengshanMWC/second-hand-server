import db from '../models'
import granary from '../plugins/granary'
import md5 from 'md5'
import fnUser from '../utils/user'
// db.setCollection('user');
const coll = db.createCollection('user');
//管理员
class Sys {
	//管理员列表
	static async find(ctx){
		await granary.aid(async get => {
			return await coll._find(get, fnUser.find(get, true, coll), )
		})
	}
	//添加管理员
	static async add(ctx){
		await granary.aid(async post => {
			fnUser.add(post, true)
			return coll._addOne(post)
		})
	}
}
export default Sys;