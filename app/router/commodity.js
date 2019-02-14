import Commodity from '../controllers/commodity'
import Router from 'koa-router'
const router = new Router
router
	.post('/add', Commodity.add)//添加商品信息
	.get('/list', Commodity.find)//查询商品列表
	.get('/info', Commodity.info)//商品信息
	.post('/upInfo', Commodity.upInfo)//更新商品信息
	.get('/del', Commodity.del)//删除商品
	.get('/isBuy', Commodity.isBuy)//判断用户是否购买过该商品

export default router.routes(); 