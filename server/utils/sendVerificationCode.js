import { generateEmailOTPTemplate } from "./generateEmailOTPTemplate.js";
import { sendEmail } from "./sendEmail.js";
export const sendVerificationCode = async (verificationCode, email, sub, next) => {
  try {
    const message = generateEmailOTPTemplate(verificationCode, sub);
    await sendEmail({
      email: email,
      subject: "Verficaton Code Kosh",
      message,
    });
  } catch (err) {
    next(err);
  }
};
