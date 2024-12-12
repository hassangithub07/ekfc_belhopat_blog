const httpStatus = require('http-status')
const catchAsync = require('../utils/catchAsync')
const { awsService, tokenService, userService, blogService } = require('../services')
const pick = require('../utils/pick')
const { customerProject, followProject } = require('../constants/user.constant.js');
const ObjectId = require('mongoose').Types.ObjectId;

const createUser = catchAsync(async (req, res) => {
  try {
    req.body.type = 'Admin';
    let data = await userService.createUser(req.body);
    // const tokens = await tokenService.generateAuthTokens(data);
    // awsService.sendWelcomeCustomerEmail(data, req.body.password);
    res.status(httpStatus.OK).send({ user: data })
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to create user.', details: error.message });
  }
});

const createCustomer = catchAsync(async (req, res) => {
  try {
    req.body.type = 'Customer';
    req.body.role_id = '65eac6c6de20168c4ea7392f';
    let data = await userService.createCustomer(req.body);
    // const tokens = await tokenService.generateAuthTokens(data);
    // awsService.sendWelcomeCustomerEmail(data, req.body.password);
    res.status(httpStatus.OK).send({ user: data })
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to create customer.', details: error.message });
  }
});


const listUsers = type => {
  return async (req, res) => {
    try {
      let filter = {
        _id: { $ne: req.user._id },
        is_deleted: false,
        type: type
      }
      if (req.query.searchText) {
        // filter.$text = {
        //   $search: '\"' + req.query.searchText + '\"'
        // }
        filter.$or = [
          { full_name: { $regex: req.query.searchText, $options: "i" } },
          { user_name: { $regex: req.query.searchText, $options: "i" } }
        ]
      }
      const options = pick(req.query, ['sortBy', 'limit', 'page']);
      let body = [{
        $project: {
          authentication: 0
        }
      },
      ]
      if (!req.baseUrl.includes("/admin")) {
        body = [{
          $project: customerProject
        },
        ]
      }
      const data = await userService.fetchUsers(filter, options, body);
      res.status(httpStatus.OK).send(data)
    } catch (error) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get users.', details: error.message });
    }
  };
};

const getUserById = type => {
  return async (req, res) => {
    try {
      let user_id = req?.user?._id;
      let customer_project = customerProject;
      if (type == 'Admin') {
        user_id = req?.params?.user_id;
        customer_project = {}
      }
      let user = await userService.findUserByFilter({ _id: user_id, is_deleted: false }, {});
      if (user) {
        // user = JSON.parse(JSON.stringify(user))
        // let blog_count = blogService.countBlog({ created_by: user._id, is_deleted: false });
        // await Promise.all([blog_count]).then(async function (values) {
        //   user.blog_count = values[0];
        // }).catch(error => {
        //   res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get user.', details: error.message });
        // });
        res.status(httpStatus.OK).send(user)
      } else {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get user.', details: 'User not found.' });
      }
    } catch (error) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get user.', details: error.message });
    }
  };
};

const updateUserById = type => {
  return async (req, res) => {
    try {
      let user_id = req?.user?._id;
      if (type == 'Admin') user_id = req?.params?.user_id;
      const user = await userService.findUserByFilter({ _id: user_id, is_deleted: false }, { first_name: 1, last_name: 1, user_name: 1 })
      if (user) {
          if (type == 'Customer') {
            let error_fields = (!user.first_name && !req.body.first_name) ? 'first_name' : ((!user.last_name && !req.body.last_name) ? 'last_name' : (!user.user_name && !req.body.user_name) ? 'user_name': '')
            if (error_fields) {
              throw new Error(`Please pass ${error_fields}.`)
            }
            req.body.is_profile_updated = true;
          }
          const updated_user = await userService.findByIdAndUpdate(user_id, req.body);
          res.status(httpStatus.OK).send({ status: true, message: 'Users updated successfully.', user: updated_user })
      } else {
          res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update user.', details: 'User not found.' });
      }
  } catch (error) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update user.', details: error.message });
  }
  };
};

const getCustomerById = catchAsync(async (req, res) => {
  try {
      const user = await userService.findUserByFilter({ _id: req.user._id, is_deleted: false })
      if (user) {
          res.status(httpStatus.OK).send({ status: true, user })
      } else {
          res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update user.', details: 'User not found.' });
      }
  } catch (error) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update user.', details: error.message });
  }
});

const updateCustomerById = catchAsync(async (req, res) => {
  try {
      const user = await userService.findUserByFilter({ _id: req.user._id, is_deleted: false }, { user_name: 1 })
      if (user) {
          await userService.updateById(req.user._id, req.body);
          res.status(httpStatus.OK).send({ status: true, message: 'User updated successfully.' })
      } else {
          res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update user.', details: 'User not found.' });
      }
  } catch (error) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to update user.', details: error.message });
  }
});

const deleteUserById = catchAsync(async (req, res) => {
  try {
      const user = await userService.findUserByFilter({ _id: req.params.user_id, is_deleted: false }, { user_name: 1 })
      if (user) {
          await userService.updateById(req.params.user_id, { is_deleted: true });
          res.status(httpStatus.OK).send({ status: true, message: 'User deleted successfully.' })
      } else {
          res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to delete user.', details: 'User not found.' });
      }
  } catch (error) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to delete user.', details: error.message });
  }
});

const uploadFilesAws = catchAsync(async (req, res) => {
  try {
    let files = await userService.uploadFile(req.files.file, req.body.document_name = '', { _id: req.user._id, name: `${req.user.first_name} ${req.user.last_name}`.trim() }, req.query?.is_thumbnail_required)
    res.status(httpStatus.OK).json({
      status: "ok",
      message: "Files uploaded successfully.",
      data: files
    })
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({
      status: "fail",
      message: "Could not upload files.",
      error: error.message
    })
  }
})

const downloadFile = catchAsync(async (req, res) => {
  try {
    let file = await userService.downloadFile(req.params.document_name);
    res.setHeader('Content-disposition', `attachment; filename=${req.params.document_name}`)
    res.setHeader('Content-type', file.ContentType)
    res.send(file.Body)
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({
      status: "fail",
      message: "Could not download file.",
      error: error.message
    })
  }
})

const verifyEmail = catchAsync(async (req, res) => {
  try {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!req.params.email || !(new RegExp(emailRegex).test(req.params.email))) {
      res.status(httpStatus.OK).send({ status: false, message: 'Invalid email.' });
      return;
    }
    const user = await userService.findUserByFilter({ email: { $regex: `^${req.params.email}$`, $options: 'i' }, _id: { $ne: req.user._id }, }, { status: 1 });
    if (user) res.status(httpStatus.OK).send({ status: false, message: 'E-Mail already exists.' });
    else res.status(httpStatus.OK).send({ status: true, message: 'E-Mail is available.' });
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to validate.', details: error.message });
  }
});

const customerByUserId = catchAsync(async (req, res) => {
  try {
    let user = await userService.findUserByFilter({ _id: req.params.user_id, is_deleted: false }, customerProject);
    if (user) {
      user = JSON.parse(JSON.stringify(user))
      let filter = {
        following_id: { $in: [new ObjectId(req.params.user_id), req.user._id]},
        status: 'Accepted',
        is_deleted: false
      }
      let body = [
        {
          $group: {
            _id: "$follower_id",
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            count: { $eq: 2 }
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            pipeline: [
              {
                $project: customerProject
              }
            ],
            as: "user_detail"
          },
        },
        {
          $project: {
            user_detail: { $arrayElemAt: ["$user_detail", 0] },
          }
        }
      ]
      const options = {
        sortBy: "_id:-1",
        limit: 2,
        page: 1
      }
      let blog_count = blogService.countBlog({ created_by: user._id, is_deleted: false });
      await Promise.all([blog_count]).then(async function (values) {
        user.blog_count = values[0];
      }).catch(error => {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get user.', details: error.message });
      });
      res.status(httpStatus.OK).send({ data: user })
    } else {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get user.', details: 'User not found.' });
    }
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get details.', details: error.message });
  }
});

const listSuggestedUsers = catchAsync(async (req, res) => {
  try {
    let filter = {
      _id: { $ne: req.user._id },
      is_deleted: false,
      type: 'Customer'
    }
    if (filter.type == 'Customer') filter.is_profile_updated = true;
    if (req.query.searchText) {
      // filter.$text = {
      //   $search: '\"' + req.query.searchText + '\"'
      // }
      // partial search
      filter.$or = [
        { full_name: { $regex: req.query.searchText, $options: "i" } },
        { user_name: { $regex: req.query.searchText, $options: "i" } }
      ]
    }
    const options = {
      sortBy: "_id:1",
      limit: 5,
      page: 1
    }
    let body = [
      {
        $project: customerProject
      },
      {
        $lookup: {
          from: "follows",
          let: {
            user_id: "$_id"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$following_id", req.user._id] },
                    { $eq: ["$follower_id", "$$user_id"] },
                    { $eq: ["$status", "Accepted"] },
                    { $eq: ["$is_deleted", false] },
                  ]
                }
              }
            },
            {
              $project: { status: 1 }
            }
          ],
          as: "follow_detail"
        }
      }
    ]
    let follow_body = [
      ...body, 
      {
        $match: {
          $expr: { $gt: [{ $size: "$follow_detail" }, 0] }
        }
      },
      {
        $project: {
          follow_detail: 0
        }
      }
    ]
    const follow_data = await userService.fetchUsers(filter, options, follow_body);
    const unfollow_body = [
      ...body, 
      {
        $match: {
          $expr: { $eq: [{ $size: "$follow_detail" }, 0] }
        }
      },
      {
        $project: {
          follow_detail: 0
        }
      }
    ]
    const unfollow_data = await userService.fetchUsers(filter, options, unfollow_body);
    res.status(httpStatus.OK).send({ follow_data: follow_data.results, unfollow_data: unfollow_data.results })
  } catch (error) {
    res.status(httpStatus.BAD_REQUEST).json({ message: 'Failed to get details.', details: error.message });
  }
});

module.exports = {
  createUser,
  createCustomer,
  listUsers,
  getUserById,
  updateUserById,
  getCustomerById,
  deleteUserById,
  updateCustomerById,
  uploadFilesAws,
  downloadFile,
  verifyEmail,
  customerByUserId,
  listSuggestedUsers
}