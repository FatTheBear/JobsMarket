const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "PRESENT" : "MISSING");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // gửi cho chính mình để test
    subject: 'JobsMarket Test Email',
    text: 'If you receive this, the email configuration is working perfectly.'
}).then(info => {
    console.log("Email sent successfully!", info.messageId);
    process.exit(0);
}).catch(err => {
    console.error("Failed to send email:", err);
    process.exit(1);
});
