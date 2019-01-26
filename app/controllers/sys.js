import db from '../models'
import granary from '../plugins/granary'
import md5 from 'md5'
db.setCollection('user');

class Sys {
	//管理员列表
	static async find(ctx){
		await granary.aid(async get => {
			let aN = ['u_sex']
			db.number(get, ...aN)
			db.vague(get, ...aN)
			get.power = true
			return await db._find(get,{u_password: 0, u_age: 0, u_qq: 0, u_mail: 0})
		})
	}
	//添加管理员
	static async add(ctx){
		await granary.aid(async post => {
			post.u_password = md5(post.u_password) 
			const bDef = ['u_static']
			const def = {
				u_avatar: '/upFile/img/default.jpg',
				power: true
			}
			bDef.forEach( val => post[val] = post[val] === true ? true : false)
			Object.keys(def).forEach( val => post[val] = post[val] ? post[val] : def[val])
			return db._addOne(post)
		})
	}
}
export default Sys;