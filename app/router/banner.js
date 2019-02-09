import Banner from '../controllers/banner'
import Router from 'koa-router'
const router = new Router
router
	.post('/add', Banner.add)//添加轮播图信息
	.get('/list', Banner.find)//查询轮播图列表
	.get('/info', Banner.info)//轮播图信息
	.post('/upInfo', Banner.upInfo)//更新轮播图信息
	.get('/del', Banner.del)//删除轮播图

export default router.routes(); 