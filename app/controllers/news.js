import db from '../models'
import granary from '../plugins/granary'
const coll = db.createCollection('news');
const setNumbe = ['p_state']
//认证
class News {
	static async add(ctx) {
		await granary.aid(post => {
			// coll.number(post, ...setNumbe)
			const res = coll.islogin(post,ctx.session.userInfo);
			if(res) return res
			const map = {
				'n_type:1-认证2-问题反馈3-公告4-其他': !post.n_type,
				'请输入标题n_title': !post.n_title,
				'内容不能为空n_content': !post.n_content,
			}
			let b = granary.judge(map)
			if(b) return {state: false, mes: b}	
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
		await granary.aid(async get => {
			let info = await coll._findOne({_id: get.id})
			if(Array.isArray(info.p_contents)){
				let cArr = info.p_contents.map( arr => coll.getObjectId(arr.u_id))
				let uData = await coll._find('user', {
					_id: {
						"$in": cArr
					}
				})
				coll.relation({data: uData.list, key: '_id'}, {data: info.p_contents, key: 'u_id'},'u_name','u_name')
			}
			return info
		})
	}
	static async upInfo(ctx) {
		await granary.aid(post => {
			coll.number(post, ...setNumbe)
			let id = post.id
			const setData = {
				p_name: '',
				p_prove: '',
				p_school: '',
				p_image: '',
				p_state: '',
			}
			setState(post)
			let data = coll.delFuse(post, setData)
			return coll._upOne({_id: id}, data)
		})
	}
	//审核
	static async auditing(ctx) {
		await granary.aid(post => {
			coll.number(post, ...setNumbe)
			let id = post.id
			const setData = {
				p_state: '',
				p_content: '',
			}
			setState(post)
			let data = coll.delFuse(post, setData)
			if(data.p_content) {
				if(!Array.isArray(data.p_contents)) data.p_contents = new Array()
				try {
					data.p_contents.push({
						content: data.p_content,
						state: data.p_state,
						u_id: ctx.session.userInfo._id
						create_date: formatTimea(),
					}) 
				} catch(e) {
					return {mes: '审核用户需要登录', state: false}
				}
				delete data.p_content
			}
			return coll._upOne({_id: id}, post)
		})
	}
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
	
}
export default News 