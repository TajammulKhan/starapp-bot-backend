const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const { sendEmail } = require("./sendMail");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;
const responsesFile = "./db.json";

const loadResponses = () => {
    try {
        console.log("📂 Attempting to read db.json...");
        return JSON.parse(fs.readFileSync(responsesFile, "utf8"));
    } catch (error) {
        console.error("❌ Error reading db.json:", error);
        return { error: "Database file not found or corrupted" };
    }
};

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


app.listen(PORT, () => {
    console.log(`✅ StarApp Bot is running on port ${PORT}`);
});
