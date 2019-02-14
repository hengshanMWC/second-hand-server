import Router from 'koa-router'
import sys from './sys'
import user from './user'
import common from './common'
import commodity from './commodity'
import collection from './collection'
import type from './type'
import order from './order'
import banner from './banner'
import feedback from './feedback'
import prove from './prove'
const router = new Router
router.prefix('/second-hand/api')
// router.prefix('/second-hand/api/')//这样会找不到
router
	.use('/user', user)//用户
	.use('/sys', sys)//管理员
	.use('/common', common)//公共方法
	.use('/commodity', commodity)//商品
	.use('/collection', collection)//收藏
	.use('/type', type)//商品类型
	.use('/order', order)//商品订单
	.use('/banner', banner)//轮播图
	.use('/feedback', feedback)//问题反馈
	.use('/prove', prove)//认证
export default router
