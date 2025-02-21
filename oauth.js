const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
require("dotenv").config();

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const TOKEN_PATH = path.join(__dirname, "token.json");


const client_id = process.env.GOOGLE_OAUTH_CLIENT_ID;
const client_secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const redirect_uris = [process.env.GOOGLE_OAUTH_REDIRECT_URI];

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

function getNewToken(callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });

    console.log("Authorize this app by visiting this URL:", authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question("Enter the code from that page here: ", (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error("Error retrieving access token", err);
            oAuth2Client.setCredentials(token);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
            console.log("Token stored to", TOKEN_PATH);
            callback(oAuth2Client);
        });
    });
}

function authorize(callback) {
    if (fs.existsSync(TOKEN_PATH)) {
        const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
        oAuth2Client.setCredentials(token);
        callback(oAuth2Client);
    } else {
        getNewToken(callback);
    }
}

module.exports = { authorize };
