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
		let {name, data, data2: projectData} = this.reqData(collectionName, json, project)
		this.automaticId(data)
		let arr = this.getPage(data)
		return new Promise((resolve,reject)=>{
			this.db.connect()
				.then(db => {
					db.collection(name).find(data).count( (err, count) => {
						if(err){
							reject(err)
							return;
						}
						let result = db.collection(name).find(data)
						.project(projectData)
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
	_findOne(collectionName, json, project){
		let {name, data, data2: projectData = {projection: {}}} = this.reqData(collectionName, json, project)
		this.automaticId(data)
		this.time0(projectData)
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
		this.automaticId(setData)
		this.date(setData, this.upDate)
		return new Promise((resolve, reject) => {
			this.db.connect()
				.then( db => {
					db.collection(name).updateOne(data, { $set: setData}, (err,docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	_updateMany(collectionName, json, setJson){
		let {name, data, data2: setData = {}} = this.reqData(collectionName, json, setJson)
		this.automaticId(data)
		this.automaticId(setData)
		this.date(setData, this.upDate)
		return new Promise((resolve, reject) => {
			this.db.connect()
				.then( db => {
					db.collection(name).updateMany(data, { $set: setData}, (err,docs) => err ? reject(err) : resolve(docs))
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
		if(arrId instanceof Array) {

		} else {
			data = await this._delOne({"_id": arrId})
		}
		// let arr =  ? get : [get]
		// let arrId = arr.map( val => ({"_id": val.id}))
		// console.log(arrId)
		// let data = await db._del(arrId)
		return data;
	}
	date(data, dates = [this.createDate, this.upDate]){
		let timea = formatTime()
		typeof dates === 'object' 
		? dates.forEach( val => data[val] = timea) 
		: data[dates] = timea;
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
		if(data.projection[this.createDate] == 1){
			console.log(delete data.projection[this.createDate])
		} else {
			data.projection[this.createDate] = 0
		}
		if(data.projection[this.upDate] == 1){
			delete data.projection[this.upDate]
		} else {
			data.projection[this.upDate] = 0
		}
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
	/**
	*自动将带有id的字段转new ObjectID
	*data(object)
	**/
	automaticId(data){
		Object.keys(data).forEach( val => {
			if(val.indexOf('id') !== -1) data[val] = this.getObjectId(data[val]);
		})
	}
	//列表查询数据合并
	relation(forData, findData, key, keyv){
		forData.data.forEach( obj => findData.data.forEach( obj2 => {
				if(obj[forData.key].toString() == obj2[findData.key].toString()) obj2[key] = keyv ? obj[keyv] : obj
			})
		)
	}
	//upInfo的时候指定和添加
	delFuse(post, data){
		let dbData = new Object()
		for(let val in data) {
			let v = data[val] 
			if(v === '' && post[val]){
				dbData[val] = post[val]
			} else if(v !== ''){
				dbData[val] = v
			}
		}
		return dbData;
	}
	//默认当前登录人的_id
	islogin(post, userInfo, key = 'u_id'){
		let id = post[key]
		try {
			post[key] = id ? id : userInfo._id
		} catch(e) {
			return { state: false, mes: '如果不存在当前登录人，请传u_id'}
		}
	}
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