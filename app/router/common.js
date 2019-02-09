import Common from '../controllers/common'
import Router from 'koa-router'
const router = new Router
router
	.get('/provinceList', Common.provinceList)//获取省份
	.get('/cityList', Common.cityList)//获取城市
	.get('/schoolList', Common.schoolList)//模糊搜索
	.post('/upFile', Common.upFile)//上传头像

export default router.routes(); 