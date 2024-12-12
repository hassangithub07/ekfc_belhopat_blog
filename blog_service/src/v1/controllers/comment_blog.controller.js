const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')
const { commentBlogService, likeCommentBlogService, userService, blogService } = require('../services')
const pick = require('../utils/pick')
const { customerProject } = require('../constants/user.constant.js');
const ObjectId = require('mongoose').Types.ObjectId;
const { User } = require("../models")

const commentBlog = catchAsync(async (req, res) => {
    try {
        let body = {
            blog_id: req.params.blog_id,
            type: req.body.type,
            text_message: req.body.text_message,
        }
        if (req.body.file) body.file = req.body.file;
        if (req.body.reply_id) {
            body.is_reply = true;
            body.reply_to = req.body.reply_id;
        }
        let comment = await commentBlogService.createCommentBlog(body, req.user._id);
        commentBlogService.updateBlogCommentCount(req.params.blog_id);
        comment = JSON.parse(JSON.stringify(comment));
        comment.reply_counts = 0;
        comment.is_user_liked = false;
        comment.user_detail = await User.findById(comment.created_by, customerProject);
        
        res.status(httpStatus.OK).send({ message: `Blog commented successfully`, data: comment })
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to create blog.', details: error.message });
    }
});

const fetchComments = catchAsync(async (req, res) => {
    try {
        let filter = {
            blog_id: new ObjectId(req.params.blog_id),
            is_deleted: false,
            is_reply: req.query.reply_id ? true : false
        }
        if (req.query.reply_id) filter.reply_to = new ObjectId(req.query.reply_id);
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
            $lookup: {
                from: "comment_blogs",
                let: {
                    reply_by: "$_id",
                    is_reply: "$is_reply"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$$is_reply", false] },
                                    { $eq: ["$reply_to", "$$reply_by"] },
                                    { $eq: ["$is_deleted", false] }
                                ]
                            }
                        }
                    }
                ],
                as: "reply_counts"
            }
        },
        {
            $lookup: {
                from: "like_comment_blogs",
                let: {
                    comment_id: "$_id"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$comment_id", "$$comment_id"] },
                                    { $eq: ["$created_by", req.user._id] },
                                    { $eq: ["$is_deleted", false] }
                                ]
                            }
                        },
                    },
                    {
                        $project: { _id: 1 }
                    }
                ],
                as: "is_user_liked"
            }
        },
        {
            $set: {
                user_detail: { $arrayElemAt: ["$user_detail", 0] },
                reply_counts: { $size: "$reply_counts" },
                is_user_liked: { $gt: [{ $size: "$is_user_liked" }, 0] }
            }
        }]
        const data = await commentBlogService.fetchCommentsBlog(filter, options, body);
        res.status(httpStatus.OK).send(data)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get blogs.', details: error.message });
    }
});

const editCommentBlog = catchAsync(async (req, res) => {
    try {
        const comment = await commentBlogService.findOneCommentBlogByFilter({ _id: req.params.comment_id, created_by: req.user._id, is_deleted: false }, { is_deleted: 1 });
        if (comment) {
            req.body.updated_at = new Date();
            await commentBlogService.updateCommentBlogByFilter({ _id: req.params.comment_id, is_deleted: false }, { $set: req.body });
            res.status(httpStatus.OK).send('Comment Blog updated successfully.')
        } else {
            res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update comment blog.', details: 'Comment Blog not found.' });
        }
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to create blog.', details: error.message });
    }
});

const deleteCommentBlog = catchAsync(async (req, res) => {
    try {
        const comment = await commentBlogService.findOneCommentBlogByFilter({ _id: req.params.comment_id, created_by: req.user._id, is_deleted: false }, { blog_id: 1, is_deleted: 1 });
        if (comment) {
            await commentBlogService.updateCommentBlogByFilter({ _id: req.params.comment_id, is_deleted: false }, { $set: { is_deleted: true, updated_at: new Date() }});
            commentBlogService.updateBlogCommentCount(comment.blog_id);
            res.status(httpStatus.OK).send('Comment Blog deleted successfully.')
        } else {
            res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to delete comment blog.', details: 'Comment Blog not found.' });
        }
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to delete blog.', details: error.message });
    }
});

const likeCommentBlog = catchAsync(async (req, res) => {
    try {
        const is_deleted = req.params.like ? false : true;
        await likeCommentBlogService.updateModeByFilter({ comment_id: req.params.comment_id, created_by: req.user._id }, { $set: { is_deleted: is_deleted, updated_at: new Date() }}, { upsert: true });
        likeCommentBlogService.updateCommentLikeCount(req.params.comment_id);

        res.status(httpStatus.OK).send({ message: `Comment ${req.params.like ? 'liked' : 'unliked'} successfully` })
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to create blog.', details: error.message });
    }
});

const fetchLikes = catchAsync(async (req, res) => {
    try {
        let filter = {
            comment_id: new ObjectId(req.params.comment_id),
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
        const data = await likeCommentBlogService.fetchLikesBlog(filter, options, body);
        res.status(httpStatus.OK).send(data)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get like details.', details: error.message });
    }
});

module.exports = {
    commentBlog,
    fetchComments,
    editCommentBlog,
    deleteCommentBlog,
    likeCommentBlog,
    fetchLikes
}