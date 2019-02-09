import Type from '../controllers/type'
import Router from 'koa-router'
const router = new Router
router
	.post('/add', Type.add)//商品类型添加
	.get('/list', Type.find)//商品类型列表
	.get('/info', Type.info)//商品类型详情
	.post('/upInfo', Type.upInfo)//商品类型更新
	.get('/del', Type.del)//商品类型列表
export default router.routes()