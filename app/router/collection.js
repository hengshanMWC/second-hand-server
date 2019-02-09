import Collection from '../controllers/collection'
import Router from 'koa-router'
const router = new Router
router
	.post('/add', Collection.add)//添加收藏
	.get('/list', Collection.find)//查询收藏列表
	.get('/del', Collection.del)//删除收藏

export default router.routes(); 