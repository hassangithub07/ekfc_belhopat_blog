const mongoose = require('mongoose')
const { toJSON, paginate, deletion } = require('./plugins')
// const fcm = require("../services/notification.service");
// const OneSignal = require('@onesignal/node-onesignal');
// const config = require("../config/config");

const notificationSchema = new mongoose.Schema({
    notification_type: {
        type: String,
        required: true
    },
    notification_event: {
        type: String
    },
    notification_text: {
        type: String,
        required: false
    },
    sender_id: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    },
    recipient_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        default: 'Customer'
    },
    external_notification_id: {
        type: String,
    },
    details: {
        type: Object,
        required: false
    },
    message_notification_data: {
        type: Object,
        required: true
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
})

// when push notification is required

// notificationSchema.post("save", async function (doc, next) {
//     try {
//       let data = doc;
//       //PUSH NOTIFICATION SECTION
//       if (data.recipient_id) {
//         //   fcm.sendPush(
//         //       data.user_id,
//         //       data.notification_type,
//             //       data.notification_text,
//             //       data.details
//             //   );
//             const configuration = new OneSignal.createConfiguration({ restApiKey: config.one_signal_app_key });
//             const client = new OneSignal.DefaultApi(configuration);
//             const params = {
//                 conversation_id: '6686592eec01364f20703c87',
//                 displayName: `Test`,
//                 type: 'TEXT',
//                 text_message: 'text_message',
//                 file: {},
//                 first_name: 1
//             }
//             let messageNotificationData = {
//                 navigateTo: JSON.stringify({
//                     index: 2,
//                     routes: [
//                         { name: data?.notification_type == "feed" ? "Home" : "Conversations" },
//                         {
//                             name: data?.notification_type == "feed" ? "Profile" : "Messages",
//                             params: data.message_notification_data
//                         }
//                     ]
//                 })
//             };
//             if (data?.notification_type == "feed") messageNotificationData.userId = data.sender_id;
//             let notification = {
//                 app_id: config.one_signal_app_id,
//                 target_channel: "push",
//                 data: messageNotificationData,
//                 include_aliases: { external_id: [data.recipient_id] }
//             };
//             if (data.message_notification_data?.first_name) notification.headings = { en: data.message_notification_data?.first_name + ' ' + data.message_notification_data?.last_name }
//             if (data.message_notification_data?.displayName) notification.subtitle = { en: data.message_notification_data?.displayName }
//             if (data.notification_type == 'feed') {
//                 notification.contents = { en: data.message_notification_data?.text_message }
//             } else {
//                 if (data.message_notification_data?.type == 'TEXT') notification.contents = { en: data.message_notification_data?.text_message }
//                 else {
//                     notification.contents = { en: data.message_notification_data?.type }
//                     if (data.message_notification_data?.file?.url) {
//                         notification.big_picture = data.message_notification_data?.file?.url;
//                         notification.large_icon = data.message_notification_data?.file?.url;
//                     }
//                 }
                
//             }
//             const notificationResponse = await client.createNotification(notification);

//             await this.updateOne({ external_notification_id: notificationResponse.id });
//         }
//     } catch (err) {
//         console.error(err);
//     }
//     next();
//   });

notificationSchema.plugin(toJSON)
notificationSchema.plugin(paginate)
notificationSchema.plugin(deletion)

module.exports = mongoose.model('notifications', notificationSchema)