import db from '../models'
import md5 from 'md5'
import granary from '../plugins/granary'
db.setCollection('user');

class User {
	//登录
	static async login(ctx){
		await granary.aid(async post => {
			let res = {};
			post.u_password = md5(post.u_password) 
			let data = await db._findOne({u_account: post.u_account})
			if(data) {
				if (data.u_password === post.u_password) {
					res.data = data
					res.mes = '登录成功'
					ctx.session.userInfo = data;
				} else {
					res.mes = '密码错误'
					res.state = false
				}
			} else {
				res.mes = '没有该账号'
				res.state = false
			}
			return res;
		})
	}
	//是否登录
	static isLogin(ctx){
		granary.aid(() => ({state: !!ctx.session.userInfo}))
	}
	//退出登录
	static quit(ctx){
		granary.aid(() => ctx.session.userInfo = undefined)
	}
	//拿到当前登录人信息
	static currentInfo(ctx) {
		granary.aid(() => ctx.session.userInfo)
	}
	//添加用户
	static async add(ctx){
		await granary.aid(async post => {
			post.u_password = md5(post.u_password) 
			const bDef = ['u_static', 'power']
			const def = {
				u_avatar: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1546710354901&di=6c92107f9216037d256d716893d02608&imgtype=0&src=http%3A%2F%2Fe.hiphotos.baidu.com%2Fzhidao%2Fwh%253D450%252C600%2Fsign%3Db1ae535a133853438c9a8f25a6239c48%2F29381f30e924b8992d85d90e6d061d950a7bf64f.jpg',
			}
			bDef.forEach( val => post[val] = post[val] === true ? true : false)
			Object.keys(def).forEach( val => post[val] = post[val] ? post[val] : def[val])
			return db._addOne(post)
		})
	}
	//用户列表
	static async find(ctx){
		await granary.aid(async get => {
			let aB = ['u_static']
			let aN = ['u_sex']
			db.boolean(get, ...aB)
			db.number(get, ...aN)
			db.vague(get, ...aB,...aN)
			get.power = {$ne: true}
			return await db._find(get,{u_password: 0, u_age: 0, u_qq: 0, u_mail: 0})
		})
	}
	//用户信息
	static async info(ctx){
		await granary.aid(async get => await db._findOne({"_id": get.id}, {projection:{u_password: 0}}))
	}
	//更新用户
	static async updata(ctx) {
		await granary.aid(async post => {
			let id = post.id
			delete post.id
			delete post._id
			if(post.u_password === '') {
				delete post.u_password
			} else {
				post.u_password = md5(post.u_password)
			}
			return await db._upOne({"_id": id}, post)
		})
	}
	//删除用户
	static async del(ctx) {
		await granary.aid(async get => {
			let data;
			let arrId = get.id;
			if(arrId instanceof Array) {

			} else {
				data = await db._delOne({"_id": arrId})
			}
			// let arr =  ? get : [get]
			// let arrId = arr.map( val => ({"_id": val.id}))
			// console.log(arrId)
			// let data = await db._del(arrId)
			return data;
		})
	}
}
export default User;