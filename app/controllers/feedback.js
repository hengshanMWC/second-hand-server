import db from '../models'
import granary from '../plugins/granary'
const coll = db.createCollection('feedback');
const setNumbe = ['f_type']

//问题反馈
class Feedback {
	static async add(ctx) {
		await granary.aid(post => {
			coll.number(post, ...setNumbe)
			const res = coll.islogin(post,ctx.session.userInfo);
			if(res) return res
			return coll._addOne(post)
		})
	}
	static async find(ctx){
		await granary.aid(async get => {
			coll.number(get, ...setNumbe)
			return await coll._find(get)
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
export default Feedback 