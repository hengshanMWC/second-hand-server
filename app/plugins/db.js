import MongoDB from 'mongodb'
import { formatTimea } from '../utils/common'
const MongoClient = 	MongoDB.MongoClient;
const ObjectID = MongoDB.ObjectID;
class Db {
	static getInstance(option){
		if(!Db.instance){
            Db.instance = new Db(option);
        }
        return  Db.instance;
	}
	//地址，数据库
	constructor(option){
		this.dbUrl = option.config.dbUrl
		this.dbName = option.config.dbName
		//配置分页字段
		this.page = option.page || [['page',5],['limit', 1]];
		this.dbClient = null;
		//自动生成的日期
		this.createDate = option.date && option.date.createDate || 'create_date'
		this.upDate = option.date && option.date.upDate || 'up_date'
		
		//表
		this.collection;
		this.connect();
	}

	//链接
	connect(){
		return new Promise((resolve, reject) => {
			if(this.dbClient) {
				resolve(this.dbClient)
			}  else {
				MongoClient.connect(this.dbUrl, (err, client) => {
					if(err){
						reject(err);
						return
					}
					this.dbClient = client.db(this.dbName);
					resolve(this.dbClient)
				})
			}
		})
	}
	_find(collectionName, json, project){
		let {name, data, data2: projectData} = this.reqData(collectionName, json, project)
		this.automaticId(data)
		let arr = this.getPage(data)
		// this.vague(data);
		console.log(data)
		return new Promise((resolve,reject)=>{
			this.connect()
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
						.sort({"_id": -1})
						result.toArray((err,docs) => {
							err ? reject(err) : resolve({list: docs,count})
						})
					})
					
				})
		})
	}
	_findOne(collectionName, json, project){
		let {name, data, data2: projectData} = this.reqData(collectionName, json, project)
		this.automaticId(data)
		return new Promise((resolve, reject) => {
			this.connect()
				.then( db => {
					 db.collection(name).findOne(data, projectData, (err,docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	_upOne(collectionName, json, setJson){
		let {name, data, data2: setData} = this.reqData(collectionName, json, setJson)
		this.automaticId(data)
		this.date(setData, this.upDate)
		return new Promise((resolve, reject) => {
			this.connect()
				.then( db => {
					db.collection(name).updateOne(data, { $set: setData}, (err,docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	_addOne(collectionName, json){
		let {name, data} = this.reqData(collectionName, json)
		this.automaticId(data)
		this.date(data)
		return new Promise(( resolve, reject ) => {
			this.connect()
				.then( db => {
					db.collection(name).insertOne(data, (err, docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	_delOne(collectionName, json){
		let {name, data} = this.reqData(collectionName, json)
		this.automaticId(data)
		return new Promise(( resolve, reject ) => {
			this.connect()
				.then( db => {
					db.collection(name).removeOne(data, (err, docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	_del(collectionName, json){
		let {name, data} = this.reqData(collectionName, json)
		this.automaticId(data)
		return new Promise(( resolve, reject ) => {
			this.connect()
				.then( db => {
					db.collection(name).remove(data, (err, docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	date(data, dates = [this.createDate, this.upDate]){
		let timea = formatTimea()
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
	vague(data, ...arr){
		//判断是否是正则字符串
		let r = new RegExp(/^\/[^\/]+\/$/)
		Object.keys(data).forEach( val => {
			if(val.indexOf('id') == -1){
				let dataVal = data[val]
				if(dataVal === '') {
					delete data[val]
				} else if(typeof dataVal !== 'object' && !r.test(dataVal) && arr.indexOf(val) === -1){
					data[val] =  eval('/'+ dataVal +'/');
				}
			} 
		})
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
			let n = val.indexOf('id')
			if(n !== -1) data[val] = this.getObjectId(data[val]);
		})
	}
	setCollection(str){
		this.collection = str;
	}
	getObjectId(id){ 
		try {
        	return new ObjectID(id);
		} catch(e) {
			return id;
		}
    }
    number(data ,...arr){
    	arr.forEach( val => arr[val] === '' ? arr[val] : Number(arr[val]))
    }
}
export default Db