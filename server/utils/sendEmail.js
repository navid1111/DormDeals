const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send verification email
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"Student Marketplace" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Student Email - Student Marketplace',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Student Marketplace, ${firstName}!</h2>
          <p>Thank you for registering with Student Marketplace. To complete your registration, please verify your student email address.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">Student Marketplace - Connecting Students Safely</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Student Marketplace" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Student Marketplace!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Email Verified Successfully!</h2>
          <p>Hi ${firstName},</p>
          <p>Your student email has been verified successfully. You can now:</p>
          <ul>
            <li>Complete your profile setup</li>
            <li>Start buying and selling items</li>
            <li>Connect with fellow students</li>
            <li>Access exclusive student deals</li>
          </ul>
          <p>Start exploring the marketplace and connect with your campus community!</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">Student Marketplace - Your Campus Community</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail
};