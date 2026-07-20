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
    const filters = {
        amount: req.query.amount ? parseInt(req.query.amount, 10) : undefined,
        firstDate: req.query.firstDate,
        lastDate: req.query.lastDate,
        success: req.query.success,
        idMin: req.query.idMin ? parseInt(req.query.idMin, 10) : undefined,
        idMax: req.query.idMax ? parseInt(req.query.idMax, 10) : undefined,
        services: req.query.services
            ? req.query.services.split(",")
            : []
    };

    res.json(getMetrics(filters));
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