const { Router } = require("express")
const router = Router()

const { verifyToken } = require("../../middlewares/verifyToken")
const validate = require("../../middlewares/validate")
const { blogValidation } = require("../../validations")
const { blogController } = require('../../controllers')

router.use(verifyToken());
router.post('/create_blog', validate(blogValidation.createBlog), blogController.createBlog);
router.get('/list_blogs', validate(blogValidation.fetchBlogs), blogController.fetchBlogs);
router.get('/list_self_blogs', validate(blogValidation.fetchBlogs), blogController.fetchSelfBlogs);
router
    .route('/blog_by_id/:blog_id')
    .put(validate(blogValidation.blogById), blogController.updateBlogById)
    .delete(validate(blogValidation.blogById), blogController.deleteBlogById)
router.put('/report_blog/:blog_id/:report_id', validate(blogValidation.reportBlog), blogController.reportBlog);

module.exports = router