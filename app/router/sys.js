import Sys from '../controllers/sys'
import Router from 'koa-router'
const router = new Router
router
	.get('/list', Sys.find)//管理员列表
	.post('/add', Sys.add)//管理员列表
export default router.routes()