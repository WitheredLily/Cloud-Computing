const Database = require("better-sqlite3");

const db = new Database("metrics.db");

function createDatabase() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS metrics (
                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                               service TEXT NOT NULL,
                                               success INTEGER NOT NULL,
                                               response_time REAL NOT NULL,
                                               message TEXT,
                                               timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_metrics_timestamp
            ON metrics(timestamp);

        CREATE INDEX IF NOT EXISTS idx_metrics_service
            ON metrics(service);
    `);

}
createDatabase()

const insertMetric = db.prepare(`
    INSERT INTO metrics
    (service, success, response_time, message)
    VALUES (?, ?, ?, ?)
`);

function saveMetric(service, success, responseTime, message) {
    insertMetric.run(
        service,
        success ? 1 : 0,
        responseTime,
        message,
    );
}

function getMetrics({
                        amount = 100,
                        firstDate,
                        lastDate,
                        success,
                        idMin,
                        idMax,
                        services = [],
                    } = {}) {

    let sql = `
        SELECT *
        FROM metrics
        WHERE 1=1
    `;

    const params = [];

    if (success !== undefined) {
        sql += " AND success = ?";
        params.push(success);
    }

    if (idMin !== undefined) {
        sql += " AND id >= ?";
        params.push(idMin);
    }

    if (idMax !== undefined) {
        sql += " AND id <= ?";
        params.push(idMax);
    }

    if (firstDate) {
        sql += " AND timestamp >= ?";
        params.push(firstDate);
    }

    if (lastDate) {
        sql += " AND timestamp <= ?";
        params.push(lastDate);
    }

    if (services.length) {
        sql += ` AND service IN (${services.map(() => "?").join(",")})`;
        params.push(...services);
    }

    sql += `
        ORDER BY timestamp DESC
        LIMIT ?
    `;
    params.push(amount);

    return db.prepare(sql).all(...params);
}


module.exports = {
    createDatabase,
    saveMetric,
    getMetrics
}