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
    
    const html = compileTemplate('otp_verify', { otp: otpCode });
    
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
    
    const html = compileTemplate('user_banned', { userName, reason });
    
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Account Suspended - JobsMarket',
        html: html
    });
};

const sendChangePasswordOTP = async (email, otpCode) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Change Password OTP - JobsMarket',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e1e4e8; border-radius: 8px;">
                <h2 style="color: #01796F; border-bottom: 1px solid #e1e4e8; padding-bottom: 10px;">Change Password Request</h2>
                <p>You requested to change your password. Use the following One-Time Password (OTP) to proceed:</p>
                <div style="text-align: center; margin: 20px 0; padding: 10px; background-color: #f1f3f4; border-radius: 6px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #01796F;">
                    ${otpCode}
                </div>
                <p style="color: #586069; font-size: 13px;">This code is valid for 5 minutes. If you did not request a password change, please ignore this email.</p>
            </div>
        `
    });
};

module.exports = {
    sendCandidateOTP,
    sendCompanyPending,
    sendCompanyActive,
    sendAccountBanned,
    sendChangePasswordOTP
};