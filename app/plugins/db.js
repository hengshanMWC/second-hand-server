import MongoDB from 'mongodb'

import Coll from './coll.js'
const MongoClient = MongoDB.MongoClient;

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
	createCollection(str){
		return new Coll(str, this)
	}
	
}
export default Db