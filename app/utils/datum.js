async function datum(ctx, fn, method){
	let data;
	let res = {
		data: null,
		message: '',
		state: true,
	}
	switch(method)
	{
		case 'post':
		data = ctx.request.body;
		break;
		case 'get':
		data = ctx.query;
		break;
	}
	Object.assign(res, await fn(data))
	ctx.body = res
}
export default datum;