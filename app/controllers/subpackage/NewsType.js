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
			parm.old_state = ''
			parm.o_state = ''
			parm.c_title = ''
			//买卖家都加
			await NewsType.order(post, parm)
			let where = {_id: {
				"$in": [coll.getObjectId(post.c_id), coll.getObjectId(post.b_id)]
			}}
			
			coll._upOne('user', where, up)
		} else if(post.n_type !== 0 && post.n_type !== 4){
			switch(post.n_type){
				case 1://个人消息
				await NewsType.other(post)
				break;
				case 2://认证
				await NewsType.prove(post)
				parm.p_state = ''
				up.$set = { 
					'u_apply.u_static': aux
				}
				break;
				case 3://反馈
				await NewsType.feedback(post)
				break;	
				case 5://5商品留言
				await NewsType.commodityLeave(post, parm)
				break;
				case 6://6问题回复
				await NewsType.feedbackReply(post)
				break;
				case 7://7订单评价
				await NewsType.orderComment(post,parm)
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
	static async order(post, parm){
		await NewsType.getOrder(post)
		await NewsType.orderGetUser(post)
		orderContent(post)
		NewsType.addOrderNew(post, parm)
		post.u_id = post.b_id;
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
	static async addOrderNew(post, parm){
		let newPost = newObj(post)
		newPost.u_id = post.s_id;
		let data = News.data(newPost,parm)
		coll._addOne('news', data)
	}
	//5商品留言
	static async commodityLeave(post, parm){
		const res = granary.islogin(post, 'n_id');
		if(res) return res
		//商品层留言
		if(post.ent_id){
			parm.ent_id = ''//评论id
			await NewsType.layerLeave(post, parm)//评论
		//商品留言
		} else {
			await NewsType.leave(post)
		}
	}
	//商品留言：根据l_id获取商品的发布人
	static async leave(post){
		let cData = await coll._findOne('commodity', {_id: post.l_id}, {$projection: {
			u_id: 1
		}})
		//评论者和卖家是否同一个人
		if(post.n_id != cData.u_id){
			post.u_id = cData.u_id
		}
		
	}
	//楼中楼评论：根据ent_id获得评论消息的发布人
	static async layerLeave(post, parm){
		let lData = await coll._findOne('leave', {_id: post.ent_id}, {$projection: {
			n_id: 1
		}})
		//评论者和层主是否同一个人
		if(post.n_id != lData.n_id){
			post.u_id = lData.n_id
		}
		if(post.reply_id){
			parm.reply_id = ''//评论id
			await NewsType.reply(post, newObj(parm), lData.n_id.toString())
		}
	}
	//回复：
	static async reply(post, parm, n_id) {
		let lData = await coll._findOne('leave', {_id: post.reply_id}, {$projection: {
			n_id: 1
		}})
		post.u_id = lData.n_id
		// console.log(typeof lData.n_id)
		//回复者和被回复者是否同一个人.
		//如果层主，和被回复是同一个人，只能生成一条信息
		if(post.n_id != lData.n_id && n_id != lData.n_id){
			//楼中楼+消息
			coll._upOne('user', {_id: post.u_id}, {
				$inc: {
					u_news: 1,
				}
			})
			coll._addOne('news', News.data(post, parm))
		}
	}
	static async createOther(data){
		let text;
		switch(data.n_type){
			case 5:
			text = 'leave'
			break;
			case 7:
			delete data.l_id
			text = 'comment'
			break;
		}
		// console.log(data)
		delete data.n_type
		if(text) coll._addOne(text, data)
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
	//7订单评论
	static async orderComment(post, parm){
		parm.o_id = ''//订单
		parm.c_id = '' //商品id
		parm.l_reliable = '' //靠谱度		
		parm.l_fine = '' //性价比
		post.n_content = post.l_content
		//获取卖家
		let oData = await coll._findOne('order', {_id: post.o_id}, {
			s_id: 1,
			c_id: 1,
		})
		const res = granary.islogin(post, 'n_id');
		if(res) return res
		post.u_id = post.l_id = oData.s_id
		post.c_id =  oData.c_id
		//卖家增加
		coll._upOne('user', {_id: post.u_id}, {
			$inc: {
				l_reliable: post.l_reliable, //靠谱度
				l_fine: post.l_fine, //性价比
				l_num: 1,
			}
		})
		//订单已经评价
		coll._upOne('order', {_id: post.o_id}, {
			$set: {
				o_evaluate: true,//已经评价
			}
		})
	}
}
export default NewsType