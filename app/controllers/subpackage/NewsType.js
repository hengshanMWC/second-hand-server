import db from '../../models'
import granary from '../../plugins/granary'
const coll = db.createCollection();
function order(id, n_content){

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
				break;
				case 5://5商品评论
				await NewsType.commodityComment(post)
				break;
				case 6://6问题回复
				await NewsType.feedbackReply(post)
				break;
			} 
			coll._upOne('user', {_id: post.u_id}, up)
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
		post.n_content = NewsType.orderContent(post)
		//买方
		const bTitle = []
		console.log('order',post)
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