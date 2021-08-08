let settings = require("../../config/config.js");
module.exports = {
  resetPasswordMail: function (data, callback) {
    send(data, callback);
  },
};
function send(toSend, callback) {
  console.log(toSend);
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(settings.sendGrid.SENDGRID_API_KEY);
  const msg = {
    to: toSend.email || 'test123@gmail.com', // Change to your recipient
    from: settings.sendGrid.FROM_EMAIL, // Change to your verified sender
    subject: 'Reset Password Link!',
    html: toSend.link,
  };
  sgMail
    .send(msg) 
    .then((res) => {
      callback(null, { message: "Email sent successfully"});
      console.log('Email sent', res);
    })
    .catch((error) => {
      callback(error, null);
      console.error(error)
    })
}
