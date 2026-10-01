const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'fistotech04@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD || 'ghrn izix para kuyg'
    }
  });
};

/**
 * Sends a 6-digit OTP email to user
 * @param {string} toEmail 
 * @param {string} otp 
 */
const sendOtpEmail = async (toEmail, otp) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Flipbook Security" <${process.env.EMAIL_USER || 'fistotech04@gmail.com'}>`,
    to: toEmail,
    subject: `🔐 Your Flipbook Password Reset Code: ${otp}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; color: #333333; margin: 0; padding: 0; }
          .container { max-width: 520px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); }
          .header { background: linear-gradient(135deg, #EC5137 0%, #F07037 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .otp-card { background-color: #FFF5F2; border: 2px dashed #EC5137; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #EC5137; font-family: monospace; }
          .footer { background-color: #fafafa; padding: 18px 24px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Flipbook Security</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin-top: 0;">Hello,</p>
            <p style="font-size: 14px; color: #555555;">We received a request to reset your password for your Flipbook account associated with <strong>${toEmail}</strong>.</p>
            <div class="otp-card">
              <span style="font-size: 13px; text-transform: uppercase; color: #777777; font-weight: 600; display: block; margin-bottom: 6px;">One-Time Verification Code</span>
              <div class="otp-code">${otp}</div>
              <span style="font-size: 12px; color: #888888; display: block; margin-top: 6px;">Valid for 10 minutes</span>
            </div>
            <p style="font-size: 13px; color: #777777;">If you did not request this code, please ignore this email or contact support if you suspect unauthorized activity.</p>
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

module.exports = { sendOtpEmail };
