import db from '../models'
import granary from '../plugins/granary'
import News from './news'
const coll = db.createCollection('feedback');
const setNumbe = ['f_type']

// <h1 class="ql-indent-1 ql-align-center"><span class="ql-size-large">问题反馈</span></h1>
//问题反馈
class Feedback {
	static async add(ctx) {
		await granary.aid(post => {
			coll.number(post, ...setNumbe)
			const res = granary.islogin();
			if(res) return res
			News.publicAdd(Object.assign({
				n_content: '<h1 class="ql-align-center">问题反馈</h1><p>您的反馈已收到</p>',
				n_type: 3,
			},post))
			return coll._addOne(post)
		})
	}
	static async find(ctx){
		await granary.aid(async get => {
			coll.number(get, ...setNumbe)
			coll.vague(get, ...setNumbe)
			let fList =  await coll._find(get, {$projection: {
				f_content: 0
			}}) 
			//获取用户账号
			await coll.joint({
				par: {u_account: 1},
				fitData: fList,
			})
			return fList
		})
	}
	static async info(ctx) {
		await granary.aid(get => coll._findOne({_id: get.id}))
	}
	static async upInfo(ctx) {
		await granary.aid(post => {
			coll.number(post, ...setNumbe)
			let id = post.id
			const setData = {
				f_type: '',//	1-界面视觉 2-功能相关 3-内容错误 4-其他
				f_content: '',//反馈内容
				f_file: '',//附件
			}
			let data = coll.delFuse(post, setData)
			return coll._upOne({_id: id}, data)
		})
	}
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
	//反馈问题
	static async reply(ctx){
		await granary.aid( async post => {
			const res = granary.islogin();
			if(res) return res
			post.n_type = 6
			News.publicAdd(post)
		})
	}
}
export default Feedback 