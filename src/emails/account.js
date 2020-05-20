'use strict';

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'elliotkim916@gmail.com',
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name}.  Let me know how you get along with the app!`
  })
    .catch(e => console.log(e));
};

const sendCancellationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'elliotkim916@gmail.com',
    subject: 'We are sorry to see you go!',
    text: `Thank you for using our application ${name}, we hope to see you as a customer again in the future!  If its not much of a hassle, we would appreciate any feedback and reasons for your cancellation.  Thank you!`
  })
    .catch(e => console.log(e));
};

module.exports = {
  sendWelcomeEmail,
  sendCancellationEmail
};