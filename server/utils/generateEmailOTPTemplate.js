export const generateEmailOTPTemplate = (verificationCode, sub) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f6f8fa;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        background-color: #ffffff;
        margin: 40px auto;
        padding: 40px 30px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
      }
      h2 {
        color: #2c3e50;
      }
      p {
        font-size: 16px;
        color: #333333;
        line-height: 1.6;
      }
      .otp-box {
        background-color: #f1f1f1;
        padding: 15px 25px;
        text-align: center;
        border-radius: 6px;
        font-size: 28px;
        font-weight: bold;
        color: #2c3e50;
        letter-spacing: 5px;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        font-size: 13px;
        color: #aaaaaa;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Email Verification Code</h2>
      <p>Hello,</p>
      <p>${sub}</p>
      <div class="otp-box">${verificationCode}</div>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <p>Regards,<br />Kosh Team</p>
      <div class="footer">
        © ${new Date().getFullYear()} Kosh. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};
