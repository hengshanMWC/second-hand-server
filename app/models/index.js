import config from './config.js'
import Db from '../plugins/db.js'
export default Db.getInstance({
	config,
	page: [
		['pageSize', 10],
		['pageIndex', 1],
	]
})
