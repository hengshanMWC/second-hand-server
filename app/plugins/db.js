import MongoDB from 'mongodb'
const MongoClient =MongoDB.MongoClient;
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
		this.page = option.page || [];
		this.dbClient = null;
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
	finds(collectionName, json){
		let {name, data} = this.reqData(collectionName, json)
		this.automaticId(data)
		let arr = this.getPage(data)
		return new Promise((resolve,reject)=>{
			this.connect()
				.then(db => {
					db.collection(name).find(data).count( (err, count) => {
						if(err){
							reject(err)
							return;
						}
						let result = db.collection(name).find(data,{u_password:0,_id:0}).limit(arr[0]).skip(arr[1])
						result.toArray((err,docs) => {
							err ? reject(err) : resolve({data:docs,count})
						})
					})
					
				})
		})
	}
	find(collectionName, json){
		let {name, data} = this.reqData(collectionName, json)
		this.automaticId(data)
		return new Promise((resolve, reject) => {
			this.connect()
				.then( db => {
					 db.collection(name).findOne(data, (err,docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	up(collectionName, json, setJson){
		let {name, data, setData} = this.reqData(collectionName, json, setJson)
		this.automaticId(setData)
		return new Promise((resolve, reject) => {
			this.connect()
				.then( db => {
					 db.collection(name).updataOne(data, { $set: setData}, (err,docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	add(collectionName, json){
		let {name, data} = this.reqData(collectionName, json)
		this.automaticId(data)
		return new Promise(( resolve, reject ) => {
			this.connect()
				.then( db => {
					db.collection(name).insertOne(data, (err, docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	del(collectionName, json){
		let {name, data} = this.reqData(collectionName, json)
		this.automaticId(data)
		return new Promise(( resolve, reject ) => {
			this.connect()
				.then( db => {
					db.collection(name).removeOne(data, (err, docs) => err ? reject(err) : resolve(docs))
				})
		})
	}
	reqData(collectionName, json, setJson){
		let name = collectionName 
		let data = json
		let setData = setJson
		if(typeof collectionName !== 'string') {
			name = this.collection;
			data = collectionName
			setData = json
		}
		return {name,data,setData}
	}
	getPage(data){
		let arr = [5,0]
		this.page.forEach((val, i) => {
			if(data[val[0]]){
				//limit requires an integer
				let num = parseInt(data[val[0]]);
				arr[i] = num ? num : val[1]
				delete data[val[0]]
			}
		})
		arr[1] = arr[0] * arr[1]
		return arr
	}
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
		console.log(id)
        return new ObjectID(id);
    }
}
export default Db