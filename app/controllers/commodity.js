import db from '../models'
import granary from '../plugins/granary'
const coll = db.createCollection('commodity');
const setNumber = ['c_price', 'c_num', 'c_state']
function getMap(post){
	return {
		'商品名不能为空': !post.c_title,
		'请传入商品分类': post.c_type === undefined,
		'请传入二级分类': post.c_type2 === undefined,
		'价格必须大于0': post.c_price <= 0,
		'数量不能为空': post.c_num === undefined,
	}
}
async function addAnSet(post, fn){
	let b = granary.judge(getMap(post))
	if(b){
		return {state: false, mes: b}
	} else {
		if(post.c_images && !(post.c_images instanceof Array)) return {state: false, mes: '图片格式为数组'}
		return await fn()
	}
}
//商品
class Commodity {
	static async add(ctx) {
		await granary.aid(async post => {
			return addAnSet(post,async () => {
				if(!post.u_id) return {state: false, mes: '用户id不能为空'}
				let uData = await coll._findOne('user', {_id: post.u_id})
				post.u_school = uData.u_school 
				post.u_name = uData.u_name 
				coll.number(post, ...setNumber)
				post.c_sales = 0//销量
				return coll._addOne(post)
			})
		})
	}
	static async find(ctx){
		await granary.aid(async get => {
			coll.number(get, ...setNumber)
			coll.vague(get, 'c_state')
			let cData = await coll._find(get, {$projection: {
				c_detail: 0
			}})	
			// await coll.joint({
			// 	par: {$projection: {
			// 		u_school: 1,
			// 		u_name: 1,
			// 	}},
			// 	fitData: cData,
			// })
			return cData

		})
	}
	static async upInfo(ctx){
		await granary.aid(async post => {
			if(!post.c_id) return {state: false, mes: '商品c_id不能为空'}
			if(post.c_price != undefined && post.c_price != '' && post.c_price <= 0) return {state: false, mes: '价格c_price大于0'}
			if(post.c_num != undefined && post.c_num != '' && post.c_num <= 0) return {state: false, mes: '数量c_num大于0'}
			let c_id = post.c_id
			let data = {
	          c_title: true,
	          c_type: true,
	          c_type2: true,
	          c_images: true,
	          c_price: true,
	          c_address: true,
	          c_num: true,
	          c_state: 2,
	          c_detail: true,
	          c_qq: true,
	          c_tel: true,
	          c_wx: true,
	        }
	        let dbData = {} 
			for(let val in data) {
				let v = data[val] 
				if(v && post[val]){
					dbData[val] = post[val]
				} else if(v !== true){
					dbData[val] = v
				}
			}
			coll.number(dbData, ...setNumber)
			return coll._upOne({_id: c_id}, dbData)
		})
	}
	static async info(ctx){
		await granary.aid(async get => {
			let cData = await coll._findOne({_id: get.id})
			let uData = await coll._findOne('user',{_id: cData.u_id}, {projection:{
				u_password: 0,
				power: 0,
			}})
			if(ctx.session.userInfo){
				let collData = await coll._findOne('collection',{u_id: ctx.session.userInfo._id, c_id: get.id})
				if(collData) {
					cData.c_col = 1
					cData.col_id = collData._id
				} else {
					cData.c_col = 0
				}
			} else {
				cData.c_col = 0
			}
			return Object.assign({}, cData, uData)
		})
	}
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
	static async isBuy(ctx){
		await granary.aid( async get => {
			const map = {
				'没有商品c_id': !get.c_id,
				'没有用户u_id': !get.u_id,
			}
			let b = granary.judge(map)
			if(b) return {state: false, mes: b}
			let data = await coll._findOne('order', {
				u_id: get.u_id,
				c_id: get.c_id,
			})
			return {state: !!data}
		})
	}
}
export default Commodity