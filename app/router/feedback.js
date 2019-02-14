import Feedback from '../controllers/feedback'
import Router from 'koa-router'
const router = new Router
router
	.post('/add', Feedback.add)//添加反馈信息
	.get('/list', Feedback.find)//查询反馈列表
	.get('/info', Feedback.info)//反馈信息
	.post('/upInfo', Feedback.upInfo)//更新反馈信息
	.get('/del', Feedback.del)//删除反馈

export default router.routes(); 