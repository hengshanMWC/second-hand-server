import granary from '../plugins/granary'
import abReq from '../utils/abReq'
import upFile from '../utils/upFile.js'
let url = 'http://119.29.166.254:9090/api/';
let fileUrl = '/upFile/img'
class Common {
	static async provinceList(ctx){
		await granary.aid( async get => await abReq(`${url}provinces`))
	}
	static async cityList(ctx){
		await granary.aid( async get => await abReq({
			url: `${url}province/getCitiesByProvinceId`,
			qs: {
				id: get.id
			}
		}))
	}
	static async schoolList(ctx){
		await granary.aid( async get => await abReq({
			url: `${url}university/getByUniversityName`,
			qs: {
				name: get.name || ''
			}
		}))
	}
	static async upFile(ctx) {
		await granary.aid( async (post, files) => {
			let data = await upFile(files, '../public/second-hand' + fileUrl)
			return {url: fileUrl + data}
		})
	}
}
export default Common