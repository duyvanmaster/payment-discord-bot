const express = require('express');
const webhookRouter = require('./routes/webhook');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', webhookRouter);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Health check endpoint for Render
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

module.exports = app;
