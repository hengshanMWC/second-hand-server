import { formatTime } from '../utils/common'
import MongoDB from 'mongodb'
const ObjectID = MongoDB.ObjectID;
class Coll {
	constructor(collection,db){
		this.collection = collection;
		this.db = db;
		Object.assign(this, db)
	}
	_find(collectionName, json, project){
		let {name, data, data2: pro = {}} = this.reqData(collectionName, json, project)
		this.automaticId(data)
		let projectData = this.projectData(pro)
		let arr = this.getPage(data)
		// console.log(projectData)
		return new Promise((resolve,reject)=>{
			this.db.connect()
				.then(db => {
					db.collection(name).find(data).count( (err, count) => {
						if(err){
							reject(err)
							return;
						}
						let result = db.collection(name).find(data)
						.project(projectData.$projection)
						.limit(arr[0])
						.skip(arr[1])
						.sort({_id: -1})
						result.toArray((err,docs) => {
							err ? reject(err) : resolve({list: docs,count})
						})
					})
				})
		})
	}
	_findSort(collectionName, json, project){
		let {name, data, data2: pro = {}} = this.reqData(collectionName, json, project)
		this.automaticId(data)
		let projectData = this.projectData(pro)
		let arr = this.getPage(data)
		// console.log(projectData)
		return new Promise((resolve,reject)=>{
			this.db.connect()
				.then(db => {
					db.collection(name).find(data).count( (err, count) => {
						if(err){
							reject(err)
							return;
						}
						let result = db.collection(name).find(data)
						.project(projectData.$projection)
						.limit(arr[0])
						.skip(arr[1])
						.sort({_id: 1})
						result.toArray((err,docs) => {
							err ? reject(err) : resolve({list: docs,count})
						})
					})
				})
		})
	}
	_findOne(collectionName, json, project){
		let {name, data, data2: projectData = {projection: {}}} = this.reqData(collectionName, json, project)
		this.automaticId(data)
		// this.time0(projectData)
		return new Promise((resolve, reject) => {
			this.db.connect()
				.then( db => {
					 db.collection(name).findOne(data, projectData, (err,docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	_upOne(collectionName, json, setJson){
		let {name, data, data2: setData = {}} = this.reqData(collectionName, json, setJson)
		this.automaticId(data)
		setData = this.setUpData(setData)
		// this.automaticId(setData)
		this.date(setData, this.upDate)
		return new Promise((resolve, reject) => {
			this.db.connect()
				.then( db => {
					db.collection(name).updateOne(data, setData, (err,docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	_updateMany(collectionName, json, setJson){
		let {name, data, data2: setData = {}} = this.reqData(collectionName, json, setJson)
		this.automaticId(data)
		setData = this.setUpData(setData)
		// this.automaticId(setData)
		this.date(setData, this.upDate)
		return new Promise((resolve, reject) => {
			this.db.connect()
				.then( db => {
					db.collection(name).updateMany(data, setData, (err,docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	_addOne(collectionName, json){
		let {name, data} = this.reqData(collectionName, json)
		this.automaticId(data)
		this.date(data)
		return new Promise(( resolve, reject ) => {
			this.db.connect()
				.then( db => {
					db.collection(name).insertOne(data, (err, docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	_delOne(collectionName, json){
		let {name, data} = this.reqData(collectionName, json)
		this.automaticId(data)
		return new Promise(( resolve, reject ) => {
			this.db.connect()
				.then( db => {
					db.collection(name).removeOne(data, (err, docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	_del(collectionName, json){
		let {name, data} = this.reqData(collectionName, json)
		this.automaticId(data)
		return new Promise(( resolve, reject ) => {
			this.db.connect()
				.then( db => {
					db.collection(name).remove(data, (err, docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	//软查询
	async softFind(get, key ,query = {
			_id: get.u_id
		}){
		console.log(query)
		const uData = await this._findOne('user', query , {
			projection: {
				[key]: 1,
			}
		})
		return {
			$nin: uData[key]
		}
	}
	//软删除
	async softDel(get, key){
		return this._upOne('user', {
			_id: get.u_id
		}, {
			$addToSet: {
				[key]:  this.getObjectId(get.id)
			}
		})
	}
	aggregate(collectionName, json){
		let {name, data} = this.reqData(collectionName, json)
		this.automaticId(json)
		return new Promise(( resolve, reject ) => {
			this.db.connect()
				.then( db => {
					db.collection(name).remove(data, (err, docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	async del(get){ 
		let data;
		let arrId = get.id;
		if(arrId.indexOf(',') !== -1) {
			data =  {
				"$in": arrId.split(',').map(val => this.getObjectId(val))
			}
			return await this._del({_id: data})
		} else {
			data = arrId
			return await this._delOne({_id: data})
		}
	}
	date(data, dates = [this.createDate, this.upDate]){
		let timea = formatTime()
		if(typeof dates === 'object'){
			dates.forEach( val => data[val] = timea) 
		} else {
			if(!data.$set) data.$set = {}
			data.$set[dates] = timea;
		}
	}
	reqData(collectionName, json, json2){
		let name = collectionName 
		let data = json
		let data2 = json2
		if(typeof collectionName !== 'string') {
			name = this.collection;
			data = collectionName
			data2 = json
		}
		return {name,data,data2}
	}
	//正则查询，删除为空之类的
	//arr不匹配范围
	vague(data, ...arr){
		//判断是否是正则字符串
		let r = new RegExp(/^\/[^\/]+\/$/)
		arr.push(this.page[0][0],this.page[1][0])
		Object.keys(data).forEach( val => {
			let dataVal = data[val]
			if(dataVal === '' || dataVal === undefined || dataVal === null) {
				delete data[val]
			} else if(val.indexOf('id') == -1){
				if(typeof dataVal !== 'object' && !r.test(dataVal) && arr.indexOf(val) === -1){
					data[val] =  eval('/'+ dataVal +'/');
				}
			}
			
		})
	}
	time0(data){
		let b = Object.keys(data.projection).some(val => data.projection[val] === 1)
		if(b) return
		if(this.createDate) {
			if(data.projection[this.createDate] == 1) {
				delete data.projection[this.createDate]
				if(data.projection ){

				}
			} else {
				data.projection[this.createDate] = 0
			}
				
		}
		if(this.upDate) data.projection[this.upDate] = 0	
	}
	/**
	*分页配置
	**/
	getPage(data){
		let arr = [5,1]
		this.page.forEach((val, i) => {
			if(data[val[0]]){
				//limit requires an integer
				let num = parseInt(data[val[0]]);
				arr[i] = num ? num : val[1]
				delete data[val[0]]
			}
		})
		arr[1] = arr[0] * (arr[1] - 1)
		return arr
	}
	setUpData(data){
		return Object.keys(data).join().indexOf('$') === -1 ? {$set: data} : data
	}
	/**
	*自动将带有id的字段转new ObjectID
	*data(object)
	**/
	automaticId(data){
		Object.keys(data).forEach( val => {
			let is$ = val.indexOf('$');
			if(val.indexOf('id') !== -1 && is$ === -1) data[val] = this.getObjectId(data[val]);
			if(is$ !== -1) this.automaticId(data[val])
		})
	}
	//联表查询合并
	async joint(parameter){
		let { data, fuseData } = await this.linked(parameter)
		this.relation({
			data: data.list, 
			key: fuseData.giveMateKey
		}, 
		{
			data: fuseData.fitData.list, 
			key: fuseData.id
		}, 
		fuseData.apiKey, 
		fuseData.fitAppointKey) 
	}
	//列表查询
	async linked(parameter){
		let setData = { 
			id: 'u_id',//getObjectId的key
			collection: 'user', //表名
			screen: {},//列表筛选
			par: {},//字段筛选之类
			fitData: {},//获得数据的对象
			giveMateKey: '_id',//给予数据的对比key 
			apiKey: '',//fitData的key用来获取数据
			fitAppointKey: '',//指定获取的key
		}
		let fuseData = this.delFuse(parameter, setData)
		let setId = new Set()
		fuseData.fitData.list.forEach( arr => setId.add(arr[fuseData.id]))
		let screen = {
			[fuseData.giveMateKey]: {
				"$in": Array.from(setId)
			},
			
		}
		Object.assign(screen,fuseData.screen)
		let data = await this._find(fuseData.collection, screen, {$projection:fuseData.par})
		return {data, fuseData}
	}
	/**
	*列表查询数据合并
	*forData：data循环的数据，key对比
	*findData:data二度循环和合并的数据，key:对比的值
	*key：findData的data指定的字段获得数据，
	*keyb:findData的data指定的key获得指定的，forData的data，
	*/
	relation(forData, findData, key, keyv){
		// if(key === 'u_name'){
		// 	console.log(findData)
		// }
		forData.data.forEach( obj => findData.data.forEach( obj2 => {
				// if(key === 'u_name'){
				// 	console.log(obj[forData.key],obj2[findData.key])
				// }
				if(obj[forData.key] && obj2[findData.key] && (obj[forData.key].toString() == obj2[findData.key].toString())) {
					if(keyv){
						obj2[key] = obj[keyv]
					} else if(key){
						obj2[key] = obj
					} else if(!key){
						delete obj._id
						Object.assign(obj2, obj)
					}
					// obj2[key] = keyv ? obj[keyv] : obj
				}
			})
		)

	}

	
	isY(val){
		return val !== '' && val !== undefined && val !== null
	}
	//upInfo的时候指定和添加
	delFuse(post, data){
		let dbData = new Object()
		for(let val in data) {
			let v = data[val] 
			if(post[val] !== undefined){
				dbData[val] = post[val]
			} else if(this.isY(v)){
				dbData[val] = v
			}
		}
		return dbData;
	}
	projectData(data){
		let arr = Object.keys(data)
		if(!arr.len || arr.join(' ').indexOf('$') != 1) {
			return data
		} else {
			return {
				$projection: data
			}
		}

	}
	//默认当前登录人的_id
	// islogin(post, ctx, key = 'u_id'){
	// 	let id = post[key]
	// 	try {
	// 		post[key] = id ? id : ctx.session.userInfo._id
	// 	} catch(e) {
	// 		return { state: false, mes: `如果不存在当前登录人，请传${key}`}
	// 	}
	// }
	//
	getObjectId(id){ 
		try {
        	return new ObjectID(id);
		} catch(e) {
			return id;
		}
    }
    typeConversion(data, arr, type){
    	arr.forEach( val => {
    		let dataVal = data[val]
    		if(dataVal !== undefined) data[val] = dataVal === '' ? dataVal : eval(type)(dataVal)
    	})
    }
    //将非''字符串转为数字
    number(data ,...arr){
    	this.typeConversion(data, arr, 'Number')
    }
    //将非''字符串转为布尔
    boolean(data ,...arr){
    	//Boolean会把字符串false转为true
    	this.typeConversion(data, arr, 'JSON.parse')
    }
}
export default Coll