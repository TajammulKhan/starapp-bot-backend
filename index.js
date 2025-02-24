const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const app = express();
const { sendEmail } = require("./sendMail");

require("dotenv").config();


app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;
const defaultPath = "/data/db.json";
const backupPath = "./db.json"; // Use a local backup

const responsesFile = fs.existsSync(defaultPath) ? defaultPath : backupPath;
console.log(`📂 Using responses file at: ${responsesFile}`);

const loadResponses = () => {
    try {
        console.log("📂 Attempting to read db.json...");
        return JSON.parse(fs.readFileSync(responsesFile, "utf8"));
    } catch (error) {
        console.error("❌ Error reading db.json:", error);
        return { error: "Database file not found or corrupted" };
    }
};


// Check if db.json exists, otherwise create it
if (!fs.existsSync(responsesFile)) {
    console.log("⚠️ db.json not found! Creating default file...");
    fs.writeFileSync(responsesFile, JSON.stringify({
        welcomeMessage: "Hello! I am your StarApp Bot 🤖. How can I assist you?",
        outcomes: []
    }, null, 2));
}

setInterval(() => {
    console.log("🔄 Bot is running...");
}, 30000); // Keep alive every 30 seconds


app.get("/", (req, res) => {
    try {
        const responses = loadResponses();
        res.json({ message: responses.welcomeMessage });
    } catch (error) {
        console.error("❌ Error loading responses:", error);
        res.status(500).json({ error: "Failed to load responses" });
    }
});


app.post("/send-email", (req, res) => {
    console.log("📩 Email sending is disabled for debugging.");
    const { email, subject, message } = req.body;
    if (!email || !subject || !message) {
        return res.status(400).json({ error: "Email, subject, and message are required." });
    }

    sendEmail(email, subject, message);
    res.json({ message: "Email sent successfully." });
});
app.get("/outcomes", (req, res) => {
    const responses = loadResponses();
    res.json({ outcomes: responses.outcomes || [] });
});

app.post("/add-outcome", (req, res) => {
    const { outcome } = req.body;
    if (!outcome) {
        return res.status(400).json({ error: "Outcome is required." });
    }

    const responses = loadResponses();
    responses.outcomes.push(outcome);
    fs.writeFileSync(responsesFile, JSON.stringify(responses, null, 2));

    sendEmail("user@example.com", "New Outcome Added", `You added: ${outcome}`);

    res.json({ message: "Outcome added successfully." });
});

app.post("/remove-outcome", (req, res) => {
    const { outcome } = req.body;
    if (!outcome) {
        return res.status(400).json({ error: "Outcome is required." });
    }

    const responses = loadResponses();
    responses.outcomes = responses.outcomes.filter((o) => o !== outcome);
    fs.writeFileSync(responsesFile, JSON.stringify(responses, null, 2));

    sendEmail("user@example.com", "Outcome Removed", `You removed: ${outcome}`);

    res.json({ message: "Outcome removed successfully." });
});

process.on("uncaughtException", (err) => {
    console.error("🚨 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
});



app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ StarApp Bot is running on port ${PORT}`);
});
