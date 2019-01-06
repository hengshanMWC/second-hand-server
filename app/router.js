import Router from 'koa-router'
import User from './controllers/user'
const router = new Router
router.prefix('/second-hand/api')
// router.prefix('/second-hand/api/')//这样会找不到
router
	.post('/login', User.login)//登录
	.get('/isLogin',User.isLogin)//检查是否登录
	.get('/quit', User.quit)//退出登录
	.get('/currentUserInfo',User.currentInfo)//拿到当前登录人信息
	.post('/addUser', User.add)//用户列表
	.get('/getUserList', User.find)//查询用户列表
	.get('/getUserInfo', User.info)//用户信息
	.post('/upUserInfo', User.updata)//更新用户信息
	.get('/delUser', User.del)//删除用户
export default router
