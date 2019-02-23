import db from '../models'
import granary from '../plugins/granary'
const coll = db.createCollection('news');//个人,认证，反馈
const setNumbe = ['n_type']
function delFuse(post, setData){
	let data = coll.delFuse(post, setData)
	coll.number(data, ...setNumbe)
	return data
}
//消息中心
class News {
	static async publicAdd(post, u_static){
		const map = {
			'n_type:1-认证2-问题反馈3-公告4-其他': !post.n_type,
			'请输入标题n_title': !post.n_title,
			'内容不能为空n_content': !post.n_content,
		}
		let b = granary.judge(map)
		let setData = {
				n_type: '',
				n_title: '<h1>消息中心</h1>',
				n_content: '<span>无内容</span>',
				u_id: '',//指定某人的信息
				n_id: ''//发布公告的人
			}
		if(b) return {state: false, mes: b}	
		post.n_del = []
		if(post.n_type > 2 ){//公告，其他
			const res = coll.islogin(post,ctx.session.userInfo);
			if(res) return res
			coll._updateMany('user', {}, {$inc: {
				u_news: 1,
			}})
			setData.n_del = []//软删除
		} else {
			console.log(post.id,post.u_id)
			if(!post.u_id){
				let pData = await coll._findOne('prove', {_id: post.id},{projection: {u_id: 1}})
				console.log(pData)
				post.u_id = pData.u_id
			} else {
				post.n_id = post.u_id
			}
			let up = {
				$inc: {
					u_news: 1,
				}
			}
			//认证，反馈
			//认证有审核状态u_apply: {u_static: 0}
			if(post.n_type === 1){
				up.$set = { 
					'u_apply.u_static': u_static
				}
			}
			coll._upOne('user', {_id: post.u_id}, up)
		}		
		let data = delFuse(post, setData)
		return await coll._addOne(data)
	}

	static async add(ctx) {
		await granary.aid(async post => await this.publicAdd(post, 1))
	}
	static async find(ctx){
		await granary.aid(async get => {
			coll.number(get, ...setNumbe)
			coll.vague(get, ...setNumbe)
			let projection = {
				u_name: 1
			}
			let nData = await coll._find(get, {$projection: {
				n_content: 0
			}}) 
			//获取发布人
			await coll.joint({
				id: 'n_id',
				par: projection,
				fitData: nData,
				apiKey: 'p_name',
				fitAppointKey: 'u_name'
			})
			//获取指定人
			await coll.joint({
				par: projection,
				fitData: nData,
				apiKey: 'u_name',
				fitAppointKey: 'u_name'
			})
			return nData
		})
	}
	static async info(ctx) {
		await granary.aid( get => coll._findOne({_id: get.id}))
	}
	static async upInfo(ctx) {
		await granary.aid(post => {
			coll.number(post, ...setNumbe)
			let id = post.id
			return coll._upOne({_id: id}, delFuse(post))
		})
	}
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
	//软删除
	static async softDel(ctx){
		await granary.aid( async get => coll._upOne({_id: get.id}, {$push: {n_del: get.u_id}}))
	}
}
export default News 