import db from '../models'
import granary from '../plugins/granary'
const coll = db.createCollection('type');
//商品类型
class Type {
	static async add(ctx) {
		await granary.aid(async post => {
			if(!(post.t_types instanceof Array)) post.types = []
			post.t_weight =  post.t_weight === undefined ? 0 : Number(post.t_weight)
			return coll._addOne(post)
		})
	}
	static async upInfo(ctx){
		await granary.aid(async post => {
			if(!post._id) return {state: false, mes: '类型_id不能为空'}
			if(!(post.t_types instanceof Array)) post.types = []
			post.t_weight =  post.t_weight === undefined ? 0 : Number(post.t_weight)
			let _id = post._id
			delete post._id
			return coll._upOne({_id}, post)
		})
	}
	static async info(ctx){
		await granary.aid(async get => {
			if(!get.id) return {state: false, mes: '类型id不能为空'}
			return coll._findOne({_id: get.id})
		})
	}
	static async find(ctx){
		await granary.aid(async get => {
			let data = await coll._find(get)
			granary.sort(data, 't_weight')
			return data
		})
	}
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
	
}
export default Type