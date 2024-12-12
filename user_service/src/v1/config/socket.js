const { userService, notificationService } = require('../services')
const { verifySocketToken } = require("../middlewares/verifyToken")
const socketIO = require('socket.io')
const logger = require('./logger')
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError');
const { customerProject } = require('../constants/user.constant')

const io = socketIO()
const socketApi = {}

socketApi.io = io

socketApi.io.use(async function(socket, next){
  try {
    if (socket.handshake.query && socket.handshake.query.token) {
      let user_detail = await verifySocketToken(socket.handshake?.query?.token); 
      socket.decoded = true;
      socket.user_detail = user_detail;
      next();
    } else {
      next(new Error('Authentication error'));
    }
  } catch(err) {
    next(new Error(err));
  }
})
.on('connection', function (socket) {
  logger.info(`socket connected ${socket.id}`)
  logger.info(`socket decoded ${socket.decoded}`)
  if (socket?.user_detail?._id) socket.join(socket?.user_detail?._id?.toString());

  socket.on('user_online', async (data) => {
    if (!socket?.user_detail?._id) return;
    socket.broadcast.emit("recipient_online", socket.user_detail._id.toString());
  })

  socket.on('user_offline', async (data) => {
    if (!socket?.user_detail?._id) return;
    const user = await userService.findByIdAndUpdate(socket.user_detail._id.toString(), { last_online_at: new Date() }, { last_online_at: 1 });
    socket.broadcast.emit("recipient_offline", user);
  })

  socket.on('check_online', async (user_id) => {
    if (!socket?.user_detail?._id) return;
    if (io.sockets.adapter.rooms.get(user_id)) {
      io.to(socket.id).emit("recipient_online", socket.user_detail._id.toString());
    } else {
      const user = await userService.getUserById(user_id, { last_online_at: 1 });
      io.to(socket.id).emit("recipient_offline", user);
    }
  })

  // socket.on('join_room', (room_id) => {
  //   socket.join(room_id);
  //   logger.info(`socket join_room: ${room_id}`)
  // })

  socket.on('leave_room', (room_id) => {
    socket.leave(room_id);
    logger.info(`socket leave_room: ${room_id}`)
  })

  socket.on('location', (data) => {
    io.emit('location', data)
  })

  socket.on('connect', () => {
    logger.info(`socket connected: ${socket.id}`)
  })

  socket.on('disconnect', async () => {
    logger.info(`socket disconnected: ${socket.id}`)
    if (!socket?.user_detail?._id) return;
    const user = await userService.findByIdAndUpdate(socket.user_detail._id.toString(), { last_online_at: new Date() }, { last_online_at: 1 });
    socket.broadcast.emit("recipient_offline", user);
  })

  socket.on('error', function (err) {
    logger.info(`received error from socket: ${socket.id}`)
    logger.error(err)
  })
})

module.exports = socketApi
