const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')
const { likeBlogService, blogService } = require('../services')
const pick = require('../utils/pick')
const { customerProject } = require('../constants/user.constant.js');
const ObjectId = require('mongoose').Types.ObjectId;

const likeBlog = catchAsync(async (req, res) => {
    try {
        const is_deleted = req.params.like ? false : true;
        await likeBlogService.updateModeByFilter({ blog_id: req.params.blog_id, created_by: req.user._id }, { $set: { is_deleted: is_deleted, updated_at: new Date() }}, { upsert: true });
        likeBlogService.updateBlogLikeCount(req.params.blog_id);
        res.status(httpStatus.OK).send({ message: `Blog ${req.params.like ? 'liked' : 'unliked'} successfully` })
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to create blog.', details: error.message });
    }
});

const fetchLikes = catchAsync(async (req, res) => {
    try {
        let filter = {
            blog_id: new ObjectId(req.params.blog_id),
            is_deleted: false
        }
        if (req.query.searchText) {
            filter.$text = {
                $search: '\"' + req.query.searchText + '\"'
            }
        }
        const options = pick(req.query, ['sortBy', 'limit', 'page']);
        let body = [{
            $lookup: {
                from: "users",
                localField: "created_by",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: customerProject
                    }
                ],
                as: "user_detail"
            }
        },
        {
            $set: {
                user_detail: { $arrayElemAt: ["$user_detail", 0] }
            }
        }]
        const data = await likeBlogService.fetchLikesBlog(filter, options, body);
        res.status(httpStatus.OK).send(data)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get blogs.', details: error.message });
    }
});

module.exports = {
    likeBlog,
    fetchLikes
}