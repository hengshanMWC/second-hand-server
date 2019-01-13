import http from 'http'
import granary from '../plugins/granary'
var reqData = {  
    host:'http://119.29.166.254',  
    port:'9090',  
    method:'GET',  
    path:'/api/',  
    headers:{  
        "Content-Type": 'application/json',  
        "Content-Length": 0
    }  
} 
class Common {
	static async provinces(ctx){
		await granary( async get => {
			let sGet = JSON.stringify(get)
			reqData.path+ = 'provinces'
			reqData.headers["Content-Length"] = sGet.length;
			http.request(reqData, res => {
				console.log(res)
			})
			.on('error', function(e){
				console.log(e)
			})
		} )
	}
}
export default Common