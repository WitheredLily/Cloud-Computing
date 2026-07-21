const express = require("express");
const cron = require("node-cron");

const {createDatabase, getMetrics, getAlerts} = require("./database");

const {runMonitor} = require("./monitor");

const { monitoring } = require("./config.json");

const app = express();

createDatabase();

app.use(express.static("public"));


cron.schedule(monitoring.schedule, async () => {
    console.log("Running monitor...");

    try {
        await runMonitor();
    } catch (err) {
        console.error("Monitor error:", err);
    }
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

app.get("/api/alerts", (req,res)=>{
    const filters = {
        amount: req.query.amount ? parseInt(req.query.amount, 10) : undefined,
        firstCreatedDate: req.query.firstCreatedDate,
        lastCreatedDate: req.query.lastCreatedDate,
        firstResolvedDate: req.query.firstResolvedDate,
        lastResolvedDate: req.query.lastResolvedDate,
        resolved: req.query.resolved,
        idMin: req.query.idMin ? parseInt(req.query.idMin, 10) : undefined,
        idMax: req.query.idMax ? parseInt(req.query.idMax, 10) : undefined,
        services: req.query.services
            ? req.query.services.split(",")
            : []
    };
    res.json(getAlerts(filters));
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