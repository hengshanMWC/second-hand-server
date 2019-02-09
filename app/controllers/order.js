import db from '../models'
import granary from '../plugins/granary'
const coll = db.createCollection('order');
const setNumber = ['o_price','o_num','o_state']
function getMap(post){
	return {
		'商品c_id不能为空': !post.c_id,
		'买方b_id不能为空': !post.b_id,
		'价格必须大于0': post.o_price <= 0,
		'数量必须大于0': post.o_num <= 0,
	}
}
//订单
class Order {
	static async add(ctx) {
		await granary.aid(async post => {
			coll.number(post, ...setNumber)
			let mes = granary.judge(getMap(post))
			if(mes){
				return {state: false, mes}		
			} else {
				let cData = await coll._findOne('commodity', {_id: post.c_id})
				if(post.o_num > cData.c_num) return {state: false, mes: '订单数量比商品数量多'}	
				post.o_price *= post.o_num
				if(post.o_price != cData.c_price * post.o_num) return {state: false, mes: '价格不对'}
				let upData = {}
				upData.c_num = cData.c_num - post.o_num
				if(upData.c_num <= 0) upData.c_state = 2
				await coll._upOne('commodity', {_id: post.c_id}, upData)
				post.s_id = cData.u_id//卖方id
				post.c_title = cData.c_title
				post.o_state = post.o_state ? post.o_state : 1
				return await coll._addOne(post)
			}
		})
	}
	static async find(ctx){
		await granary.aid(async get => {
			coll.number(get, )
			coll.vague(get, 'o_state')
			return await coll._find(get)	
		})
	}
	static async upInfo(ctx){
		await granary.aid(async post => {
			let mes = granary.judge(getMap(post))
			let _id = post.id
			let data = {
	          o_price: '',
	          o_num: 1,
	          o_state: '',
	        }
	        let dbData = {} 
			for(let val in data) {
				if(data[val] == '' && post[val]){
					dbData[val] = post[val]
				}
			}
			coll.number(post, ...setNumber)
			let fData = await coll._findOne({_id})
			if(dbData.o_state !== undefined && dbData.o_state != 0 && fData.o_state == 0){
				let sData = await coll._findOne('commodity', {_id: sData.s_id})
				console.log(fData,sData)
			}
			
			return coll._upOne({_id}, dbData)
		})
	}
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
}
export default Order