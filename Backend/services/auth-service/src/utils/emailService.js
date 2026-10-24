const nodemailer = require('nodemailer');

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_APP_PASSWORD;

  if (!emailUser || !emailPass) {
    console.warn('[Email Service] Warning: EMAIL_USER or EMAIL_APP_PASSWORD not set in environment.');
  }

  // Support custom transactional SMTP services (e.g. Resend, Brevo, SendGrid, Amazon SES)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

/**
 * Sends a 6-digit OTP email to user for password reset
 * @param {string} toEmail 
 * @param {string} otp 
 */
const sendOtpEmail = async (toEmail, otp) => {
  const transporter = createTransporter();
  const senderEmail = process.env.EMAIL_USER || 'no-reply@flipibook.com';
  const fromHeader = process.env.EMAIL_FROM_NAME
    ? `"${process.env.EMAIL_FROM_NAME}" <${senderEmail}>`
    : `"Flipbook" <${senderEmail}>`;

  const mailOptions = {
    from: fromHeader,
    to: toEmail,
    subject: 'Flipbook Password Reset Code',
    text: `Hello,\n\nWe received a request to reset your password for your Flipbook account (${toEmail}).\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this code, please safely ignore this email.\n\n© ${new Date().getFullYear()} Flipbook. All rights reserved.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #333333; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); }
          .header { background: linear-gradient(135deg, #EC5137 0%, #F07037 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .otp-card { background-color: #FFF5F2; border: 2px dashed #EC5137; border-radius: 10px; padding: 22px 16px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #EC5137; font-family: Consolas, 'Courier New', Courier, monospace; user-select: all; -webkit-user-select: all; -moz-user-select: all; -ms-user-select: all; cursor: pointer; display: inline-block; padding: 6px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #fed7cc; }
          .footer { background-color: #fafafa; padding: 18px 24px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Flipbook</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-top: 0;">Hello,</p>
            <p style="font-size: 14px; color: #555555;">We received a request to reset your password for your Flipbook account associated with <strong>${toEmail}</strong>.</p>
            <div class="otp-card">
              <span style="font-size: 12px; text-transform: uppercase; color: #777777; font-weight: 700; display: block; margin-bottom: 10px; letter-spacing: 0.5px;">Your Verification Code</span>
              <div class="otp-code" title="Click to select code">${otp}</div>
              <span style="font-size: 11px; color: #999999; display: block; margin-top: 8px;">(Click or tap code to select & copy) &bull; Valid for 10 minutes</span>
            </div>
            <p style="font-size: 13px; color: #777777;">If you did not request this code, please safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Flipbook. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Sends a 6-digit OTP email to user for account creation verification
 * @param {string} toEmail 
 * @param {string} otp 
 * @param {string} userName
 */
const sendSignupOtpEmail = async (toEmail, otp, userName = '') => {
  const transporter = createTransporter();
  const greeting = userName ? `Hello ${userName},` : 'Hello,';
  const senderEmail = process.env.EMAIL_USER || 'no-reply@flipibook.com';
  const fromHeader = process.env.EMAIL_FROM_NAME
    ? `"${process.env.EMAIL_FROM_NAME}" <${senderEmail}>`
    : `"Flipbook" <${senderEmail}>`;

  const mailOptions = {
    from: fromHeader,
    to: toEmail,
    subject: 'Verify your Flipbook account',
    text: `${greeting}\n\nThank you for registering with Flipbook. To complete your account creation, please verify your email address (${toEmail}).\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not initiate this registration, please safely ignore this email.\n\n© ${new Date().getFullYear()} Flipbook. All rights reserved.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #333333; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); }
          .header { background: linear-gradient(135deg, #FF725B 0%, #EC5137 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .otp-card { background-color: #FFF5F2; border: 2px dashed #EC5137; border-radius: 10px; padding: 22px 16px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #EC5137; font-family: Consolas, 'Courier New', Courier, monospace; user-select: all; -webkit-user-select: all; -moz-user-select: all; -ms-user-select: all; cursor: pointer; display: inline-block; padding: 6px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #fed7cc; }
          .footer { background-color: #fafafa; padding: 18px 24px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Flipbook</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-top: 0;">${greeting}</p>
            <p style="font-size: 14px; color: #555555;">Thank you for registering with Flipbook. To complete your account creation, please verify your email address (<strong>${toEmail}</strong>) using the verification code below:</p>
            <div class="otp-card">
              <span style="font-size: 12px; text-transform: uppercase; color: #777777; font-weight: 700; display: block; margin-bottom: 10px; letter-spacing: 0.5px;">Registration Verification Code</span>
              <div class="otp-code" title="Click to select code">${otp}</div>
              <span style="font-size: 11px; color: #999999; display: block; margin-top: 8px;">(Click or tap code to select & copy) &bull; Valid for 10 minutes</span>
            </div>
            <p style="font-size: 13px; color: #777777;">If you did not initiate this registration, please safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Flipbook. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail, sendSignupOtpEmail };

