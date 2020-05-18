'use strict';

const sgMail = require('@sendgrid/mail');
const sendgridAPIKey = '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';

sgMail.setApiKey(sendgridAPIKey);

sgMail.send({
  to: 'elliotkim916@gmail.com',
  from: 'elliotkim916@gmail.com',
  subject: 'This is my first creation!',
  text: 'I hope this one actually gets to you..'
});