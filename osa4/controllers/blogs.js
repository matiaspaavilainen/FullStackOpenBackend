const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const userExtractor = require('../utils/middleware').userExtractor

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1 })
    response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
    const body = request.body
    const user = request.user

    if (!user) {
        return response.status(401).json({ error: 'invalid token' })
    }

    const blog = new Blog(body)

    blog.user = user
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body
    const blog = {
        title: body.title,
        author: body.title,
        url: body.url,
        likes: body.likes,
    }

    const result = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(result).end()
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
    const user = request.user
    const blog = await Blog.findById(request.params.id)
    console.log(blog)

    if (!blog) {
        return response.status(204).end()
    }

    console.log(blog.user)

    if (blog.user.toString() !== user.id.toString()) {
        return response.status(401).json({ error: 'unauthorized' })
    }

    user.blogs = user.blogs.filter(b => b._id.toString() !== blog._id.toString())

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

module.exports = blogsRouter