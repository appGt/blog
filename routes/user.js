const bcrypt = require('bcryptjs')
const UserModel = require('../models/user')

module.exports = {
  //注册
  async signup(ctx, next) {
    if (ctx.method === 'GET') {
      await ctx.render('signup', {
        title: '用户注册'
      })
      return
    }
    //生成salt
    const salt = await bcrypt.genSalt(10)
    let { name, email, password, repassword } = ctx.request.body
    let errorMsg = ''
    if (name === '') {
      errorMsg = '用户名不能为空'
    } else if (email === '') {
      errorMsg = '邮箱不能为空'
    } else if (password === '') {
      errorMsg = '密码不能为空'
    } else if (password !== repassword) {
      errorMsg = '两次密码不一致'
    }
    if (errorMsg) {
      ctx.flash = { warning: errMsg }
      ctx.redirect('back')
      return
    }
    //加密密码
    password = await bcrypt.hash(password, salt)
    const user = {
      name, email, password
    }
    //存储数据库
    try {
      const result = await UserModel.create(user)
      ctx.flash = { success: '注册成功' }
      return ctx.redirect('/signin')
    } catch (err) {
      if (err.message.match('duplicate key')) {
        ctx.flash = { warning: '用户已存在' }
      }
      return ctx.redirect('back')
    }
  },

  //登录
  async signin(ctx, next) {
    if (ctx.session.user) {
      ctx.flash = { warning: '已登录' }
      ctx.redirect('back')
      return
    }
    if (ctx.method === 'GET') {
      await ctx.render('signin', {
        title: '用户登录'
      })
      return
    }
    const { name, password } = ctx.request.body
    const user = await UserModel.findOne({ name })
    if (user && await bcrypt.compare(password, user.password)) {
      ctx.session.user = {
        _id: user._id,
        name: user.name,
        isAdmin: user.isAdmin,
        email: user.email
      }
      ctx.flash = { success: '登录成功' }
      ctx.redirect('/')
    } else {
      ctx.flash = { warning: '用户名或密码错误' }
      ctx.redirect('back')
    }
  },

  signout(ctx, next) {
    ctx.session.user = null
    ctx.flash = { warning: '退出登录' }
    ctx.redirect('/')
  }
}