/**
 * Test gửi email — chạy: node server/scripts/test-email.js your@gmail.com
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { sendResetPasswordEmail, getActiveProviders } = require("../src/utils/mailer");

const to = process.argv[2];
if (!to) {
  console.error("Usage: node server/scripts/test-email.js <email-nhan>");
  process.exit(1);
}

console.log("Providers:", getActiveProviders().join(", ") || "(none)");
console.log("RENDER:", process.env.RENDER || "no");
console.log("BREVO_API_KEY:", process.env.BREVO_API_KEY ? "set" : "missing");
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "set" : "missing");
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "set" : "missing");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "missing");
console.log("---");

sendResetPasswordEmail(to, "http://localhost:5173/reset-password/test-token")
  .then((ok) => {
    console.log(ok ? "✅ Gửi thành công (kiểm tra Inbox + Spam)" : "❌ Không gửi được — xem log phía trên");
    process.exit(ok ? 0 : 1);
  })
  .catch((err) => {
    console.error("❌", err.message);
    process.exit(1);
  });
