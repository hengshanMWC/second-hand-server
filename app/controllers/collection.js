import db from '../models'
import granary from '../plugins/granary'
const coll = db.createCollection('banner');
//收藏
class banner {
	static async add(ctx) {
		await granary.aid(async post => coll._addOne(post))
	}
	static async find(ctx){
		await granary.aid(async get => {
			coll.vague(get)
			let fData = await coll._find(get)	
			return fData
		})
	}
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
	
}
export default banner 