import request from 'request'
function abReq(option){
	return new Promise( (resolve, reject) => {
		request(option, (err, httpResponse, body) => {
			if(err) {
				reject(err)
			} else {
				try {
					resolve(JSON.parse(body))
				} catch(e) {
					resolve(body)
				}
			}
		})
	})
}
export default abReq