import db from '../models'
import granary from '../plugins/granary'
import News from './news'
const coll = db.createCollection('news');
const setNumbe = ['l_reliable', 'l_fine', 'n_type']

//购买评论
class Comment {
	static async add(ctx) {
		await granary.aid(async post => {
			coll.number(post, ...setNumbe)
			post.n_type = 7;
			return await News.publicAdd(post)
		})
	}
	static async find(ctx){
		await granary.aid(async get => {
			coll.number(get, ...setNumbe)
			// coll.vague(get, ...setNumbe);
			get.n_type = 7
			return coll._find(get)
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
export default Comment 