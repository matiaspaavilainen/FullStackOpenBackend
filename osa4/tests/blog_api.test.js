const { test, after, describe, beforeEach } = require('node:test')
const assert = require('assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

describe('HTTP GET tests', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.blogs)
    })

    test('6 blogs in DB', async () => {
        const result = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert.strictEqual(result.body.length, 6)
    })

    test('id not _id', async () => {
        const result = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        assert.strictEqual(result.body[0]._id, undefined)
        assert.ok(result.body[0].id)
    })
})

describe('HTTP POST tests', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.blogs)
    })

    test('POST correctly adds a new post', async () => {
        const newBlog = {
            title: 'Test Post',
            author: 'Robert C. Martin',
            url: 'test.com/test',
            likes: 7,
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const result = await api.get('/api/blogs')
        const titles = result.body.map(res => res.title)

        assert.strictEqual(titles.length, helper.blogs.length + 1)
        assert(titles.includes('Test Post'))
    })

    test('Missing likes => defaults to 0', async () => {
        const newBlog = {
            title: 'Test Post',
            author: 'Teddy T. Tester',
            url: 'test.com/test',
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const result = await api.get('/api/blogs')
        const likes = result.body.map(res => res.likes)

        assert.strictEqual(likes.at(-1), 0)
    })

    test('Missing title => 400', async () => {
        const newBlog = {
            author: 'Teddy T. Tester',
            url: 'test.com/test',
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)
    })

    test('Missing URL => 400', async () => {
        const newBlog = {
            title: 'Test Post',
            author: 'Teddy T. Tester',
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)
    })
})

describe('HTTP DELETE tests', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.blogs)
    })

    test('Delete works', async () => {
        const blogToDelete = await helper.blogsInDB()
        await api
            .delete(`/api/blogs/${blogToDelete[0].id}`)
            .expect(204)

        const result = await api.get('/api/blogs')
        const titles = result.body.map(res => res.title)

        assert.strictEqual(titles.length, helper.blogs.length - 1)
        assert(!titles.includes(blogToDelete[0].titles))
    })
})

describe('HTTP PUT tests', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.blogs)
    })

    test('Updating blog works', async () => {
        const blogToUpdate = await helper.blogsInDB()
        const updatedBlog = {
            title: 'React patterns',
            author: 'Michael Chan',
            url: 'https://reactpatterns.com/',
            likes: 9,
        }

        await api
            .put(`/api/blogs/${blogToUpdate[0].id}`)
            .send(updatedBlog)

        const result = await api.get('/api/blogs')
        assert.strictEqual(result.body[0].likes, 9)
    })
})

describe('User tests', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'admin', passwordHash: passwordHash })

        await user.save()
    })

    test('Creation success with new username', async () => {
        const usersAtStart = await helper.usersInDB()

        const newUser = {
            username: 'tester',
            name: 'Tester',
            password: 'password'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAfter = await helper.usersInDB()
        assert.strictEqual(usersAfter.length, usersAtStart.length + 1)

        const usernames = usersAfter.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test('creation fails => 400 and error message', async () => {
        const usersAtStart = await helper.usersInDB()

        const newUser = {
            username: 'admin',
            name: 'admin',
            password: 'pasword',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDB()
        assert(result.body.error.includes('expected `username` to be unique'))

        assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('password too short => 400', async () => {
        const usersAtStart = await helper.usersInDB()
        const newUser = {
            username: 'long',
            name: 'test',
            password: 'sh'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAfter = await helper.usersInDB()
        assert(result.body.error.includes('Password must be 3 long'))

        assert.strictEqual(usersAfter.length, usersAtStart.length)
    })

    test('username too short => 400', async () => {
        const usersAtStart = await helper.usersInDB()
        const newUser = {
            username: 'sh',
            name: 'test',
            password: 'long'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAfter = await helper.usersInDB()
        assert(result.body.error.includes('is shorter than the minimum allowed length (3)'))

        assert.strictEqual(usersAfter.length, usersAtStart.length)
    })

    test('no password => 400', async () => {
        const usersAtStart = await helper.usersInDB()
        const newUser = {
            username: 'long',
            name: 'test',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAfter = await helper.usersInDB()
        assert(result.body.error.includes('Password is required'))

        assert.strictEqual(usersAfter.length, usersAtStart.length)
    })

    test('no username => 400', async () => {
        const usersAtStart = await helper.usersInDB()
        const newUser = {
            name: 'test',
            password: 'long'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAfter = await helper.usersInDB()
        assert(result.body.error.includes('Path `username` is required'))

        assert.strictEqual(usersAfter.length, usersAtStart.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})