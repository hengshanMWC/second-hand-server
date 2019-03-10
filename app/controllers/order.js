import db from '../models'
import granary from '../plugins/granary'
import News from './news'
import { newObj } from '../utils/common'

const coll = db.createCollection('order');
const setNumber = ['o_price','o_num','o_state']
function addNews(newPost){
	Object.assign(newPost, {
		n_type: 4,
	})
	News.publicAdd(newPost)
}
function getMap(post){
	return {
		'商品c_id不能为空': !post.c_id,
		'买方b_id不能为空': !post.b_id,
		'价格必须大于0': post.o_price <= 0,
		'数量必须大于0': post.o_num <= 0,
	}
}
//相同的状态和12状态不用理
//0到1,2，扣除商品数量（1）
//0到3，增加销量扣除商品数量（1）
//1,2到0，增加商品数量（-1）
//3到0，扣除销量增加商品数量（-1）
//如果是1，2 到3，增加销量（1）
//如果是3到1,2，减少销量（-1）
async function setCom(fData, dbData, n){
	let cData = await coll._findOne('commodity', {_id: fData.c_id})
	if(dbData.o_state == 0 || fData.o_state == 0) cData.c_num -= n * dbData.o_num//和0有关
	if(dbData.o_state == 3 || fData.o_state == 3) cData.c_sales += n * dbData.o_num//和3有关
	coll._upOne('commodity', {_id: fData.c_id}, cData)
}
// {projection:{u_account: 1}}
//订单
class Order {
	static async add(ctx) {
		await granary.aid(async post => {
			coll.number(post, ...setNumber)
			let mes = granary.judge(getMap(post))
			if(mes){
				return {state: false, mes}		
			} else {
				let cData = await coll._findOne('commodity', {_id: post.c_id}, {projection:{
					c_num: 1, 
					c_price: 1,
					u_id: 1,
					c_title: 1
				}})
				if(post.o_num > cData.c_num) return {state: false, mes: '订单数量比商品数量多'}
				if(post.o_price * post.o_num != cData.c_price * post.o_num) return {state: false, mes: '价格不对'}
				post.o_state = post.o_state ? post.o_state : 1
				if(post.o_state !== 0){//商品处理
					let upData = {}
					upData.c_num = cData.c_num - post.o_num
					if(upData.c_num <= 0) upData.c_state = 2
					if(post.o_state === 3) upData.c_sales += post.o_num
					await coll._upOne('commodity', {_id: post.c_id}, upData)
				}
				post.s_id = cData.u_id//卖方id
				post.c_title = cData.c_title
				post.o_del = [];//软删除
				addNews(newObj(post))
				return await coll._addOne(post)
			}
		})
	}
	static async find(ctx){
		await granary.aid(async get => {
			coll.number(get, ...setNumber)
			coll.vague(get, ...setNumber)
			let projection = {$projection: {u_account: 1}}
			let oData = await coll._find(get);
			//获取商品
			await coll.joint({
				id: 'c_id',
				collection: 'commodity',
				fitData: oData,
				apiKey: 'commodity',
				par: {$projection: {
					c_detail: 0,
				}}
			})
			//获取卖家
			await coll.joint({
				id: 's_id',
				par: projection,
				fitData: oData,
				apiKey: 's_name',
				fitAppointKey: 'u_account'
			})
			//获取买家
			await coll.joint({
				id: 'b_id',
				par: projection,
				fitData: oData,
				apiKey: 'b_name',
				fitAppointKey: 'u_account'
			})
			return oData
		})
	}
	static async upInfo(ctx){
		await granary.aid(async post => {
			let mes = granary.judge(getMap(post))
			let _id = post.id
			let data = {
	          // o_price: '',
	          // o_num: '',
	          o_state: '',
	        }
	        let dbData = {} 
			for(let val in data) {
				if(data[val] === '' && post[val] !== undefined){
					dbData[val] = post[val]
				}
			}
			coll.number(dbData, ...setNumber)
			let fData = await coll._findOne({_id})
			let setI = 0;
			//相同的状态和12状态不用理
			//0到1,2，扣除商品数量（1）
			//0到3，增加销量扣除商品数量（1）
			//1,2到0，增加商品数量（-1）
			//3到0，扣除销量增加商品数量（-1）
			//如果是1，2 到3，增加销量（1）
			//如果是3到1,2，减少销量（-1）
			if((dbData.o_state != fData.o_state) 
				&& 
				!((dbData.o_state == 1 || dbData.o_state == 2) 
					&& 
					(fData.o_state == 1 || fData.o_state == 2))){
				if((dbData.o_state != 0 && fData.o_state == 0) || (dbData.o_state == 3 && fData.o_state != 0)){
					setI = 1
				} else if(dbData.o_state == 0 && fData.o_state != 0 || (dbData.o_state != 0 && fData.o_state == 3)){
					setI = -1
				}
			}
			dbData.o_num = dbData.o_num ? dbData.o_num : fData.o_num
			setI !== 0 && setCom(fData, dbData, setI)
			addNews(newObj(post))
			delete dbData.id
			return coll._upOne({_id}, dbData)
		})
	}
	static async info(ctx){
		await granary.aid( async get => {
			let projection = {projection: {u_account: 1}}

			let oData = await coll._findOne({_id: get.id})
			//卖家
			let sData = await coll._findOne('user', {_id: oData.s_id}, projection)
			//买家
			let bData = await coll._findOne('user', {_id: oData.b_id}, projection)
			oData.s_name = sData.u_account
			oData.b_name = bData.u_account
			return oData

		})
	}
	static async del(ctx){
		await granary.aid( async get => coll.del(get))
	}
	//软删除
	static async softDel(ctx){
		await granary.aid( async get => coll._upOne({_id: get.id}, {$push: {o_del: get.u_id}}))
	}
}
export default Order