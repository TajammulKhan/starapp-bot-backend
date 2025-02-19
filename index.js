require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const responsesFile = "./db.json";

// Load Responses
const loadResponses = () => JSON.parse(fs.readFileSync(responsesFile, "utf8"));

// API: Get Bot Welcome Message
app.get("/", (req, res) => {
    const responses = loadResponses();
    res.json({ message: responses.welcomeMessage });
});

// API: Get Progress Message
app.get("/progress", (req, res) => {
    const responses = loadResponses();
    res.json({ message: responses.progressMessage });
});

// API: Update Responses Dynamically
app.post("/update-response", (req, res) => {
    const { key, value } = req.body;
    if (!key || !value) {
        return res.status(400).json({ error: "Key and value are required." });
    }

    const responses = loadResponses();
    responses[key] = value;
    fs.writeFileSync(responsesFile, JSON.stringify(responses, null, 2));

    res.json({ message: "Response updated successfully." });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ StarApp Bot is running on port ${PORT}`);
});
