import db from '../models'
import md5 from 'md5'
import granary from '../plugins/granary'
import fnUser from '../utils/user'
// db.setCollection('user');
const coll = db.createCollection('user');

class User {
	//登录
	static async login(ctx){
		await granary.aid(async post => {
			let res = {};
			post.u_password = md5(post.u_password) 
			let data = await coll._findOne({u_account: post.u_account})
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
	static async currentInfo(ctx) {
		await granary.aid(async () => {
			// coll._updateMany('user',{}, {l_reliable: 0,l_fine:0})
			// coll._updateMany('commodity',{}, {$unset: {co_num: 0,co_c_score:0,co_s_score:0}})
			if(!ctx.session.userInfo) return {state: false, mes: '当前没有登录人'}
			return await coll._findOne({_id: ctx.session.userInfo._id})
		})
	}
	//添加用户
	static async add(ctx){
		await granary.aid(async post => {
			fnUser.add(post, false)
			return coll._addOne(post)
		})
	}
	//用户列表
	static async find(ctx){
		await granary.aid(async get => {
			return await coll._find(get, fnUser.find(get, false, coll))
		})
	}
	//用户信息
	static async info(ctx){
		await granary.aid(async get => await coll._findOne({"_id": get.id}, {projection:{u_password: 0}}))
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
			let uData = await coll._findOne({_id: id}, {projection:{u_password: 0}})
			let u_name = post.u_name;
			let u_school = post.u_school;
			//更新
			if(uData.u_name !== u_name || uData.u_school !== u_school)
				coll._updateMany('commodity', {"u_id": id}, {$set:{u_name,u_school}})
			return await coll._upOne({"_id": id}, post)
		})
	}
	//删除用户
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
	
}
export default User;
