const Koa = require('koa')
const router = require('./routes')
const views = require('koa-views')
const session = require('koa-session')
const path = require('path')
const serve = require('koa-static')
const bodyParser = require('koa-bodyparser')
const flash = require('./middlewares/flash')
const error = require('./middlewares/error-handler')
const marked = require('marked')
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breals: false,
  pedantic: false,
  sanitize: true, //XSS过滤
  smartLists: true,
  smartypants: false
})

const mongoose = require('mongoose')
const CONFIG = require('./config/config')
mongoose.connect(CONFIG.mongodb)

const app = new Koa()

app.use(error())

//使用模板
app.use(views(path.join(__dirname, 'views'), {
  map: {html: 'nunjucks'}
}))

//代理静态资源
app.use(serve(path.join(__dirname, 'public')))
//解析post请求参数
app.use(bodyParser())
app.keys = ['zzy_blog']
app.use(session({
  ket: CONFIG.session.key,
  maxAge: 1800000
}, app))
//消息提示中间件
app.use(flash())

app.use(async (ctx, next) => {
  ctx.state.ctx = ctx
  ctx.state.marked = marked
  await next()
})

router(app)

app.listen(3000, () => {
  console.log('server is running at http://localhost:3000')
})