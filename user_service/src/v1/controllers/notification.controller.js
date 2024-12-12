const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')
const { notificationService, userService } = require('../services')
const pick = require('../utils/pick');
const { customerProject, followProject } = require('../constants/user.constant.js');


const listNotifications = catchAsync(async (req, res) => {
    try {
        let filter = {
            recipient_id: req.user._id,
            notification_type: 'feed',
            type: 'Customer',
            is_deleted: false
        }
        const body = [
        {
            $lookup: {
                from: "blogs",
                let: {
                    event: "$notification_event",
                    blogId: "$message_notification_data.blogId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$$event", ["create_blog", "like_blog", "comment_blog"]] },
                                    { $eq: ["$_id", "$$blogId"] },
                                    { $eq: ["$is_deleted", false] }
                                ]
                            }
                        }
                    }
                ],
                as: "blog_detail"
            }
        },
        {
            $lookup: {
                from: "comment_blogs",
                let: {
                    event: "$notification_event",
                    commentId: "$message_notification_data.commentId",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$$event", ["like_comment_blog", "reply_comment_blog"]] },
                                    { $eq: ["$_id", "$$commentId"] },
                                    { $eq: ["$is_deleted", false] }
                                ]
                            }
                        }
                    }
                ],
                as: "comment_detail"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "sender_id",
                foreignField: "_id",
                pipeline: [{ $project: customerProject }],
                as: "user_details"
            }
        },
        // {
        //     $match: {
        //         $expr: {
        //             $or: [
        //                 { $not: { $eq: ["$notification_event", "follower"] }},
        //                 { $gt: [{ $size: "$follow_details" }, 0] }
        //             ]
        //         }
        //     }
        // }
        {
            $set: {
                blog_detail: { $arrayElemAt: ["$blog_detail", 0] },
                comment_detail: { $arrayElemAt: ["$comment_detail", 0] }
            }
        }]
        const options = pick(req.query, ['sortBy', 'limit', 'page']);
        console.log("dddd",filter, options, body)
        const data = await notificationService.fetchNotificationsList(filter, options, body);
        res.status(httpStatus.OK).send(data)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to fetch notification.', details: error.message });
    }
});

const sendNotification = catchAsync(async (req, res) => {
    try {
        if (req.body?.mode == 'All') {
            const users = await userService.findUsersByFilter({ type: 'Customer' }, { _id: 1 });
            await Promise.all(users.map(async (each_user) => {
                let params = {
                    sender_id: [req.user._id],
                    recipient_id: each_user._id,
                    notification_type: req.body.notification_type,
                    notification_text: req.body.notification_text,
                    details: req.body.details,
                    created_by: req.user._id,
                    type: 'Admin'
                }
                await notificationService.saveNotification(params);
            }));
        } else if (req.body?.mode == 'Selected') {
            await Promise.all(req.body.recipient_ids.map(async (each_recipient_id) => {
                let params = {
                    sender_id: [req.user._id],
                    recipient_id: each_recipient_id,
                    notification_type: req.body.notification_type,
                    notification_text: req.body.notification_text,
                    details: req.body.details,
                    created_by: req.user._id,
                    type: 'Admin'
                }
                await notificationService.saveNotification(params);
            }));
        }
        res.status(httpStatus.OK).send('Notification sent successfully.')
        
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to awns notification.', details: error.message });
    }
});

const fetchNotifications = catchAsync(async (req, res) => {
    try {
        let filter = {
            type: 'Admin',
            is_deleted: false
        }
        let lookup_pipeline = [
            {
                $project: customerProject
            }
        ]
        if (req.query.searchText) {
            filter.$text = {
                $search: '\"' + req.query.searchText + '\"'
            }
            if (req.query.searchText) {
                lookup_pipeline = [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $regexMatch: { input: "$user_name", regex: req.query.searchText, options: "i" } },
                                    { $regexMatch: { input: "$full_name", regex: req.query.searchText, options: "i" } }
                                ]
                            }
                        }
                    },
                    {
                        $project: customerProject
                    }
                ]
            }
        }
        const body = [{
            $lookup: {
                from: "users",
                localField: "recipient_id",
                foreignField: "_id",
                pipeline: lookup_pipeline,
                as: "user_details"
            }
        },
        {
            $match: {
                $expr: { $gt: [{ $size: "$user_details" }, 0] }
            }
        },
        {
            $set: {
                user_details: { $arrayElemAt: ["$user_details", 0] }
            }
        }]
        const options = pick(req.query, ['sortBy', 'limit', 'page']);
        const data = await notificationService.fetchNotificationsList(filter, options, body);
        res.status(httpStatus.OK).send(data)
    } catch (error) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to fetch notification.', details: error.message });
    }
});

module.exports = {
    sendNotification,
    fetchNotifications,
    listNotifications
}

