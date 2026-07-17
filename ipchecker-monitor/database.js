const Database = require("better-sqlite3");

const db = new Database("metrics.db");

function createDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS metrics (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               service TEXT,
                                               success INTEGER,
                                               response_time REAL,
                                               message TEXT,
                                               timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

function saveMetric(service, success, responseTime, message) {
    const stmt = db.prepare(`
        INSERT INTO metrics
        (service, success, response_time, message)
        VALUES (?, ?, ?, ?)
    `);

    stmt.run(service, success, responseTime, message);
}

function getMetrics() {
    const stmt = db.prepare(`
        SELECT *
        FROM metrics
        ORDER BY id DESC
        LIMIT 100
    `);

    return stmt.all();
}

module.exports = {
    createDatabase,
    saveMetric,
    getMetrics
};