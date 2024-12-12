const { Router } = require("express")
const router = Router()

const { verifyToken } = require("../../middlewares/verifyToken")
const validate = require("../../middlewares/validate")
const { blogValidation } = require("../../validations")
const { blogController } = require('../../controllers')

router.use(verifyToken());
router.post('/list_blogs_admin', validate(blogValidation.fetchBlogs), blogController.fetchBlogs);
router.get('/blog_by_id/:blog_id', validate(blogValidation.blogById), blogController.blogById);

module.exports = router