import db from '../../models'
import granary from '../../plugins/granary'
import { newObj } from '../../utils/common'
import News from '../news.js'
const coll = db.createCollection();
function sTitle(title){
	return `<h1 class="ql-align-center">${title}</h1>`
}
function fOrder(i){
	const title = [
		'订单失效',//0
		'未发货',//1
		'订单发货',//2
		'订单交易成功'//3,
	]
	return title[i]
}
function orderContent(post){
	post.n_content = `${sTitle('订单消息')}<p>订单号： ${post.l_id}</p>
	<p>订单状态：${post.stateText}</p>
	<p>操作人：${post.n_account}</p>
	<p>卖家：${post.s_account}</p>
	<p>买家：${post.b_account}</p>
	<p>商品名：${post.c_title}</p>`
}
function getOrderStateText(...arr){
	return arr.map( val => fOrder(val)).join(' >>> ')
}
class NewsType {
	static async core(post,aux){
		let up = {
			$inc: {
				u_news: 1,
			}
		}

		//额外的字段
		let parm = {}
		if(post.n_type === 0 ){//公告
			NewsType.notice(post)
		} else if(post.n_type === 4){//订单
			//买卖家都加
			await NewsType.order(post)
			let where = {_id: {
				"$in": [coll.getObjectId(post.c_id), coll.getObjectId(post.b_id)]
			}}
			parm.old_state = ''
			parm.o_state = ''
			coll._upOne('user', where, up)
		} else if(post.n_type !== 0 && post.n_type !== 4){
			switch(post.n_type){
				case 1://个人消息
				await NewsType.other(post)
				break;
				case 2://认证
				await NewsType.prove(post)
				up.$set = { 
					'u_apply.u_static': aux
				}
				break;
				case 3://反馈
				await NewsType.feedback(post)
				break;
				case 5://5商品评论
				await NewsType.commodityComment(post, parm)
				break;
				case 6://6问题回复
				await NewsType.feedbackReply(post)
				break;
			} 
			if(post.u_id){
				coll._upOne('user', {_id: post.u_id}, up)
			}
		}
		return parm
	}
	//0公告
	static notice(post){
		const res = granary.islogin(post, 'n_id');
		if(res) return res
		//公告所有人获得u_news++
		coll._updateMany('user', {}, {$inc: {
			u_news: 1,
		}})
	}
	//1个人消息
	static async other(post){
		const res = granary.islogin(post, 'n_id');
		if(res) return res	
		//通过账号获取u_id
		let uData = await coll._findOne('user', {u_account: post.n_account}, {projection: {_id: 1}})
		post.u_id = uData._id
	}
	//2认证
	static async prove(post){
		if(!post.u_id){
			//更新,通过认证id获得u_id
			let pData = await coll._findOne('prove', {_id: post.id},{projection: {u_id: 1}})
			post.u_id = pData.u_id
		} else {
			//添加认证消息
			post.n_id = post.u_id
		}
	}
	//3问题反馈
	static async feedback(post){
		post.n_id = post.u_id
	}
	//4订单
	static async order(post){
		await NewsType.getOrder(post)
		await NewsType.orderGetUser(post)
		orderContent(post)
		NewsType.addOrderNew(post)
		post.u_id = post.b_id;
		//新增
		// { o_name: '12324234',
		//    o_address: '123234234',
		//    o_tel: '234234',
		//    b_id: '5c4dbe05b88b272b497707ee',
		//    c_id: '5c56fe4802d368732e661f5e',
		//    o_state: 1,
		//    o_price: 2222,
		//    o_num: 1,
		//    s_id: '5c4dbfbbb88b272b497707ef',
		//    c_title: '李白传',
		//    o_del: [],
		//    n_type: 4,
		//    n_content: undefined }

		//修改状态
	// 	{ id: '5c810ae35ff9b626637c42a1',
		 // o_state: 3,
		 // n_type: 4,
		 // n_content: undefined }
	}
	//获取订单相关信息
	static async getOrder(post){
		if(post.id){
 			let oData = await coll._findOne('order', {_id: post.id}, {
 				projection: {
 					c_id: 1,
 					s_id: 1,
 					b_id: 1,
 					c_title: 1,
 				}
 			}) 
 			let cData = await coll._findOne('commodity', {_id: oData.c_id}, {
 				projection: {c_title: 1}
 			})
			post.l_id = post.id;
			post.s_id = oData.s_id
			post.b_id = oData.b_id
			post.t_id = oData.t_id
			post.c_title = cData.c_title
			post.stateText = getOrderStateText(post.old_state, post.o_state)
		} else {
			let oData = await coll._findOne('order', {
				s_id: post.s_id, //卖家
				b_id: post.b_id,//买家
				c_title: post.c_title,
			}, {projection:{_id: 1}}) 
			post.l_id = oData._id;
			post.stateText = getOrderStateText(post.o_state)
		}

	}
	//根据订单获取用户
	static async orderGetUser(post){
		let pro = {projection:{u_account: 1}}
		let sData = await coll._findOne('user', {_id: post.s_id}, pro)
		let bData = await coll._findOne('user', {_id: post.b_id}, pro)
		post.s_account = sData.u_account
		post.b_account = bData.u_account
	}
	static async addOrderNew(post){
		let newPost = newObj(post)
		newPost.u_id = post.s_id;
		let data = News.data(newPost)
		coll._addOne('news', data)
	}
	//5商品评论
	static async commodityComment(post, parm){
		const res = granary.islogin(post, 'n_id');
		if(res) return res
		// 订单评论
		if(post.o_id){
			await NewsType.orderComment(post)
			parm.o_id = ''//订单
			parm.c_score = ''//	商品评分
			parm.s_score = ''//	服务评分
		//商品楼中楼
		} else if(post.ent_id){
			await NewsType.comments(post, parm)//评论
			parm.ent_id = ''//评论id
		//商品评论
		} else {
			await NewsType.cc(post)
		}
	}
	//订单评论
	static async orderComment(post){
		// let nData = await coll._findOne('news', {_id: post.reply_id}, {$projection: {
		// 	n_id: 1
		// }})
	}
	//回复：
	static async commentReply(post, parm) {
		let nData = await coll._findOne('news', {_id: post.reply_id}, {$projection: {
			n_id: 1
		}})
		//回复者和楼中楼是否同一个人
		if(post.n_id !== nData.n_id){
			post.u_id = nData.n_id
			//楼中楼+消息
			coll._upOne('user', {_id: post.u_id}, {
				$inc: {
					u_news: 1,
				}
			})
			coll._addOne('news', News.data(post, parm))
		}
	}
	//楼中楼评论：根据ent_id获得评论消息的发布人
	static async comments(post, parm){
		let nData = await coll._findOne('news', {_id: post.ent_id}, {$projection: {
			n_id: 1
		}})
		//评论者和层主是否同一个人
		if(post.n_id !== nData.n_id){
			post.u_id = nData.n_id
		}
		if(post.reply_id){
			parm.reply_id = ''//评论id
			NewsType.orderComment(newObj(post), parm)
		}
	}
	//商品评论：根据l_id获取商品的发布人
	static async cc(post){
		let cData = await coll._findOne('commodity', {_id: post.l_id}, {$projection: {
			u_id: 1
		}})
		//评论者和卖家是否同一个人
		if(post.n_id !== cData.u_id){
			post.u_id = cData.u_id
		}
		
	}
	//6问题回复
	static async feedbackReply(post){
		let fData = await coll._findOne('feedback', {_id: post.id},{$projection: {
			u_id: 1
		}})
		post.l_id = post.id
		post.n_id = post.u_id
		post.u_id = fData.u_id
		post.n_content = post.f_content
	}
}
export default NewsType