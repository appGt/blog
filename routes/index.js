const router = require('koa-router')()

async function isLoginUser(ctx, next) {
  if (!ctx.session.user) {
    ctx.flash = { warning: '未登录, 请先登录' }
    return ctx.redirect('/signin')
  }
  await next()
}

module.exports = (app) => {
  router.get('/about', require('./about').index)
  //登录注册
  router.get('/signup', require('./user').signup)
  router.post('/signup', require('./user').signup)
  router.get('/signin', require('./user').signin)
  router.post('/signin', require('./user').signin)
  router.post('/signout', isLoginUser, require('./user').signout)
  //文章增加删除
  router.get('/', require('./posts').index)
  router.get('/posts', require('./posts').index)
  router.get('/posts/new', require('./posts').create)
  router.post('/posts/new', require('./posts').create)
  router.get('/posts/:id', require('./posts').show)
  router.get('/posts/:id/edit', require('./posts').edit)
  router.post('/posts/:id/edit', require('./posts').edit)
  router.get('/posts/:id/delete', require('./posts').destroy)


  app
    .use(router.routes())
    .use(router.allowedMethods())
}
