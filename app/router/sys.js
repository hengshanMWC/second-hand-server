import Sys from '../controllers/sys'
import Router from 'koa-router'
const router = new Router
router
	.get('/getList', Sys.find)//管理员列表
export default router.routes()