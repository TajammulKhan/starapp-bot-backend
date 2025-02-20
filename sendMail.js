const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const { authorize } = require("./oauth");

function sendEmail(toEmail, subject, text) {
    authorize(async (auth) => {
        const accessToken = await auth.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: "your-email@gmail.com",
                clientId: auth._clientId,
                clientSecret: auth._clientSecret,
                refreshToken: auth.credentials.refresh_token,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: '"Star Bot" <your-email@gmail.com>',
            to: toEmail,
            subject: subject,
            html: `<p>${text}</p>`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error sending email:", err);
            } else {
                console.log("Email sent:", info.response);
            }
        });
    });
}

module.exports = { sendEmail };
