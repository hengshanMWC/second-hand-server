import db from '../models'
import granary from '../plugins/granary'
const coll = db.createCollection('collection');
//收藏
export default class Collection {
	static async add(ctx) {
		await granary.aid(async post => {
			const res = granary.islogin();
			if(res) return res
			return coll._addOne(post)
		})
	}
	static async find(ctx){
		await granary.aid(async get => {

			let id = get.id
			delete get.id
			let data = Object.assign({_id: id}, get)
			coll.vague(data)
			let fData = await coll._find(data)
			//获取商品
			await coll.joint({
				id: 'c_id',
				collection: 'commodity',
				fitData: fData,
				apiKey: 'commodity',
				par:  {
					c_detail: 0,
				}
			})
			// let cArr = fData.list.map( arr => coll.getObjectId(arr.c_id))
			// let cData = await coll._find('commodity', {
			// 	_id: {
			// 		"$in": cArr
			// 	}
			// }, $projection: {
			// 	c_detail: 0,
			// })
			// coll.relation(
			// 	{ data: cData.list, key: '_id'}, 
			// 	{ data :fData.list, key: 'c_id'}, 
			// 	'commodity')
			return fData
		})
	}
	static async del(ctx){
		await granary.aid( async get => {
			if(get.id){
				return await coll.del(get)
			} else {
				const res = granary.islogin();
				if(res) return res
				return await coll._delOne({
					u_id: get.u_id,
					c_id: get.c_id
				})
			}
		})
	}
	
}