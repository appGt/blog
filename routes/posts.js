const PostModel = require('../models/post')
const CommentModel = require('../models/comment')
const CategoryModel = require('../models/category')

module.exports = {
  //首页
  async index(ctx, next) {
    const cname = ctx.query.c
    let cid
    if (cname) {
      //查询分类id
      const category = await CategoryModel.findOne({ name: cname })
      cid = category._id
    }
    // 根据是否有分类来控制查询语句
    const query = cid ? { category: cid } : {}
    const pageSize = 5
    const currentPage = parseInt(ctx.query.page) || 1
    const allPostsCount = await PostModel.find(query).count()
    const pageCount = Math.ceil(allPostsCount / pageSize)
    const posts = await PostModel.find(query).skip((currentPage - 1) * pageSize).limit(pageSize)

    const pageStart = currentPage -2 > 0 ? currentPage -2 : 1
    const pageEnd = pageStart + 4 >= pageCount ? pageCount : pageStart +4
    // 根据是否有分类来控制分页链接
    const baseUrl = cname ? `${ctx.path}?c=${cname}&page=` : `${ctx.path}?page=`
    await ctx.render('index', {
      title: 'JS之禅',
      desc: '2222222',
      posts,
      currentPage,
      pageCount,
      pageStart,
      pageEnd,
      baseUrl
    })
  },

  //新建文章
  async create(ctx, next) {
    if (ctx.method === 'GET') {
      const categories = await CategoryModel.find({})
      await ctx.render('create', {
        title: '新建文章',
        categories
      })
      return
    }
    const post = Object.assign(ctx.request.body, {
      author: ctx.session.user._id
    })
    const res = await PostModel.create(post)
    ctx.flash = { success: '发表文章成功' }
    ctx.redirect(`/posts/${res._id}`)
  },

  //展示文章
  async show(ctx, next) {
    const post = await PostModel.findById(ctx.params.id)
      .populate([
        { path: 'author', select: 'name' },
        { path: 'category', select: ['title', 'name'] }
      ])
    const comments = await CommentModel.find({ postId: ctx.params.id })
      .populate(
        { path: 'from', select: 'name' }
      )
    await ctx.render('post', {
      title: post.title,
      post,
      comments
    })
  },

  //编辑文章
  async edit(ctx, next) {
    if (ctx.method === 'GET') {
      const post = await PostModel.findById(ctx.params.id)
      if (!post) {
        throw new Error('文章不存在')
      }
      if (post.author.toString() !== ctx.session.user._id.toString()) {
        throw new Error('没有权限')
      }
      const categories = await CategoryModel.find({})
      await ctx.render('edit', {
        title: '更新文章',
        post,
        categories
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

  //删除文章
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