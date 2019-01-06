import db from '../models'
import md5 from 'md5'
import granary from '../plugins/granary'
db.setCollection('user');

class user {
	//登录
	static async login(ctx){
		await granary.aid(async post => {
			let res = {};
			post.u_password = md5(post.u_password) 
			let data = await db.find({u_account: post.u_account})
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
			return db.add(post)
		})
	}
	//用户列表
	static async find(ctx){
		await granary.aid(async get => await db.finds(get,{u_password: 0}))
	}
	//用户信息
	static async info(ctx){
		await granary.aid(async get => await db.find({"_id": get.id}))
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
			return await db.up({"_id": id}, post)
		})
	}
	//删除用户
	static async del(ctx) {
		await granary.aid(async get => await db.del({"_id": get.id}))
	}
}
export default user;