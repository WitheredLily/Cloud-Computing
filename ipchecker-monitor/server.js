const express = require("express");
const cron = require("node-cron");

const {
    createDatabase,
    getMetrics
} = require("./database");

const {
    runMonitor
} = require("./monitor");

const app = express();

createDatabase();

app.use(express.static("public"));


cron.schedule("* * * * *", () => {
    console.log("Running monitor...");
    runMonitor();
});


app.get("/api/metrics", (req, res) => {
    res.json(getMetrics());
});


app.get("/api/run", async (req, res) => {

    await runMonitor();

    res.json({
        status:"completed"
    });
});


app.listen(5500, () => {
    console.log("Monitor running on port 5500");
});