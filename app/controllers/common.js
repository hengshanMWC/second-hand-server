import granary from '../plugins/granary'
import abReq from '../utils/abReq'
import upFile from '../utils/upFile.js'
let url = 'http://119.29.166.254:9090/api/';
let fileUrl = '/upFile/img'
//公共
class Common {
	//省份
	static async provinceList(ctx){
		await granary.aid( async get => await abReq(`${url}provinces`))
	}
	//城市
	static async cityList(ctx){
		await granary.aid( async get => await abReq({
			url: `${url}province/getCitiesByProvinceId`,
			qs: {
				id: get.id
			}
		}))
	}
	//学校列表
	static async schoolList(ctx){
		await granary.aid( async get => await abReq({
			url: `${url}university/getByUniversityName`,
			qs: {
				name: get.name || ''
			}
		}))
	}
	//省份获取学校
	static async getschoolList(ctx){
		await granary.aid( async get => await abReq({
			url: `${url}university/getUniversityByProvinceId`,
			qs: {
				id: get.id || ''
			}
		}))
	}
	//城市获取学校
	static async getUniversityByCityName(ctx){
		await granary.aid( async get => await abReq({
			url: `${url}university/getUniversityByCityName`,
			qs: {
				name: get.name || ''
			}
		}))
	}
	//获取图片
	static async upFile(ctx) {
		await granary.aid( async (post, files) => {
			let data = await upFile(files, '../public/second-hand' + fileUrl)
			return {url: fileUrl + data}
		})
	}
}
export default Common