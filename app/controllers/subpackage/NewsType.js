import db from '../../models'
import granary from '../../plugins/granary'
const coll = db.createCollection();
function sTitle(title){
	return `<h1 class="ql-align-center">${title}</h1>`
}
function orderContent(post){
	str = `<p>订单号： ${post.l_id}</p>
	<p>订单状态：${post.o_state}</p>
	<p>操作人：${post.n_id}</p>
	<p>卖家：${post.c_id}</p>
	<p>买家：${post.b_id}</p>
	<p>商品名：${post.c_title}</p>`
}

class NewsType {
	static async core(post, setData){
		if(post.n_type === 0 ){//公告
			NewsType.notice(post)
			setData.n_del = []//软删除
		} else if(post.n_type === 4){//订单
			//买卖家都加
			NewsType.order(post)
		} else if(post.n_type !== 0 && post.n_type !== 4){
			let where = {_id: post.u_id}
			let up = {
				$inc: {
					u_news: 1,
				}
			}

			switch(post.n_type){
				case 1://个人消息
				await NewsType.other(post)
				break;
				case 2://认证
				await NewsType.prove(post)
				up.$set = { 
					'u_apply.u_static': u_static
				}
				break;
				case 3://反馈
				await NewsType.feedback(post)
				break;
				case 4://4订单
				await NewsType.order(post)
				where = {_id: {
					"$in": [coll.getObjectId(post.c_id), coll.getObjectId(post.b_id)]
				}}
				break;
				case 5://5商品评论
				await NewsType.commodityComment(post)
				break;
				case 6://6问题回复
				await NewsType.feedbackReply(post)
				break;
			} 
			coll._upOne('user', where, up)
		}
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
		let oData;
		if(post.id){
 			oData = await coll._findOne('order', {_id: post.id}, {
 				projection: {
 					c_id: 1,
 					b_id: 1,
 					c_title: 1,
 				}
 			}) 
			post.l_id = post.id;
			post.c_id = oData.c_id
			post.b_id = oData.b_id
			post.t_id = oData.t_id
		} else {
			oData = await coll._findOne('order', {
				c_id: post.c_id, 
				b_id: post.b_id,
				c_title: post.c_title,
			}, {projection:{_id: 1}}) 
			post.l_id = oData._id;
		}
		// let oData = await coll._findOne('order', {}) 
		post.n_content = NewsType.orderContent(post)
		//买方
		const bTitle = []
		console.log('order',post)
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
	
	static orderContent(post){
		const title = [
			'订单失效',//0
			'商品信息',//1
			'订单发货',//2
			'订单交易成功'//3,
		]
	}
	//5商品评论
	static commodityComment(post){

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