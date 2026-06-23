const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const compileTemplate = (templateName, data) => {
    const filePath = path.join(__dirname, 'templates', `${templateName}.html`);
    let htmlContent = fs.readFileSync(filePath, 'utf8');

    for (const key in data) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, data[key]);
    }

    return htmlContent;
};

const sendCandidateOTP = async (email, otpCode) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    
    const html = compileTemplate('otp_candidate', { otp: otpCode });
    
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your JobsMarket account',
        html: html
    });
};

const sendCompanyPending = async (email, hrName, companyName) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    
    const html = compileTemplate('company_pending', { hrName, companyName });
    
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Company Registration Under Review - JobsMarket',
        html: html
    });
};

const sendCompanyActive = async (email, hrName, companyName) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    
    const html = compileTemplate('company_active', { hrName, companyName });
    
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Company Account is Now Active - JobsMarket',
        html: html
    });
};

const sendAccountBanned = async (email, userName, reason) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    
    const html = compileTemplate('account_banned', { userName, reason });
    
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Account Suspended - JobsMarket',
        html: html
    });
};

module.exports = {
    sendCandidateOTP,
    sendCompanyPending,
    sendCompanyActive,
    sendAccountBanned
};