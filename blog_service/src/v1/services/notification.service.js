// const admin = require('firebase-admin');
const httpStatus = require('http-status')
const ApiError = require('../utils/ApiError');

const NotificationsModel = require('../models/notification.model');

const saveNotification = async (params) => {
  let notification = new NotificationsModel({
    notification_type: params.notification_type,
    notification_event: params.notification_event,
    details: params.details,
    message_notification_data: params.message_notification_data,
    notification_text: params.notification_text,
    sender_id: params.sender_id,
    recipient_id: params.recipient_id,
    created_by: params.sender_id,
    url: params.url,
    type: params.type || 'Customer'
  })

  return await notification.save();
};

/**
 * Push a notification to a single device
 * @param {Object} financeBody,
 * @returns {Promise<Object>}
 */
const sendPush = async (sub_id, title = '', body = '', data = {}) => {
  const notification = {
    title,
    body,
  };

  const message = {
    data,
    topic: `${process.env.TOPIC_FIREBASE}${sub_id}`,
    notification,
  };

  // const createRes = await admin.messaging().send(message);
  return createRes;
};

// List the Notifications with pagination
const fetchNotificationsList = async (filter, options, body) => {
  return await NotificationsModel.paginateLookup(filter, options, body);
};

/**
 * Send Notifications
 * @param {Object} body
 * @returns {Promise<Otp>}
 */
const sendNotifications = async function (conversation, message, recipient_ids) {
  try {
    let message_detail = {
      ...JSON.parse(JSON.stringify(message.user_detail)),
      ...message
    }
    if (conversation.type == 'group') message_detail.displayName = conversation.group_name;
    delete message_detail.user_detail;
    // const recipient_ids = conversation.participant_ids.map(e => e.toString()).filter(each => each != message.sender_id?.toString());
    // const contacts = await contactService.findContactsByFilter({ contact_id: { $in: recipient_ids }, user_id: message.sender_id, is_deleted: false });
    await Promise.all(recipient_ids.map(async (recipient_id) => {
      // if (contacts?.length) {
      //   const find_contact = contacts.find(e => e.contact_id?.toString() == recipient_id);
      //   if (find_contact) message_detail.display_user_name = find_contact.display_name;
      // }
      const notification_params = {
        notification_type: 'chat',
        // details: params.details,
        message_notification_data: message_detail,
        // notification_text: params.notification_text,
        sender_id: message.sender_id,
        recipient_id: recipient_id,
        created_by: message.sender_id,
        type: 'Customer'
      }
      await saveNotification(notification_params);
    }));
    
    return true;
  } catch (err) {
      throw new ApiError(httpStatus.NOT_FOUND, err.message);
  }
}

/**
 * Update NotificationsModel by filter
 * @param {Object} filter
 * @returns {Promise<NotificationsModel>}
 */
const updateModeByFilter = async (filter, set) => {
  try {
      return await NotificationsModel.updateOne(filter, set);
  } catch (err) {
      throw new ApiError(httpStatus.NOT_FOUND, err.message);
  }
};

const updateManyByFilter = async (filter, set) => {
  try {
      return await NotificationsModel.updateMany(filter, set);
  } catch (err) {
      throw new ApiError(httpStatus.NOT_FOUND, err.message);
  }
};

/**
 * Get notification by filter
 * @param {Object} filter
 * @param {Object} project
 * @returns {Promise<NotificationsModel>}
 */
const findOneNotificationByFilter = async (filter, project = {}) => {
  return await NotificationsModel.findOne(filter, project);
};

module.exports = {
  sendPush,
  saveNotification,
  fetchNotificationsList,
  sendNotifications,
  updateModeByFilter,
  updateManyByFilter,
  findOneNotificationByFilter
};
