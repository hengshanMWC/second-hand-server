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
			await Leave.listPolish(data)
			await Leave.list(data)
			return data
		})
	}
	static async list(data){
		let list = data.list
		for(let i = 0, len = list.length; i < len; i++) {
			let leave = list[i]
			let query = {
				ent_id: leave._id,
				pageIndex: 1,
				pageSize: 2,
			}
			leave.ent = await Leave.getlayerList(query)
		}
	}
	//根据层主评论获取评论
	static async layerList(ctx){
		await granary.aid(async get => {
			get.ent_id = get.id;
			delete get.id
			return await Leave.getlayerList(get)
		})
	}
	static async getlayerList(get){
		let data = await coll._find(get, pro)
		reverse(data)
		await Leave.listPolish(data)
		return data
	}
	//层里面的评论磨光
	static async listPolish(data){
		let par = {
				u_account: 1,
				u_name: 1,
				u_avatar: 1,
			}
		//被回复人
		await coll.joint({
			fitData: data,
			apiKey: 'u_user',
			par,
		})
		//回复人
		await coll.joint({
			id: 'n_id',
			fitData: data,
			apiKey: 'n_user',
			par,
		})
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