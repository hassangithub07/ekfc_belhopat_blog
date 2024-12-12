const nodemailer = require("nodemailer");
const config = require("../config/config");
const { getEmailTemlate } = require("../utils/emailTemplate");

const { host, port, auth, from, } = config?.email?.smtp

// Use `true` for port 465, `false` for all other ports
const transporter = nodemailer.createTransport({
  host,
  port: port,
  secure: true,
  auth,
});

// async..await is not allowed in global scope, must use a wrapper
async function sendEmail({ to = "", subject = "", msg = "", bcc = "", html = "", text = "" }) {
  try {
    if (to != "") {
      const info = await transporter.sendMail({
        from, // sender address
        to: to,
        bcc: bcc, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html, // html body
      });
      return info;
    }
    else {
      console.error('Error to emails are empty');
    }
  } catch (error) {
    return error;
  }
}

const sendEmailInvitation = async (emailArr) => {
  try {
    // Send invitation email
    return await sendEmail({
      to: emailArr.join(", "),
      subject: "EKFC Application Chat Invitation",
      html: getEmailTemlate({
        subject: "EKFC Application Chat Invitation",
        recieverName: "",
        content: [
          "We are excited to invite you to our new chat application.",
          "Please click the link below to join the chat.",
          "We look forward to chatting with you !"
        ]
      }),
      text: "We are excited to invite you to our new chat application. Please click the link below to join the chat. We look forward to chatting with you !"
    });

  } catch (error) {
    return error
  }
}

module.exports = {
  sendEmail,
  sendEmailInvitation
};
