import Koa from 'koa'
import body from 'koa-body'
import koaStatic from 'koa-static'
import session from 'koa-session'
import cors from 'koa-cors'
import compress from 'koa-compress'
import cacheControl from 'koa-cache-control'
import onerror from 'koa-onerror'
import logger from 'koa-logger'
import helmet from 'koa-helmet'
// import sslify from 'koa-sslify'
import granary from './app/plugins/granary'

// 导入 rouer.js 文件
import router from './app/router'

const app = new Koa()
// 在使用 koa-session 之前，必须需要指定一个私钥
// 用于加密存储在 session 中的数据
app.keys = ['some secret hurr']

// 将捕获的错误消息生成友好的错误页面（仅限开发环境）
onerror(app)

app
  // .use(sslify())
  // 在命令行打印日志
  .use(logger())
  // 缓存控制
  // .use(cacheControl({ maxAge: 60000 }))
  // 开启 gzip 压缩
  .use(compress())
  // 跨域（允许在 http 请求头中携带 cookies）
  .use(cors({ credentials: true }))
  // 安全
  .use(helmet())
  // 静态资源服务器
  .use(koaStatic(__dirname + '/app/public'))
  // session
  .use(session(app))
  // 解析 sequest body
  // 开启了多文件上传，并设置了文件大小限制
  .use(body({
    multipart: true,
    formidable: {
      maxFileSize: 200 * 1024 * 1024
    }
  }))
  .use(async (ctx,next) => {
    granary.ctx = ctx
    // granary.context.body = 1;
    await next();
  })
  // 载入路由
  .use(router.routes(), router.allowedMethods())

  // 启动一个 http 服务器，并监听 3000 端口
  .listen(81)

// 导出 koa 实例（用于测试）
export default app