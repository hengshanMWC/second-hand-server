import granary from '../plugins/granary'
import abReq from '../utils/abReq'
let url = 'http://119.29.166.254:9090/api/';
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
	static async upImg(ctx) {
		await granary.aid( async (post,files) => {
			console.log(post,files)
		})
	}
}
export default Common