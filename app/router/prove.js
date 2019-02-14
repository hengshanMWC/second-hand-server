import Prove from '../controllers/prove'
import Router from 'koa-router'
const router = new Router
router
	.post('/add', Prove.add)//添加认证信息
	.get('/list', Prove.find)//查询认证列表
	.get('/info', Prove.info)//认证信息
	.post('/upInfo', Prove.upInfo)//更新认证信息
	.post('/auditing', Prove.auditing)//审核
	.get('/del', Prove.del)//删除认证

export default router.routes(); 