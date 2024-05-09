// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    let totalLikes = 0

    blogs.forEach(blog => {
        totalLikes += blog.likes
    })
    return totalLikes
}

const favouriteBlog = (blogs) => {
    let maxLikes = 0
    let favouriteBlog = null

    blogs.forEach(blog => {
        if (blog.likes > maxLikes) {
            maxLikes = blog.likes
            favouriteBlog = blog
        }
    })
    return favouriteBlog
}


module.exports = {
    dummy,
    totalLikes,
    favouriteBlog
}