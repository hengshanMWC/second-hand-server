import Router from 'koa-router'
import sys from './sys'
import user from './user'
const router = new Router
router.prefix('/second-hand/api')
// router.prefix('/second-hand/api/')//这样会找不到
router
	.use('/user', user)//用户
	.get('/sys', sys)//管理员
export default router
