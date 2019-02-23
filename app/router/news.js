import News from '../controllers/news'
import Router from 'koa-router'
const router = new Router
router
	.post('/add', News.add)//添加消息
	.get('/list', News.find)//查询消息列表
	.post('/upInfo', News.upInfo)//更新消息
	.get('/del', News.del)//删除消息 
	.get('/softDel', News.softDel)//软删除
export default router.routes(); 