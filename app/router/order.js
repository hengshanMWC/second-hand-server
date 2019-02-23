import Order from '../controllers/order'
import Router from 'koa-router'
const router = new Router
router
	.post('/add', Order.add)//添加订单信息
	.get('/list', Order.find)//查询订单列表
	.post('/upInfo', Order.upInfo)//更新订单
	.get('/del', Order.del)//删除订单 softDel
	.get('/softDel', Order.softDel)//软删除
export default router.routes(); 