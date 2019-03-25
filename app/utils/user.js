import md5 from 'md5'
export default {
	//用户数据，管理员
	add(post, power){
		post.u_password = md5(post.u_password) 
		const bDef = ['u_static']
		const def = {
			u_avatar: '/upFile/img/defalut/avatar.jpg',
		}
		Object.assign(post, {
			power,//管理员,布尔值
			u_apply: {u_static: 0},//审核状态，判断是否审核中，
			u_news: 0,//新闻
			l_reliable: 0,//靠谱度
			l_fine:0,//性价比
			l_num:0,//评价人数
		})
		bDef.forEach( val => post[val] = post[val] === true ? true : false)
		Object.keys(def).forEach( val => post[val] = post[val] ? post[val] : def[val])
	},
	find(get, power, coll) {
		let aB = ['u_static']
		let aN = ['u_sex']
		coll.boolean(get, ...aB)
		coll.number(get, ...aN)
		coll.vague(get, ...aB,...aN)
		get.power = power
		return {$projection:{
			u_password: 0, 
			u_age: 0, 
			u_qq: 0, 
			u_mail: 0,
			u_avatar: 0,
			u_apply: 0,
			l_fine: 0,
			l_num: 0,
			l_reliable: 0,
		}}
	}
}