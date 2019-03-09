class Granary {
	constructor(){}
	async aid(fn){
		let {context: ctx,reqData} = this
		let res = {
			data: null,
			mes: '',
			state: true,
		}
		let data = await fn(reqData,ctx.request.files);
		if(data === null || data === undefined) data = {data}
		if(typeof data === 'object' && data.data === undefined && data.mes === undefined && data.state === undefined) data = {data}
		Object.assign(res, data)
		ctx.body = res
	}
	judge(map) {
	    return Object.keys(map).find(val => map[val])
	}
	//权重排序
	sort(data, str = 'weight'){
		if(data.count) data.list.sort( (iMax,iMin) => iMin[str] - iMax[str])
	}
	//默认当前登录人的_id
	islogin(reqData = this.reqData, key = 'u_id'){
		let id = reqData[key]
		try {
			reqData[key] = id ? id : this.context.session.userInfo._id
		} catch(e) {
			return { state: false, mes: `如果不存在当前登录人，请传${key}`}
		}
	}
	set ctx(ctx) {
		this.context = ctx;
		this.reqData = ctx.method === 'GET' ? ctx.query : ctx.request.body
	}
}
export default new Granary();