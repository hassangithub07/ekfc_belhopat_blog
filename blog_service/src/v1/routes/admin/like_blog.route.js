const { Router } = require("express")
const router = Router()

const { verifyToken } = require("../../middlewares/verifyToken")
const validate = require("../../middlewares/validate")
const { likeBlogValidation } = require("../../validations")
const { likeBlogController } = require('../../controllers')

router.use(verifyToken());

router.get('/list_likes/:blog_id', validate(likeBlogValidation.fetchLikes), likeBlogController.fetchLikes);

module.exports = router