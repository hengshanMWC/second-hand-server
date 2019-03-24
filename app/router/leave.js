import Leave from '../controllers/leave'
import Router from 'koa-router'
const router = new Router
router
	.post('/add', Leave.add)//添加留言
	.get('/list', Leave.find)//根据商品或者评论获取留言
	// .get('/info', Leave.info)//轮播图信息
	// .post('/upInfo', Leave.upInfo)//更新轮播图信息
	// .get('/del', Leave.del)//删除轮播图

export default router.routes(); 