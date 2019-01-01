import config from './config.js'
import Db from '../plugins/db.js'
export default Db.getInstance({
	config,
	page: [
		['pageSize', 3],
		['pageIndex', 0],
	]
})
