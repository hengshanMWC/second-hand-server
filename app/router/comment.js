import Comment from '../controllers/comment'
import Router from 'koa-router'
const router = new Router
router
	.post('/add', Comment.add)//添加评论
	.get('/list', Comment.find)//根据商品或者评论获取评论
	// .get('/info', Comment.info)//轮播图信息
	// .post('/upInfo', Comment.upInfo)//更新轮播图信息
	// .get('/del', Comment.del)//删除轮播图

export default router.routes(); 