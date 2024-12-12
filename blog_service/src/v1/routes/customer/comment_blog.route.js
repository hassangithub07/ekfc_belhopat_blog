const { Router } = require("express")
const router = Router()

const { verifyToken } = require("../../middlewares/verifyToken")
const validate = require("../../middlewares/validate")
const { commentBlogValidation } = require("../../validations")
const { commentBlogController } = require('../../controllers')

router.use(verifyToken());

router.get('/list_comments/:blog_id', validate(commentBlogValidation.fetchComments), commentBlogController.fetchComments);
router
    .route('/:blog_id')
    .put(validate(commentBlogValidation.commentBlog), commentBlogController.commentBlog)
router
    .route('/edit/:blog_id/:comment_id')
    .put(validate(commentBlogValidation.editCommentBlog), commentBlogController.editCommentBlog)
    .delete(validate(commentBlogValidation.editCommentBlog), commentBlogController.deleteCommentBlog)
router
    .route('/like_comments/:comment_id/:like')
    .put(validate(commentBlogValidation.likeCommentBlog), commentBlogController.likeCommentBlog)

router.get('/list_likes/:comment_id', validate(commentBlogValidation.listLikes), commentBlogController.fetchLikes);


module.exports = router