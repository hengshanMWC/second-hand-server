import db from '../models'
import granary from '../plugins/granary'
import md5 from 'md5'
// db.setCollection('user');
const coll = db.createCollection('user');
//管理员
class Sys {
	//管理员列表
	static async find(ctx){
		await granary.aid(async get => {
			let aN = ['u_sex']
			coll.number(get, ...aN)
			coll.vague(get, ...aN)
			get.power = true
			return await coll._find(get,{u_password: 0, u_age: 0, u_qq: 0, u_mail: 0})
		})
	}
	//添加管理员
	static async add(ctx){
		await granary.aid(async post => {
			post.u_password = md5(post.u_password) 
			const bDef = ['u_static']
			const def = {
				u_avatar: '/upFile/img/defalut/avatar.jpg',
			}
			post.power = true
			bDef.forEach( val => post[val] = post[val] === true ? true : false)
			Object.keys(def).forEach( val => post[val] = post[val] ? post[val] : def[val])
			return coll._addOne(post)
		})
	}
}
export default Sys;