require("dotenv").config();
const sgMail = require("@sendgrid/mail");
const { API_KEY, FROM } = process.env;

sgMail.setApiKey(API_KEY);

// const sgMailData = {
//   to: "sereega@ukr.net",
//   from: "myjavaname@gmail.com",
//   subject: "HW-6-EMAIL",
//   html: "<p>HELLO, I AM an EMAIL using SENDGRID MAIL</p>",
// };

// !=======================================!
// !  data should contain to, subject, html
// !=======================================!
const sendEmail = async function (data) {
  const sgMailData = { ...data, from: FROM };
  await sgMail
    .send(sgMailData)
    .then((result) => {
      console.log("SUCCESS: ", result);
      return true;
    })
    .catch((err) => {
      console.log("ERROR: ", err);
      return false;
    });
};
module.exports = sendEmail;
