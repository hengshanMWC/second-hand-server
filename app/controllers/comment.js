import db from '../models'
import granary from '../plugins/granary'
import News from './news'
const coll = db.createCollection('comment');
const setNumbe = ['c_score', 's_score']

//评论
class Comment {
	static async add(ctx) {
		await granary.aid(post => {
			coll.number(post, ...setNumbe)
			post.n_type = 5;
			return await News.publicAdd(post)
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
	// static async del(ctx){
	// 	await granary.aid( async get => coll.del(get))
	// }
	
}
export default Comment 