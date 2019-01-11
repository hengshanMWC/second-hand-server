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
			return db._addOne(post)
		})
	}
	//用户列表
	static async find(ctx){
		await granary.aid(async get => {
			let arr = ['u_static']
			db.number(get, ...arr)
			db.vague(get, ...arr)
			get.power = {$ne: 'true'}
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