require("babel-register")
({
    'presets': ["es2015"],
})
    
// 引入 koa 的主文件
require('./server.js')