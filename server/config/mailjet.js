import nodemailer from "nodemailer";
import { MAIL_USERNAME, MAIL_PASSWORD, MAIL_PORT, MAIL_HOST } from "./env.js";

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: false, // Use false for port 587 (STARTTLS)
  auth: {
    user: MAIL_USERNAME, // Use a dedicated email variable instead of MJ_APIKEY_PUBLIC
    pass: MAIL_PASSWORD, // Use a dedicated password variable instead of MJ_APIKEY_PRIVATE
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  }
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log("SMTP server connection error:", error);
  } else {
    console.log("SMTP server connection established successfully");
  }
});

export default transporter;

