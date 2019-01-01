import db from '../models'
import datum from '../utils/datum'
import md5 from 'md5'
db.setCollection('user');

class user {
	//登录
	static login(ctx){
		datum(ctx, async post => {
			let res = {};
			post.u_password = md5(post.u_password) 
			let data = await db.find({u_account: post.u_account})
			if(data) {
				if (data.u_password === post.u_password) {
					res.data = data
					res.message = '登录成功'
					ctx.session.userInfo = data;
				} else {
					res.message = '密码错误'
					res.state = false
				}
			} else {
				res.message = '没有该账号'
				res.state = false
			}
			return res;
		}, 'post')
	}
	//是否登录
	static isLogin(ctx){
		datum(ctx,() => ({statie: !!ctx.session.userInfo}))
	}
	//退出登录
	static quit(){
		datum(ctx, () => ctx.session.userInfo = undefined)
	}
	//添加用户
	static async add(ctx){
		await datum(ctx, async post => {
			post.u_password = md5(post.u_password) 
			return {data: await db.add(post)}
		}, 'post')
	}
	//查询用户
	static async find(ctx){
		await datum(ctx, async get => ({data: await db.finds(get)}), 'get')
	}
	//用户信息
	static async info(ctx){
		await datum(ctx, async get => ({data: await db.find({"_id": get.id})}),'get')
	}
	//更新用户
	static async updata(ctx) {
		await datum(ctx, async post => {
			let id = post.id
			delete post.id
			return {data: await db.up(post, {"_id": id})}
		}, 'post')
	}
	//删除用户
	static async del(ctx) {
		await datum(ctx, async get => ({data: await db.del({"_id": get.id})}), 'get')
	}
}
export default user;