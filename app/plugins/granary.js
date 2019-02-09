class Granary {
	constructor(){}
	async aid(fn){
		let {context: ctx,reqData} = this
		let res = {
			data: null,
			mes: '',
			state: true,
		}
		let data = await fn(reqData, ctx.request.files);
		if(data === null) data = {data:null}
		if(typeof data === 'object' && data.data === undefined && data.mes === undefined && data.state === undefined) data = {data}
		Object.assign(res, data)
		ctx.body = res
	}
	judge(map) {
	    return Object.keys(map).find(val => map[val])
	}
	sort(data, str = 'weight'){
		if(data.count) data.list.sort( (iMax,iMin) => iMin[str] - iMax[str])
	}
	set ctx(ctx) {
		this.context = ctx;
		this.reqData = ctx.method === 'GET' ? ctx.query : ctx.request.body
	}
}
export default new Granary();