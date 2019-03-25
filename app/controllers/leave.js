import db from '../models'
import granary from '../plugins/granary'
import News from './news'
const coll = db.createCollection('news');
const setNumbe = ['c_score', 's_score']

//商品留言
export default class Leave {
	static async add(ctx) {
		await granary.aid(async post => {
			coll.number(post, ...setNumbe)
			post.n_type = 5;
			return await News.publicAdd(post)
		})
	}
	//根据商品id获取留言
	static async commodityList(ctx){
		await granary.aid(async get => {
			get.n_type = 5;
			get.l_id = get.id;
			delete get.id
			let list = await coll.find(get)
			await Leave.list(list)
			return list
		})
	}
	static async list(list){
		let len = list.list.length
		if(len === 0) return
		
	}
	//根据层主评论获取评论
	static async layerList(ctx){
		await granary.aid(async get => {
			get.n_type = 5;
			get.ent_id = get.id;
			return await Leave.list(get)
		})
	}
	
	//层里面的评论磨光
	static async listPolish(list){
		

	}
	// static async info(ctx) {
	// 	await granary.aid(get => coll._findOne({_id: get.id}))
	// }
	// static async upInfo(ctx) {
	// 	await granary.aid(post => {
	// 		coll.number(post, ...setNumbe)
	// 		let id = post.id
	// 		delete post.id
	// 		return coll._upOne({_id: id}, post)
	// 	})
	// }
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
	
}