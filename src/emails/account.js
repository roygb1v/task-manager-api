const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'cjhroy@outlook.com',
    subject: 'Thanks for joining in!',
    text: `Welcome to the app, ${name}. Let me know hoe you get along with the app!`
  })
}

const cancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'cjhroy@outlook.com',
    subject: 'Cancellation Notice',
    text: 'We are sorry to see you go...'
  })
}

module.exports = {
  sendWelcomeEmail,
  cancelEmail
}