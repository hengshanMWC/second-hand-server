import db from '../models'
import granary from '../plugins/granary'
import NewsType from './subpackage/NewsType'
import { newObj } from '../utils/common'

const coll = db.createCollection('news');//个人,认证，反馈
const setNumbe = ['n_type']
function delFuse(post, setData){
	let data = coll.delFuse(post, setData)
	coll.number(data, ...setNumbe)
	return data
}

//消息中心
class News {
	static data(post, parm = {}){
		let setData = {
			n_type: '',
			n_content: '<h1 class="ql-align-center">消息中心</h1>',
			u_id: '',//指定某人的信息
			n_id: '',//发布公告的人
			l_id: '',//联系的id，例如认证上的，则认证id
		}
		return delFuse(post, Object.assign(setData,parm))
	}
	static async publicAdd(post, aux){
		const map = {
			'n_type:0-官方公告1-个人消息2-认证消息3-问题反馈4-商品信息5-商品评论6-反馈回复': 
			isNaN(post.n_type) 
			&& post.n_type >= 0 
			&& post.n_type <= 6,
			// '内容不能为空n_content': !post.n_content,
		}
		let b = granary.judge(map)
		if(b) return {state: false, mes: b}	
		let parm = await NewsType.core(post,aux)
		let data = News.data(post, parm)
		NewsType.createOther(newObj(data))
		if(data.n_type === 0 || data.u_id){
			return await coll._addOne(data)
		} else {
			return {
		        "n": 1,
		        "ok": 1
		    }
		}
		
	}

	static async add(ctx) {
		await granary.aid(async post => await News.publicAdd(post))
	}
	static async find(ctx){
		await granary.aid(async get => await News.list(get))
	}
	static async clientFind(ctx) {
		await granary.aid(async get => {
			// get.
			const res = granary.islogin();
			if(res) return res
			let _id = await coll.softFind(get, 'del_news')
			get.$and = [
				{_id},//软删除
				{
					$or: [
						{
							u_id: coll.getObjectId(get.u_id)//用户
						},
						{n_type: 0}//公告
					]
				}
				
			]
			delete get.u_id
			return await News.list(get)
		})
	}
	static async list(get){
		coll.number(get, ...setNumbe)
		coll.vague(get, ...setNumbe)
		// console.log(JSON.stringify(get))
		let per = {$projection: {
			n_content: 0,
		}}
		if(get.per){
			per = {}
		}
		delete get.per

		let nData = await coll._find(get, per) 
		await News.joint(nData)
		return nData
	}
	static async joint(nData){
		let projection = {
			u_account: 1
		}
		//获取发布人
		await coll.joint({
			id: 'n_id',
			par: projection,
			fitData: nData,
			apiKey: 'n_name',
			fitAppointKey: 'u_account'
		})
		//获取指定人
		await coll.joint({
			par: projection,
			fitData: nData,
			apiKey: 'u_name',
			fitAppointKey: 'u_account'
		})
	}
	static async info(ctx) {
		await granary.aid( async get => {
			let nData = await coll._findOne({_id: get.id})
			async function getUser(_id, key){
				let pro = {projection:{u_account: 1}}
				let uData = await coll._findOne('user', {_id}, pro)	
				nData[key] = uData.u_account
			}
			if(nData.u_id) await getUser(nData.u_id, 'u_name')
			await getUser(nData.n_id, 'n_name')	
			return nData
		})
	}
	static async upInfo(ctx) {
		await granary.aid(post => {
			coll.number(post, ...setNumbe)
			let id = post.id
			post.n_id = ctx.session.userInfo._id
			return coll._upOne({_id: id}, delFuse(post,{
				n_content: '',
				n_id: ''
			}))
		})
	}
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
	//软删除
	static async softDel(ctx){
		await granary.aid( async get => await coll.softDel(get, 'del_news'))
	}
	//清空消息提示
	static async empty(ctx){
		await granary.aid( async get => {
			const res = granary.islogin();
			if(res) return res
			return await coll._upOne('user', {_id: get.u_id}, {
				$set: {
					u_news: 0
				}
			})
		})
	}
}
export default News 