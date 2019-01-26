import { suffix, formatTimea } from './common.js'
import mkdirs from './node/mkdirs.js'
import fs from 'fs'
import path from 'path'
function upFile(files, storagePath){
	return new Promise((resolve, reject) => {
		const file = files.file
		const reader = fs.createReadStream(file.path)
		let date = new Date()
		let fileName = date.getTime() + suffix(file.name);//文件名
		let tiemPath = '/' + formatTimea(date, [0,3], '') + '/'//时间路径
		let gPath = storagePath + tiemPath//总路径
		let filePath = path.join(__dirname,gPath)//真实路径
		mkdirs(filePath,function(){
			const upStream = fs.createWriteStream(filePath + fileName);
			reader.pipe(upStream);
			resolve(tiemPath + fileName)
		})
	})
	
}

export default upFile
