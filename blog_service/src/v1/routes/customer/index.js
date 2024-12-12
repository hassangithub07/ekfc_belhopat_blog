const express = require('express');
const router = express.Router()

const commentBlogRouter = require("./comment_blog.route")
const likeBlogRoute = require("./like_blog.route")
const blogRoute = require("./blog.route")

const defaultRoutes = [
    { path: '/comment_blog', route: commentBlogRouter },
    { path: "/like_blog", route: likeBlogRoute },
    { path: "/blog", route: blogRoute },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});


module.exports = router;