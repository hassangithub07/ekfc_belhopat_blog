const { Router } = require("express")
const router = Router()

const { verifyToken } = require("../../middlewares/verifyToken")
const validate = require("../../middlewares/validate")
const { commentBlogValidation } = require("../../validations")
const { commentBlogController } = require('../../controllers')

router.use(verifyToken());

router.get('/list_comments/:blog_id', validate(commentBlogValidation.fetchComments), commentBlogController.fetchComments);

module.exports = router