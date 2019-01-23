// routes/home.js
module.exports = {
  async index (ctx, next) {
    await ctx.render('index', {
      title: 'zzy-blog',
      desc: 'zzy的blog'
    })
  }
}