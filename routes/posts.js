const PostModel = require('../models/post')

module.exports = {
  async index(ctx, next) {
    const posts = await PostModel.find({})
    await ctx.render('index', {
      title: 'JS之禅',
      desc: '2222222',
      posts
    })
  },

  async create(ctx, next) {
    if (ctx.method === 'GET') {
      await ctx.render('create', {
        title: '新建文章'
      })
      return
    }
    const post = Object.assign(ctx.request.body, {
      author: ctx.session.user_id
    })
    const res = await PostModel.create(post)
    ctx.flash = { success: '发表文章成功' }
    ctx.redirect(`/posts/${res._id}`)
  },

  async show(ctx, next) {
    const post = await PostModel.findById(ctx.params.id).populate({ path: 'author', select: 'name' })
    await ctx.render('post', {
      title: post.title,
      post,
      comments
    })
  },

  async edit(ctx, next) {
    if (ctx.method === 'GET') {
      const post = await PostModel.findById(ctx.params.id)
      if (!post) {
        throw new Error('文章不存在')
      }
      if (post.author.toString() !== ctx.session.user._id.toString()) {
        throw new Error('没有权限')
      }
      await ctx.render('edit', {
        title: '更新文章',
        post
      })
      return
    }
    const { title, content } = ctx.request.body
    await PostModel.findByIdAndUpdate(ctx.params.id, {
      title, content
    })
    ctx.flash = { success: '更新文章成功' }
    ctx.redirect(`/posts/${ctx.params.id}`)
  },

  async destroy(ctx, next) {
    const post = await PostModel.findById(ctx.params.id)
    if (!post) {
      throw new Error('文章不存在')
    }
    if (post.author.toString() !== ctx.session.user._id.toString()) {
      throw new Error('没有权限')
    }
    await PostModel.findByIdAndRemove(ctx.params.id)
    ctx.flash = { success: '删除文章成功' }
    ctx.redirect('/')
  }
}