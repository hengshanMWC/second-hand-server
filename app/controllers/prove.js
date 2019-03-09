import db from '../models'
import granary from '../plugins/granary'
import { formatTime, newObj } from '../utils/common'
import News from './news'
const coll = db.createCollection('prove');
const setNumbe = ['p_state']
async function setState(post){
	let state = post.p_state
	if(state <= 0) return
	let pData = await coll._findOne({_id: post.id})
	let uData = await coll._findOne('user', {_id: pData.u_id})
	uData.u_static = state === 1 ? true : false
	coll._upOne('user', {_id: pData.u_id}, {
		u_static: uData.u_static, 
		'u_apply.u_static': 0
	})
}
function addNews(newPost, data, is){
	Object.assign(newPost, {
		n_type: 2,
	}, data)
	News.publicAdd(newPost, is)
}
//认证
class Prove {
	static async add(ctx) {
		await granary.aid(post => {
			// coll.number(post, ...setNumbe)
			const res = granary.islogin();
			if(res) return res
			post.p_state = 0
			addNews(newObj(post), {
				n_content: '"<p class="ql-indent-1">您的认证将于2个工作日内审核完成</p>"',
			}, 1)
			// coll._upOne('user', {_id: post.u_id}, {
			// 	'u_apply.u_static': 1
			// })
			return coll._addOne(post)
		})
	}
	static async find(ctx){
		await granary.aid(async get => {
			coll.number(get, ...setNumbe)
			coll.vague(get, ...setNumbe)
			return await coll._find(get)
		})
	}
	static async info(ctx) {
		await granary.aid(async get => coll._findOne({_id: get.id}))
	}
	static async upInfo(ctx) {
		await granary.aid(async post => {
			coll.number(post, ...setNumbe)
			let id = post.id
			const setData = {
				p_name: '',
				p_prove: '',
				p_school: '',
				p_image: '',
			}
			setState(post)
			let data = coll.delFuse(post, setData)
			return coll._upOne({_id: id}, data)
		})
	}
	//审核
	static async auditing(ctx) {
		await granary.aid(async post => {
			coll.number(post, ...setNumbe)
			let id = post.id
			post.l_id = post.id//消息的联系id
			const setData = {
				p_state: '',
				p_content: '',
				p_id: ''//操作人
			}
			const res = granary.islogin(post, 'p_id');
			if(res) return res
			// if(data.p_content) {
			// 	if(!Array.isArray(data.p_contents)) data.p_contents = new Array()
			// 	try {
			// 		data.p_contents.push({
			// 			content: data.p_content,
			// 			state: data.p_state,
			// 			u_id: ctx.session.userInfo._id,
			// 			create_date: formatTime(),
			// 		}) 
			// 	} catch(e) {
			// 		return {mes: '审核用户需要登录', state: false}
			// 	}
			// 	// coll._upOne('user', {_id: })
			// 	delete data.p_content
			// }
			let data = coll.delFuse(post, setData)	
			let newPost = newObj(post)
			newPost.n_id = post.p_id
			addNews(newPost, {
				n_content: data.p_content,
			}, 0)
			return coll._upOne({_id: id}, data)
		})
	}
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
	
}
export default Prove 