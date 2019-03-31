import db from '../models'
import granary from '../plugins/granary'
import News from './news'
import { newObj } from '../utils/common'
const coll = db.createCollection('leave');
const setNumbe = ['c_score', 's_score']
let pro = {$projection: {
				n_del: 0,
				up_date: 0,
			}}
function exists(b){
	return {
				ent_id: {
					$exists: b
				}
			}
}
function reverse(data){
	data.list.reverse()
	return data
}
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
			get.l_id = get.id;
			delete get.id
			let parm = Object.assign({},get, exists(false))
			let data = await coll._find(parm, pro)
			await Leave.list(data, newObj(get))
			return reverse(data)
		})
	}
	static async list(data,get){
		let len = data.list.length
		Object.assign(get, exists(false))
		if(len === 0) return
	}
	//根据层主评论获取评论
	static async layerList(ctx){
		await granary.aid(async get => {
			get.ent_id = get.id;
			delete get.id
			let data = await coll._find(get, pro)
			Leave.listPolish(data)
			return reverse(data)
		})
	}
	
	//层里面的评论磨光
	static async listPolish(data){

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