const router = require('koa-router')()

async function isLoginUser(ctx, next) {
  if (!ctx.session.user) {
    ctx.flash = { warning: '未登录, 请先登录' }
    return ctx.redirect('/signin')
  }
  await next()
}

async function isAdmin(ctx, next) {
  if (!ctx.session.user) {
    ctx.flash = { warning: '未登录, 请先登录' }
    return ctx.redirect('/signin')
  }
  if (!ctx.session.user.isAdmin) {
    ctx.flash = { warning: '没有权限' }
    return ctx.redirect('back')
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
  router.get('/signout', isLoginUser, require('./user').signout)
  //文章增加删除
  router.get('/', require('./posts').index)
  router.get('/posts/new', isLoginUser, require('./posts').create)
  router.post('/posts/new', isLoginUser, require('./posts').create)
  router.get('/posts/:id', require('./posts').show)
  router.get('/posts/:id/edit', isLoginUser, require('./posts').edit)
  router.post('/posts/:id/edit', isLoginUser, require('./posts').edit)
  router.get('/posts/:id/delete', isLoginUser, require('./posts').destroy)

  //评论
  router.post('/comments/new', isLoginUser, require('./comments').create)
  router.get('/comments/:id/delete', isLoginUser, require('./comments').destroy)

  //分类管理
  router.get('/category', isAdmin, require('./category').create)
  router.get('/category/new', isAdmin, require('./category').create)
  router.post('/category/new', isAdmin, require('./category').create)
  router.get('/category/new', isAdmin, require('./category').destroy)



  app
    .use(router.routes())
    .use(router.allowedMethods())
}
