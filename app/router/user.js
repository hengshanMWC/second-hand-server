import User from '../controllers/user'
import Router from 'koa-router'
const router = new Router
router
	.post('/login', User.login)//登录
	.get('/isLogin',User.isLogin)//检查是否登录
	.get('/quit', User.quit)//退出登录
	.get('/currentInfo',User.currentInfo)//拿到当前登录人信息
	.post('/add', User.add)//添加用户信息
	.get('/list', User.find)//查询用户列表
	.get('/info', User.info)//用户信息
	.post('/upInfo', User.updata)//更新用户信息
	.get('/del', User.del)//删除用户
export default router.routes()