import db from '../models'
import granary from '../plugins/granary'
const coll = db.createCollection('banner');
const setNumbe = ['b_weight', 'b_state']

//收藏
class Banner {
	static async add(ctx) {
		await granary.aid(post => {
			coll.number(post, ...setNumbe)
			return coll._addOne(post)
		})
	}
	static async find(ctx){
		await granary.aid(async get => {
			coll.number(get, ...setNumbe)
			coll.vague(get, ...setNumbe);
			let bBata = await coll._find(get)
			granary.sort(bBata, 'b_weight')
			return bBata
		})
	}
	static async info(ctx) {
		await granary.aid(get => coll._findOne({_id: get.id}))
	}
	static async upInfo(ctx) {
		await granary.aid(post => {
			coll.number(post, ...setNumbe)
			let id = post.id
			delete post.id
			return coll._upOne({_id: id}, post)
		})
	}
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
	
}
export default Banner 