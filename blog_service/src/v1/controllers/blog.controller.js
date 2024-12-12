const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')
const { blogService, reportBlogService, notificationService, configurationService } = require('../services')
const pick = require('../utils/pick')
const { customerProject } = require('../constants/user.constant.js');
const ObjectId = require('mongoose').Types.ObjectId;
const { User } = require("../models")
const socketApi = require('../config/socket.js')

const createBlog = catchAsync(async (req, res) => {
    try {
        let data = await blogService.createBlog(req.body, req.user._id);

        // notify user if they matched with profile categories
        if (req.body?.categories?.length) {
            const users = await User.find({ categories: { $in: req.body?.categories } }, { is_deleted: 1 });
            // notify recipient
            for (let each of users) {
                const text_message = `${req.user?.first_name} ${req.user?.last_name} has posted blog which matches your categories.`;
                const notification_params = {
                    notification_type: 'feed',
                    notification_event: 'category_blog',
                    message_notification_data: {
                        userId: new ObjectId(each),
                        blogId: data._id,
                        text_message: text_message
                    },
                    sender_id: [req.user._id],
                    recipient_id: each._id,
                    created_by: req.user._id,
                    type: 'Customer'
                }
                await notificationService.saveNotification(notification_params);
                if (socketApi?.io) socketApi.io.to(each._id?.toString()).emit("notify_recipient", { notification_details: notification_params });
            }
        }
        if (req.body?.tag_ids?.length) {
            for (let each of req.body.tag_ids) {
                // notify recipient
                const text_message = `${req.user?.first_name} ${req.user?.last_name} has tagged you in a blog.`;
                const notification_params = {
                    notification_type: 'feed',
                    notification_event: 'tag_blog',
                    message_notification_data: {
                        userId: new ObjectId(each),
                        blogId: data._id,
                        text_message: text_message
                    },
                    sender_id: [req.user._id],
                    recipient_id: each,
                    created_by: req.user._id,
                    type: 'Customer'
                }
                await notificationService.saveNotification(notification_params);
            }
        }
        res.status(httpStatus.OK).send({ message: 'Blog created successfully', data: data })
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to create blog.', details: error.message });
    }
});

const fetchBlogs = catchAsync(async (req, res) => {
    try {
        let filter = {}
        if (!req.baseUrl.includes('/admin')) {
            filter = {
                is_deleted: false
            }
        }
        if (req.query.searchText) {
            filter.$text = {
                $search: '\"' + req.query.searchText + '\"'
            }
        }

        if (req.query?.blog_ids) {
            filter._id = { $in: req.query.blog_ids.split(',')?.map(e => new ObjectId(e)) }
        }
        if (req.query.user_id) {
            filter.created_by = new ObjectId(req.query?.user_id)
        }
        const options = pick(req.query, ['sortBy', 'limit', 'page']);
        let body = [
            {
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
                    from: "users",
                    localField: "tag_ids",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: customerProject
                        }
                    ],
                    as: "tag_details"
                }
            },
            {
                $lookup: {
                    from: "like_blogs",
                    let: {
                        blog_id: "$_id"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$blog_id", "$$blog_id"] },
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
                    is_user_liked: { $gt: [{ $size: "$is_user_liked" }, 0] },
                }
            }]
        const data = await blogService.fetchBlogs(filter, options, body);
        res.status(httpStatus.OK).send(data)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get blogs.', details: error.message });
    }
});

const updateBlogById = catchAsync(async (req, res) => {
    try {
        const blog = await blogService.findOneBlogByFilter({ _id: req.params.blog_id, created_by: req.user._id, is_deleted: false }, { is_deleted: 1 })
        if (blog) {
            req.body.updated_at = new Date();
            await blogService.updateById(req.params.blog_id, { $set: req.body });
            res.status(httpStatus.OK).send('Blog updated successfully.')
        } else {
            res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update blog.', details: 'Blog not found.' });
        }
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update blog.', details: error.message });
    }
});

const blogById = catchAsync(async (req, res) => {
    try {
        let blog = await blogService.findOneBlogByFilter({ _id: req.params.blog_id })
        if (blog) {
            const user = await User.findById(blog.created_by, customerProject );
            blog = JSON.parse(JSON.stringify(blog));
            blog.user_detail = user;
            res.status(httpStatus.OK).send({ message: 'Blog details fetched successfully.', data: blog });
        } else {
            res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update blog.', details: 'Blog not found.' });
        }
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update blog.', details: error.message });
    }
});

const deleteBlogById = catchAsync(async (req, res) => {
    try {
        const blog = await blogService.findOneBlogByFilter({ _id: req.params.blog_id, created_by: req.user._id, is_deleted: false }, { is_deleted: 1 })
        if (blog) {
            await blogService.updateById(req.params.blog_id, { $set: { is_deleted: true } });
            notificationService.updateModeByFilter({ 'message_notification_data.blogId': blog._id, is_deleted: false }, { $set: { is_deleted: true, updated_at: new Date() }});
            res.status(httpStatus.OK).send('Blog deleted successfully.')
        } else {
            res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to delete blog.', details: 'Blog not found.' });
        }
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to delete blog.', details: error.message });
    }
});

const fetchSelfBlogs = catchAsync(async (req, res) => {
    try {
        let filter = {
            created_by: req.user._id,
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
                from: "like_blogs",
                let: {
                    blog_id: "$_id"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$blog_id", "$$blog_id"] },
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
                is_user_liked: { $gt: [{ $size: "$is_user_liked" }, 0] }
            }
        }]
        if (req.query.type) {
            filter.type = req.query.type;
        }
        const data = await blogService.fetchBlogs(filter, options, body);
        res.status(httpStatus.OK).send(data)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get blogs.', details: error.message });
    }
});

const reportBlog = catchAsync(async (req, res) => {
    try {
        const blog = await blogService.findOneBlogByFilter({ _id: req.params.blog_id, is_deleted: false }, { is_deleted: 1 })
        if (blog) {
            const report_blog = await reportBlogService.findOneReportBlogByFilter({ blog_id: req.params.blog_id, created_by: req.user._id, is_deleted: false });
            if (!report_blog) {
                let params = {
                    blog_id: req.params.blog_id
                }
                await reportBlogService.reportBlog(params, req.user._id);
                res.status(httpStatus.OK).send('Blog reported successfully.')
            } else {
                res.status(httpStatus.OK).send('Blog reported successfully.')
            }
        } else {
            res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to report blog.', details: 'Blog not found.' });
        }
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to report blog.', details: error.message });
    }
});

module.exports = {
    createBlog,
    deleteBlogById,
    updateBlogById,
    fetchBlogs,
    blogById,
    fetchSelfBlogs,
    reportBlog
}

