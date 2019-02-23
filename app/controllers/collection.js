import db from '../models'
import granary from '../plugins/granary'
const coll = db.createCollection('collection');
//收藏
class banner {
	static async add(ctx) {
		await granary.aid(async post => coll._addOne(post))
	}
	static async find(ctx){
		await granary.aid(async get => {
			let id = get.id
			delete get.id
			let data = Object.assign({_id: id}, get)
			coll.vague(data)
			let fData = await coll._find(data)
			let cArr = fData.list.map( arr => coll.getObjectId(arr.c_id))
			let cData = await coll._find('commodity', {
				_id: {
					"$in": cArr
				}
			})
			coll.relation(
				{ data: cData.list, key: '_id'}, 
				{ data :fData.list, key: 'c_id'}, 
				'commodity')
			return fData
		})
	}
	static async del(ctx){
		await granary.aid( async get => {
			if(get.id){
				return await coll.del(get)
			} else {
				return await coll._delOne({
					u_id: get.u_id,
					c_id: get.c_id
				})
			}
		})
	}
	
}
export default banner 